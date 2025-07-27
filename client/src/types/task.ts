export interface Task {
  id: string;
  title: string;
  description: string;
  due_time?: string | null;
  due_date: string | Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  created_at: string | Date;
  updated_at: string | Date;
  completed_at?: string | Date | null;
  category_id?: string | null;
  user_id: string;
  is_archived: boolean;
  archived_at: string | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string | Date;
}

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
  weekly_completion: Array<{
    week: string;
    count: number;
  }>;
  weekly_archived?: {
    week: string; 
    count: number 
  }[];
}