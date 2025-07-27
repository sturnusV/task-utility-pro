// Define your Task and TaskAnalytics interfaces
// src/types/task.d.ts (You might want to put this in a separate types file)
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAnalytics {
  totalTasks: number;
  tasksByStatus: {
    todo: number;
    'in-progress': number;
    done: number;
  };
  overdueTasks: number;
}
