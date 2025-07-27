// src/api/taskService.ts
import api from './api'; // Your configured Axios instance
import type { Task, TaskAnalytics } from '../types/task';

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks');
  return response.data;
};

// Add this new method to get archived tasks
export const getArchivedTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/archived');
  return response.data;
};

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const getTaskAnalytics = async (): Promise<TaskAnalytics> => {
  const response = await api.get('/tasks/analytics');
  return response.data;
};

export const getTask = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const searchTasks = async (query: string): Promise<Task[]> => {
  const response = await api.get('/tasks/search', {
    params: { q: query }
  });
  return response.data;
};

export const archiveTask = async (taskId: string): Promise<Task> => {
  const response = await api.post(`/tasks/${taskId}/archive`);
  return response.data;
};

export const unarchiveTask = async (taskId: string): Promise<Task> => {
  const response = await api.post(`/tasks/${taskId}/unarchive`);
  return response.data;
};