import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Task } from '../types/task';
import { getTask, createTask, updateTask } from '../api/taskService';
import DatePicker from 'react-datepicker';
import { useAuth } from '../context/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';

interface TaskFormErrors {
    title?: string;
    description?: string;
    due_date?: string;
    due_time?: string;
    priority?: string;
    status?: string;
}

export default function TaskFormPage() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [task, setTask] = useState<Omit<Task, 'id' | 'created_at' | 'updated_at'> & { due_time?: string | null }>({
        title: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        due_time: null, // Changed to null as default
        priority: 'medium',
        status: 'todo',
        user_id: user?.id !== undefined ? String(user.id) : '',
        is_archived: false,
        archived_at: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState<TaskFormErrors>({});

    const validateTaskForm = (taskData: typeof task): TaskFormErrors => {
        const errors: TaskFormErrors = {};

        if (!taskData.title.trim()) {
            errors.title = 'Title is required';
        } else if (taskData.title.length > 100) {
            errors.title = 'Title must be less than 100 characters';
        }

        if (!taskData.due_date) {
            errors.due_date = 'Due date is required';
        } else if (new Date(taskData.due_date) < new Date()) {
            errors.due_date = 'Due date must be in the future';
        }

        if (taskData.due_time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(taskData.due_time)) {
            errors.due_time = 'Invalid time format (HH:MM)';
        }

        return errors;
    };

    useEffect(() => {
        if (id) {
            const fetchTask = async () => {
                try {
                    setIsLoading(true);
                    const fetchedTask = await getTask(id);
                    setTask({
                        ...fetchedTask,
                        due_time: fetchedTask.due_time || null // Changed to null if no time exists
                    });
                } catch (err) {
                    setError('Failed to fetch task');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTask();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date: Date | null) => {
        if (!date) return;

        if (date < new Date()) {
            setFormErrors(prev => ({
                ...prev,
                due_date: 'Date cannot be in the past'
            }));
            return;
        }

        setTask(prev => ({
            ...prev,
            due_date: date.toISOString().split('T')[0]
        }));
        setFormErrors(prev => ({ ...prev, due_date: undefined }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setTask(prev => ({
            ...prev,
            due_time: value || null // Set to null if empty string
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLoading) return;

        const errors = validateTaskForm(task);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const taskData = {
                ...task,
                due_time: task.due_time || null // Explicitly set to null if empty
            };

            if (id) {
                await updateTask(id, taskData as Task);
            } else {
                await createTask(taskData);
            }
            navigate('/');
        } catch (err) {
            setError('Failed to save task');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && id) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl text-white-700">
            <h1 className="text-2xl font-bold mb-6">
                {id ? 'Edit Task' : 'Create New Task'}
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={task.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={task.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date *
                        </label>
                        <DatePicker
                            selected={task.due_date ? new Date(task.due_date) : null}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.due_date && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.due_date}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="due_time" className="block text-sm font-medium text-gray-700 mb-1">
                            Time (optional)
                        </label>
                        <input
                            type="time"
                            id="due_time"
                            name="due_time"
                            value={task.due_time || ''}
                            onChange={handleTimeChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        {formErrors.due_time && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.due_time}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority *
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={task.priority}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={task.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center bg-gray-300 text-gray-700 py-2 px-3 rounded-md transition-colors disabled:opacity-50 ${!isLoading && 'hover:bg-gray-400'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                {id ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            id ? 'Update Task' : 'Create Task'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}