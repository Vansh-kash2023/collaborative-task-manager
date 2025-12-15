import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Priority, Status, Task } from '@/types';
import { userApi, User } from '@/lib/user-api';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(Status),
  assignedToId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const allUsers = await userApi.getAllUsers();
        console.log('Users fetched:', allUsers);
        setUsers(allUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Show error in the form
        alert('Failed to load users. Please refresh the page.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          dueDate: task.dueDate.split('T')[0],
          priority: task.priority,
          status: task.status,
          assignedToId: task.assignedToId || undefined,
        }
      : {
          priority: Priority.Medium,
          status: Status.ToDo,
        },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    const formattedData = {
      ...data,
      dueDate: new Date(data.dueDate).toISOString(),
    };
    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          {...register('title')}
          className="input"
          placeholder="Enter task title"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="input"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input id="dueDate" type="date" {...register('dueDate')} className="input" />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select id="priority" {...register('priority')} className="input">
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Urgent}>Urgent</option>
          </select>
          {errors.priority && (
            <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select id="status" {...register('status')} className="input">
            <option value={Status.ToDo}>To Do</option>
            <option value={Status.InProgress}>In Progress</option>
            <option value={Status.Review}>Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-1">
          Assign To (Optional) {loadingUsers && '(Loading...)'}
        </label>
        <select
          id="assignedToId"
          {...register('assignedToId')}
          className="input"
          disabled={loadingUsers}
        >
          <option value="">Unassigned</option>
          {users.length === 0 && !loadingUsers && (
            <option disabled>No users available</option>
          )}
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        {loadingUsers && <p className="text-sm text-gray-500 mt-1">Loading users...</p>}
        {!loadingUsers && users.length === 0 && (
          <p className="text-sm text-orange-600 mt-1">No users found. Please check console for errors.</p>
        )}
        {errors.assignedToId && (
          <p className="text-red-500 text-sm mt-1">{errors.assignedToId.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
