export interface Task {
  id: string;
  title: string;
  description: string;
  due_time?: string; // Time string (HH:MM:SS)
  due_date: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  created_at: Date;
  updated_at: string;
  completed_at: string | null;
  category_id?: string | null;
  user_id: string;
  is_archived: boolean;
  archived_at: string | null;
}

// backend/src/types/task.ts (or similar)
export interface TaskAnalytics {
  completion_rate: number;
  tasks_by_status: {
    todo: number;
    in_progress: number;
    done: number;
  };
  tasks_by_priority: {
    low: number;
    medium: number;
    high: number;
  };
  weekly_completion: {
    week: string;
    count: number;
  }[];
  weekly_archived?: {
    week: string;
    count: number
  }[];
}