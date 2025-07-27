// backend/src/services/taskService.ts
import type { Task } from '../types/task';
import type { TaskAnalytics } from '../types/task';
import * as db from '../utils/database';

// Helper function to safely convert userId string to number
const parseUserId = (userId: string): number => {
  const numericUserId = parseInt(userId, 10);
  if (isNaN(numericUserId)) {
    // Log or throw a more specific error if userId is not a valid number string
    console.error(`Error: Invalid numeric userId received: ${userId}`);
    throw new Error('Invalid user ID format.');
  }
  return numericUserId;
};


export const getAllTasks = async (userId: string): Promise<Task[]> => {
  const numericUserId = parseUserId(userId);
  const result = await db.query<Task>(
    'SELECT * FROM tasks WHERE user_id = $1 AND is_archived = false ORDER BY created_at DESC',
    [numericUserId]
  );
  return result.rows;
};

export const getTaskAnalytics = async (userId: string): Promise<TaskAnalytics> => {
  try {
    const numericUserId = parseUserId(userId);

    // Completion rate calculation
    // Note: node-postgres often returns NUMERIC types as strings,
    // so we specifically type completion_rate as string | null
    const completionResult = await db.query<{ completion_rate: string | null }>(
      `SELECT
      (COUNT(CASE WHEN status = 'done' THEN 1 END) * 100.0 /
      NULLIF(COUNT(*), 0))::numeric as completion_rate
      FROM tasks
      WHERE user_id = $1`,
      [numericUserId]
    );

    // Tasks by status
    const statusResult = await db.query<{ status: string, count: number }>(
      `SELECT status, COUNT(*) as count
      FROM tasks
      WHERE user_id = $1 AND is_archived = FALSE
      GROUP BY status`,
      [numericUserId]
    );

    // Tasks by priority
    const priorityResult = await db.query<{ priority: string, count: number }>(
      `SELECT priority, COUNT(*) as count
      FROM tasks
      WHERE user_id = $1 AND is_archived = FALSE
      GROUP BY priority`,
      [numericUserId]
    );

    // Weekly completion (example - adjust as needed)
    const weeklyResult = await db.query<{ week: number, count: number }>(
      `SELECT
        EXTRACT(WEEK FROM completed_at) as week,
        COUNT(*) as count
      FROM tasks
      WHERE user_id = $1 AND status = 'done' AND completed_at IS NOT NULL
      GROUP BY EXTRACT(WEEK FROM completed_at), EXTRACT(YEAR FROM completed_at)
      ORDER BY EXTRACT(YEAR FROM completed_at), week`,
      [numericUserId]
    );

    const weeklyArchivedResult = await db.query<{ week: number, count: number }>(
      `SELECT
      EXTRACT(WEEK FROM archived_at) as week,
      COUNT(*) as count
      FROM tasks
      WHERE user_id = $1 AND is_archived = true AND archived_at IS NOT NULL
      GROUP BY EXTRACT(WEEK FROM archived_at), EXTRACT(YEAR FROM archived_at)
      ORDER BY EXTRACT(YEAR FROM archived_at), week`,
      [numericUserId]
    );

    const weeklyArchivedData = weeklyArchivedResult.rows.map(row => ({
      week: row.week.toString(),
      count: row.count
    }));

    // --- Process results ---
    const statusCounts = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, { todo: 0, in_progress: 0, done: 0 } as Record<string, number>);

    const priorityCounts = priorityResult.rows.reduce((acc, row) => {
      acc[row.priority] = row.count;
      return acc;
    }, { low: 0, medium: 0, high: 0 } as Record<string, number>);

    const weeklyCompletionData = weeklyResult.rows.map(row => ({
      week: row.week.toString(),
      count: row.count
    }));

    // Handle completion_rate: Convert from string (if not null/undefined) to number with fixed decimals
    const rawCompletionRate = completionResult.rows[0]?.completion_rate;

    // First, ensure it's a valid string number, then parse to float, then toFixed, then parse back to float for return
    let finalCompletionRate: number;
    if (rawCompletionRate !== null && rawCompletionRate !== undefined) {
      try {
        const floatRate = parseFloat(rawCompletionRate);
        if (!isNaN(floatRate)) {
          finalCompletionRate = parseFloat(floatRate.toFixed(2));
        } else {
          // If parseFloat results in NaN, default to 0
          finalCompletionRate = 0;
          console.warn(`Warning: completion_rate "${rawCompletionRate}" could not be parsed to a number. Defaulting to 0.`);
        }
      } catch (parseError) {
        // Fallback for any parsing errors
        finalCompletionRate = 0;
        console.error(`Error parsing completion_rate "${rawCompletionRate}":`, parseError);
      }
    } else {
      // If rawCompletionRate is null or undefined, default to 0
      finalCompletionRate = 0;
    }

    return {
      completion_rate: finalCompletionRate,
      tasks_by_status: {
        todo: statusCounts.todo,
        in_progress: statusCounts.in_progress,
        done: statusCounts.done
      },
      tasks_by_priority: {
        low: priorityCounts.low,
        medium: priorityCounts.medium,
        high: priorityCounts.high
      },
      weekly_completion: weeklyCompletionData,
      weekly_archived: weeklyArchivedData
    };
  } catch (error) {
    console.error('Error within getTaskAnalytics service function:', error);
    throw error;
  }
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  // Assuming task IDs are numbers, so convert if necessary.
  // If your task IDs are UUIDs (strings), remove the parseInt.
  const numericTaskId = parseInt(id, 10);
  if (isNaN(numericTaskId)) {
    console.error(`Error: Invalid task ID received: ${id}`);
    throw new Error('Invalid task ID format.');
  }

  const result = await db.query<Task>(
    'SELECT * FROM tasks WHERE id = $1',
    [numericTaskId]
  );
  return result.rows[0] || null;
};

