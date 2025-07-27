import type { Task } from '../../types/task';
import { format } from 'date-fns';
import { useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { RiDeleteBin6Line, RiEditLine, RiArchiveLine, RiResetLeftLine } from "react-icons/ri";

interface TaskItemProps {
  task: Task;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updatedTaskData: Partial<Task>) => Promise<void>;
  onArchiveTask?: (taskId: string) => void;
  onUnarchiveTask?: (taskId: string) => void;
  showArchiveActions?: boolean;
  isModalView?: boolean;
}

export default function TaskItem({
  task,
  onDelete,
  onUpdate,
  onArchiveTask,
  onUnarchiveTask,
  showArchiveActions = false,
  isModalView = false
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onUpdate || isUpdating) return;

    setIsUpdating(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updatedData: Partial<Task> = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        due_date: formData.get('due_date') as string || undefined,
        due_time: formData.get('due_time') as string || undefined,
        priority: formData.get('priority') as 'low' | 'medium' | 'high',
        status: formData.get('status') as 'todo' | 'in_progress' | 'done',
      };

      await onUpdate(task.id, updatedData);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDueDateForInput = task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '';
  const formattedDueTime = task.due_time || '12:00'; // Default to noon if no time specified

  // Edit form (only for non-archived tasks)
  if (isEditing && !showArchiveActions && onUpdate) {
    return (
      <form onSubmit={handleEditSubmit} className="space-y-3">
        <div>
          <label htmlFor={`edit-title-${task.id}`} className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id={`edit-title-${task.id}`}
            type="text"
            name="title"
            defaultValue={task.title}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor={`edit-description-${task.id}`} className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id={`edit-description-${task.id}`}
            name="description"
            defaultValue={task.description}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`edit-due-date-${task.id}`} className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              id={`edit-due-date-${task.id}`}
              type="date"
              name="due_date"
              defaultValue={formattedDueDateForInput}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor={`edit-due-time-${task.id}`} className="block text-sm font-medium text-gray-700">Due Time (optional)</label>
            <input
              id={`edit-due-time-${task.id}`}
              type="time"
              name="due_time"
              defaultValue={formattedDueTime}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`edit-priority-${task.id}`} className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              id={`edit-priority-${task.id}`}
              name="priority"
              defaultValue={task.priority}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label htmlFor={`edit-status-${task.id}`} className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id={`edit-status-${task.id}`}
              name="status"
              defaultValue={task.status}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <FaSpinner className="animate-spin inline" />
                Saving changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    );
  }

  // Format date and time for display
  const displayDueDate = task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'N/A';
  const displayDueTime = task.due_time ? format(new Date(`1970-01-01T${task.due_time}`), 'h:mm a') : '';

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow relative ${isModalView ? 'w-full' : ''}`}>
      {!isModalView && (
        /* Only show kebab menu in list view, not modal view */
        <div className="absolute top-1 right-1">
          <button
            type="button"
            className="h-10 w-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md"
            onClick={() => setShowMobileMenu((prev) => !prev)}
          >
            {showMobileMenu ? (
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

          {/* Menu Dropdown */}
          {showMobileMenu && (
            <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="flex flex-col p-1 space-y-1">
                {/* Edit button */}
                {!showArchiveActions && onUpdate && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMobileMenu(false);
                    }}
                    disabled={isUpdating}
                    className={`p-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 text-left ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    title="Edit"
                  >
                    {<RiEditLine />}
                  </button>
                )}

                {/* Archive/Unarchive buttons */}
                {showArchiveActions ? (
                  onUnarchiveTask && (
                    <button
                      onClick={async () => {
                        if (isUnarchiving) return;
                        setIsUnarchiving(true);
                        try {
                          await onUnarchiveTask(task.id);
                        } finally {
                          setIsUnarchiving(false);
                          setShowMobileMenu(false);
                        }
                      }}
                      disabled={isUnarchiving}
                      className={`p-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 text-left ${isUnarchiving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      title="Unarchive"
                    >
                      {isUnarchiving ? (
                        <FaSpinner className="animate-spin inline" />
                      ) : (
                        <RiResetLeftLine />
                      )}
                    </button>
                  )
                ) : (
                  task.status === 'done' && onArchiveTask && (
                    <button
                      onClick={async () => {
                        if (isArchiving) return;
                        setIsArchiving(true);
                        try {
                          await onArchiveTask(task.id);
                        } finally {
                          setIsArchiving(false);
                          setShowMobileMenu(false);
                        }
                      }}
                      disabled={isArchiving}
                      className={`p-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 text-left ${isArchiving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      title="Archive"
                    >
                      {isArchiving ? (
                        <FaSpinner className="animate-spin inline" />
                      ) : (
                        <RiArchiveLine />
                      )}
                    </button>
                  )
                )}

                {/* Delete button */}
                {onDelete && (
                  <button
                    onClick={async () => {
                      if (isDeleting) return;
                      setIsDeleting(true);
                      try {
                        await onDelete(task.id);
                      } finally {
                        setIsDeleting(false);
                        setShowMobileMenu(false);
                      }
                    }}
                    disabled={isDeleting}
                    className={`p-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-700 text-left ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    title="Delete"
                  >
                    {isDeleting ? (
                      <FaSpinner className="animate-spin inline" />
                    ) : (
                      <RiDeleteBin6Line />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Display */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2 mt-5">
        <h3 className="font-medium text-lg sm:mr-2">{task.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'done' ? 'bg-blue-100 text-blue-800' :
            task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {task.status === 'done' ? 'Done' :
              task.status === 'in_progress' ? 'In Progress' : 'To Do'}
          </span>
          {task.is_archived && (
            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
              Archived
            </span>
          )}
        </div>
      </div>

      {isModalView && onUpdate && (
        /* Add edit button in modal view */
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
          title="Edit"
        >
          <RiEditLine />
        </button>
      )}

      <p className="text-gray-600 text-sm break-words mb-3">{task.description}</p>

      <div className="flex flex-col text-sm">
        <span>
          Due: {displayDueDate}
          {displayDueTime && ` at ${displayDueTime}`}
        </span>
        {task.status === 'done' && task.completed_at && (
          <span className="text-green-600">
            Completed: {format(new Date(task.completed_at), 'MMM dd, yyyy')}
          </span>
        )}
        {task.is_archived && task.archived_at && (
          <span className="text-gray-600">
            Archived: {format(new Date(task.archived_at), 'MMM dd, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}