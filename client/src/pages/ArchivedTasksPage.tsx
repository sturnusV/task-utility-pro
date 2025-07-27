import { useEffect, useState } from 'react';
import type { Task } from '../types/task';
import TaskItem from '../components/tasks/TaskItem';
import { getArchivedTasks, deleteTask, unarchiveTask } from '../api/taskService';
import type { SortOption } from './DashboardPage';
import { Toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';

export default function ArchivedTasksPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    action: 'delete' | 'unarchive' | null;
    message: string;
    taskId: string | null;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await deleteTask(taskId);
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      showToast('Task deleted.', 'success');
    } catch (error) {
      console.error('Failed to delete task:', error);
      showToast('Failed to delete task.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const onUnarchiveTask = async (taskId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await unarchiveTask(taskId);
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
      showToast('Task unarchived successfully.', 'success');
    } catch (error) {
      console.error('Failed to unarchive task:', error);
      showToast('Failed to unarchive task.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const sortTasks = (tasks: Task[], sortOption: SortOption): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'nearest-due':
          // Handle possible undefined due dates
          const aDue = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bDue = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return aDue - bDue;
        case 'farthest-due':
          const aDueFar = a.due_date ? new Date(a.due_date).getTime() : -Infinity;
          const bDueFar = b.due_date ? new Date(b.due_date).getTime() : -Infinity;
          return bDueFar - aDueFar;
        case 'completed-newest':
          // For archived tasks, we'll sort by archive date if completed_at doesn't exist
          const aCompleted = a.completed_at || a.archived_at;
          const bCompleted = b.completed_at || b.archived_at;
          if (aCompleted && bCompleted) {
            return new Date(bCompleted).getTime() - new Date(aCompleted).getTime();
          }
          return aCompleted ? -1 : bCompleted ? 1 : 0;
        case 'completed-oldest':
          const aCompletedOld = a.completed_at || a.archived_at;
          const bCompletedOld = b.completed_at || b.archived_at;
          if (aCompletedOld && bCompletedOld) {
            return new Date(aCompletedOld).getTime() - new Date(bCompletedOld).getTime();
          }
          return aCompletedOld ? -1 : bCompletedOld ? 1 : 0;
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
  };

  const sortedTasks = sortTasks(archivedTasks, sortBy);

  useEffect(() => {
    const fetchArchivedTasks = async () => {
      try {
        const tasks = await getArchivedTasks();
        setArchivedTasks(tasks);
      } catch (error) {
        console.error('Failed to fetch archived tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArchivedTasks();
  }, []);

  if (loading) return <div>Loading archived tasks...</div>;

  return (
    <div className="container mx-auto p-4">
      <>
        {/* other dashboard layout */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </>
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Archived Tasks</h1>

      <div className="flex flex-col xs:flex-row gap-3 items-start sm:items-end mb-5">

        {/* Sort Controls */}
        <div className="relative w-full sm:w-[200px]">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="block w-full pl-3 pr-10 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="nearest-due">Nearest Due</option>
            <option value="farthest-due">Farthest Due</option>
            <option value="completed-newest">Recently Completed</option>
            <option value="completed-oldest">Oldest Completed</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
            <option value="priority-asc">Priority (Low to High)</option>
            <option value="priority-desc">Priority (High to Low)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="p-5 rounded-md border border-gray-200">
          <p className="text-gray-500">No archived tasks found.</p>
        </div>
      ) : (
        <div className="p-5 space-y-4 rounded-md border border-gray-200">
          {sortedTasks.map(task => (

            <TaskItem
              key={task.id}
              task={task}
              onDelete={(id) =>
                setShowConfirmModal({
                  action: 'delete',
                  message: 'Are you sure you want to delete this task?',
                  taskId: id,
                })
              }
              onUnarchiveTask={(id) =>
                setShowConfirmModal({
                  action: 'unarchive',
                  message: 'Unarchive this completed task?',
                  taskId: id,
                })
              }
              showArchiveActions={true}
            />
          ))}
        </div>
      )}
      {showConfirmModal && (
        <ConfirmModal
          title={
            showConfirmModal.action === 'delete'
              ? 'Confirm Deletion'
              : 'Confirm Unarchive'
          }
          message={showConfirmModal.message}
          onConfirm={async () => {
            if (!showConfirmModal.taskId) return;

            setIsProcessing(true);

            if (showConfirmModal.action === 'delete') {
              await handleDeleteTask(showConfirmModal.taskId);
            } else if (showConfirmModal.action === 'unarchive') {
              await onUnarchiveTask(showConfirmModal.taskId);
            }

            setShowConfirmModal(null);
            setIsProcessing(false);
          }}
          onCancel={() => setShowConfirmModal(null)}
        />
      )}
    </div>
  );
}