export const createTask = async (
  taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> => {
  const { title, description, due_date, due_time, priority, status, user_id } = taskData;
  const result = await db.query<Task>(
    `INSERT INTO tasks (title, description, due_date, due_time, priority, status, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
    [title, description, due_date, due_time, priority, status, user_id]
  );
  return result.rows[0];
};

export const updateTask = async (
  id: string,
  taskData: Partial<Task>,
  userId: string
): Promise<Task | null> => {
  const numericUserId = parseUserId(userId);
  const numericTaskId = parseInt(id, 10);

  if (isNaN(numericTaskId)) {
    console.error(`Error: Invalid task ID for update: ${id}`);
    throw new Error('Invalid task ID format.');
  }

  const { title, description, due_date, due_time, priority, status } = taskData;

  const result = await db.query<Task>(
    `UPDATE tasks
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          due_date = COALESCE($3, due_date),
          due_time = COALESCE($4, due_time),
          priority = COALESCE($5, priority),
          status = COALESCE($6, status),
          updated_at = NOW(),
          completed_at = CASE 
            WHEN $6 = 'done' AND completed_at IS NULL THEN NOW()
            WHEN $6 != 'done' THEN NULL
            ELSE completed_at
          END
      WHERE id = $7 AND user_id = $8
      RETURNING *`,
    [title, description, due_date, due_time, priority, status, numericTaskId, numericUserId]
  );
  return result.rows[0] || null;
};

export const deleteTask = async (
  id: string, // Task ID
  userId: string // User ID
): Promise<boolean> => {
  const numericUserId = parseUserId(userId);
  const numericTaskId = parseInt(id, 10); // Also parse task ID if it's numeric in DB

  if (isNaN(numericTaskId)) {
    console.error(`Error: Invalid task ID for delete: ${id}`);
    throw new Error('Invalid task ID format.');
  }

  const result = await db.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
    [numericTaskId, numericUserId]
  );
  return (result.rowCount ?? 0) > 0;
};

export const searchTasks = async (
  query: string,
  userId: string // User ID
): Promise<Task[]> => {
  const numericUserId = parseUserId(userId);
  const result = await db.query<Task>(
    `SELECT * FROM tasks
      WHERE user_id = $1 AND
      to_tsvector('english', title || ' ' || description) @@ to_tsquery('english', $2)`,
    [numericUserId, query + ':*']
  );
  return result.rows;
};

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  return getAllTasks(userId);
};

// Add to your existing taskService.ts
export const archiveTask = async (taskId: string, userId: string): Promise<Task | null> => {
  const numericUserId = parseUserId(userId);
  const numericTaskId = parseInt(taskId, 10);

  const result = await db.query<Task>(
    `UPDATE tasks 
     SET is_archived = true, 
         archived_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'done'
     RETURNING *`,
    [numericTaskId, numericUserId]
  );
  return result.rows[0] || null;
};

export const unarchiveTask = async (taskId: string, userId: string): Promise<Task | null> => {
  const numericUserId = parseUserId(userId);
  const numericTaskId = parseInt(taskId, 10);

  const result = await db.query<Task>(
    `UPDATE tasks 
     SET is_archived = false, 
         archived_at = NULL
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [numericTaskId, numericUserId]
  );
  return result.rows[0] || null;
};

export const getArchivedTasks = async (userId: string): Promise<Task[]> => {
  const numericUserId = parseUserId(userId);
  const result = await db.query<Task>(
    'SELECT * FROM tasks WHERE user_id = $1 AND is_archived = true ORDER BY archived_at DESC',
    [numericUserId]
  );
  return result.rows;
};