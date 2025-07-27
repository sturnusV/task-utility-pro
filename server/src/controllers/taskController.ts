// backend/src/controllers/taskController.ts
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const tasks = await taskService.getAllTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const analytics = await taskService.getTaskAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const task = await taskService.createTask({
      ...req.body,
      user_id: req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existingTask = await taskService.getTaskById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (existingTask.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const updatedTask = await taskService.updateTask(
      req.params.id, 
      req.body,
      req.user.id
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existingTask = await taskService.getTaskById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (existingTask.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await taskService.deleteTask(req.params.id, req.user.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};

export const searchTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const tasks = await taskService.searchTasks(
      req.query.q as string, 
      req.user.id
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error searching tasks' });
  }
};

// backend/src/controllers/taskController.ts
// Add these new controller methods
export const archiveTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existingTask = await taskService.getTaskById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (existingTask.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (existingTask.status !== 'done') {
      return res.status(400).json({ message: 'Only completed tasks can be archived' });
    }
    
    const archivedTask = await taskService.archiveTask(req.params.id, req.user.id);
    res.json(archivedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error archiving task' });
  }
};

export const unarchiveTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const existingTask = await taskService.getTaskById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (existingTask.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const unarchivedTask = await taskService.unarchiveTask(req.params.id, req.user.id);
    res.json(unarchivedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error unarchiving task' });
  }
};

export const getArchivedTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const tasks = await taskService.getArchivedTasks(req.user.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching archived tasks' });
  }
};