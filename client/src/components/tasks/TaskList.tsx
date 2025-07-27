import type { Task } from '../../types/task';
import TaskItem from './TaskItem';
import type { SortOption } from '../../pages/DashboardPage';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void; // Changed from Promise<void> to void
  onUpdateTask: (taskId: string, updatedTaskData: Partial<Task>) => Promise<void>;
  onArchiveTask?: (taskId: string) => void; // Changed from Promise<void> to void
  hideDone: boolean;
  sortBy: SortOption;
}

export default function TaskList({
  tasks,
  onDeleteTask,
  onUpdateTask,
  onArchiveTask,
  hideDone,
  sortBy
}: TaskListProps) {
  // Filter tasks based on hideDone setting
  const filteredTasks = hideDone
    ? tasks.filter(task => task.status !== 'done')
    : [...tasks];

  // Sort tasks based on sortBy setting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'nearest-due':
        return (a.due_date ? new Date(a.due_date).getTime() : Infinity) -
          (b.due_date ? new Date(b.due_date).getTime() : Infinity);
      case 'farthest-due':
        return (b.due_date ? new Date(b.due_date).getTime() : 0) -
          (a.due_date ? new Date(a.due_date).getTime() : 0);
      case 'completed-newest':
        if (a.status === 'done' && b.status === 'done') {
          return new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime();
        }
        return a.status === 'done' ? -1 : b.status === 'done' ? 1 : 0;
      case 'completed-oldest':
        if (a.status === 'done' && b.status === 'done') {
          return new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime();
        }
        return a.status === 'done' ? -1 : b.status === 'done' ? 1 : 0;
      case 'status-asc':
        return a.status.localeCompare(b.status);
      case 'status-desc':
        return b.status.localeCompare(a.status);
      case 'priority-asc':
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'priority-desc':
        const priorityOrderDesc = { low: 0, medium: 1, high: 2 };
        return priorityOrderDesc[b.priority] - priorityOrderDesc[a.priority];
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {sortedTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
          onArchiveTask={onArchiveTask}
          showArchiveActions={false}
        />
      ))}
    </div>
  );
}