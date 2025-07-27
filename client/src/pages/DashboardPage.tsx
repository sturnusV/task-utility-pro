// src/pages/DashboardPage.tsx
import { useEffect, useState, useCallback } from 'react';
import type { Task, TaskAnalytics } from '../types/task';
import { getTasks, getTaskAnalytics, deleteTask as apiDeleteTask, updateTask as apiUpdateTask } from '../api/taskService';
import TaskList from '../components/tasks/TaskList';
import TaskStats from '../components/charts/TaskStats.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Navigate, useNavigate } from 'react-router-dom';
import { archiveTask } from '../api/taskService';
import { Toast } from './Toast';
import { ConfirmModal } from './ConfirmModal.tsx';
import TaskCalendar from '../components/calendar/TaskCalendar'
import { Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import TaskItem from '../components/tasks/TaskItem.tsx';

export type SortOption = 'newest' | 'oldest' | 'nearest-due' | 'farthest-due' | 'completed-newest' | 'completed-oldest' | 'status-asc' | 'status-desc' | 'priority-asc' | 'priority-desc';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideDone, setHideDone] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    action: 'delete' | 'archive' | null;
    message: string;
    taskId: string | null;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [tasksData, analyticsData] = await Promise.all([
        getTasks(),
        getTaskAnalytics()
      ]);
      setTasks(tasksData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      showToast('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      await apiDeleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      await fetchData();
      showToast('Task deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('Failed to delete task', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData, isProcessing]);

  const handleUpdateTask = useCallback(async (taskId: string, updatedTaskData: Partial<Task>) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const updatedTask = await apiUpdateTask(taskId, updatedTaskData);
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
      );

      if (updatedTaskData.status) {
        await fetchData();
      }

      showToast('Task updated successfully', 'success');
    } catch (err) {
      console.error('Error updating task:', err);
      showToast('Failed to update task', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData, isProcessing]);

  const onArchiveTask = useCallback(async (taskId: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      await archiveTask(taskId);
      await fetchData();
      showToast('Task archived successfully', 'success');
    } catch (err) {
      console.error('Archiving failed', err);
      showToast('Failed to archive task', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [fetchData, isProcessing]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="text-center py-8">Loading tasks and analytics...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </>
      <h1 className="text-2xl font-bold mb-6 text-center md:text-center">Task Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6 space-y-3 sm:space-y-0">

            {/* Top row: title and kebab menu */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>

              {/* Kebab Filter Menu */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  className="h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  {showFilters ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <div className="flex flex-col justify-center items-center gap-1">
                      <span className="block h-1 w-1 rounded-full bg-gray-600"></span>
                      <span className="block h-1 w-1 rounded-full bg-gray-600"></span>
                      <span className="block h-1 w-1 rounded-full bg-gray-600"></span>
                    </div>
                  )}
                </button>

                {/* Filter dropdown */}
                {showFilters && (
                  <div className="absolute right-0 mt-5 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 space-y-4">
                    {/* Hide Completed Toggle */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="hide-done" className="text-sm font-medium text-gray-700">
                        Hide Completed:
                      </label>
                      <input
                        id="hide-done"
                        type="checkbox"
                        checked={hideDone}
                        onChange={() => setHideDone(!hideDone)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Sort by:
                      </label>
                      <select
                        id="sort-tasks"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-48 px-3 ml-2 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="nearest-due">Nearest Due</option>
                        <option value="farthest-due">Farthest Due</option>
                        <option value="status-asc">Status (A-Z)</option>
                        <option value="status-desc">Status (Z-A)</option>
                        <option value="priority-asc">Priority (Low-High)</option>
                        <option value="priority-desc">Priority (High-Low)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom row: New Task button */}
            <div className="text-center">
              <button
                onClick={() => navigate('/tasks/new')}
                className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                + New Task
              </button>
            </div>

          </div>

          {tasks.length === 0 ? (
            <p className="text-gray-600">No tasks found. Start by creating a new task!</p>
          ) : (
            <TaskList
              tasks={tasks}
              onDeleteTask={(id) =>
                setShowConfirmModal({
                  action: 'delete',
                  message: 'Are you sure you want to delete this task?',
                  taskId: id,
                })
              }
              onUpdateTask={handleUpdateTask}
              onArchiveTask={(id) =>
                setShowConfirmModal({
                  action: 'archive',
                  message: 'Archive this completed task?',
                  taskId: id,
                })
              }
              hideDone={hideDone}
              sortBy={sortBy}
            />
          )}
        </div>

        {analytics && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Analytics</h2>
            <TaskStats analytics={analytics} />
          </div>
        )}

      </div>

      {/* Calendar */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <TaskCalendar
          view={calendarView}
          onView={setCalendarView}
          date={calendarDate}
          onNavigate={setCalendarDate}
          defaultView={Views.WEEK}
          min={new Date(0, 0, 0, 8, 0, 0)} // Start at 8am
          max={new Date(0, 0, 0, 22, 0, 0)} // End at 10pm
          step={30} // 30 minute intervals
          timeslots={2} // Number of time slots per hour
          views={{
            month: true,
            week: true,
            day: true,
            agenda: true
          }}
          tasks={tasks.filter(task => !hideDone || task.status !== 'done')}
          onSelectTask={setSelectedTask}
        />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <TaskItem
              task={selectedTask}
              onDelete={(id) => {
                setShowConfirmModal({
                  action: 'delete',
                  message: 'Are you sure you want to delete this task?',
                  taskId: id,
                });
                setSelectedTask(null);
              }}
              onUpdate={handleUpdateTask}
              onArchiveTask={(id) => {
                setShowConfirmModal({
                  action: 'archive',
                  message: 'Archive this completed task?',
                  taskId: id,
                });
                setSelectedTask(null);
              }}
              showArchiveActions={selectedTask.is_archived}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          title={
            showConfirmModal.action === 'delete'
              ? 'Confirm Deletion'
              : 'Confirm Archive'
          }
          message={showConfirmModal.message}
          onConfirm={async () => {
            if (!showConfirmModal.taskId) return;

            setIsProcessing(true);

            if (showConfirmModal.action === 'delete') {
              await handleDeleteTask(showConfirmModal.taskId);
            } else if (showConfirmModal.action === 'archive') {
              await onArchiveTask(showConfirmModal.taskId);
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