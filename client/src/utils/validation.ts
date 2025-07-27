import type { Task } from '../types/task';

interface TaskFormErrors {
  title?: string;
  due_date?: string;
}

export const validateTaskForm = (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): TaskFormErrors => {
  const errors: TaskFormErrors = {};
  
  if (!task.title.trim()) {
    errors.title = 'Title is required';
  } else if (task.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (!task.due_date) {
    errors.due_date = 'Due date is required';
  } else if (new Date(task.due_date) < new Date()) {
    errors.due_date = 'Due date must be in the future';
  }
  
  return errors;
};