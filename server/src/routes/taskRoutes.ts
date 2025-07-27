// backend/src/routes/taskRoutes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskAnalytics,
  searchTasks,
  archiveTask,
  unarchiveTask,
  getArchivedTasks // Add this new controller
} from '../controllers/taskController';

const router = Router();

router.use(authenticate);

router.get('/archived', getArchivedTasks); // 👈 move this BEFORE :id

router.get('/', getTasks);
router.get('/search', searchTasks);
router.get('/analytics', getTaskAnalytics);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/archive', archiveTask);
router.post('/:id/unarchive', unarchiveTask);
router.get('/:id', getTask); // 👈 move this BELOW /archived


export default router;