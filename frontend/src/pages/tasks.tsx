import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import Toast from '@/components/Toast';
import { useTasks } from '@/hooks/useTasks';
import { taskApi } from '@/lib/task-api';
import { handleApiError } from '@/lib/api-client';
import { Task, Status, Priority, TaskFilters } from '@/types';
import { socketService } from '@/lib/socket';

export default function Tasks() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { tasks, isLoading, mutate } = useTasks(filters);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Listen for real-time task assignments
  useEffect(() => {
    const handleTaskAssigned = (task: Task) => {
      if (task.assignedToId === user?.id) {
        setToast({
          message: `You've been assigned to: ${task.title}`,
          type: 'info',
        });
        mutate();
      }
    };

    const handleTaskCreated = () => {
      mutate();
    };

    const handleTaskUpdated = () => {
      mutate();
    };

    socketService.onTaskAssigned(handleTaskAssigned);
    socketService.onTaskCreated(handleTaskCreated);
    socketService.onTaskUpdated(handleTaskUpdated);

    return () => {
      socketService.removeAllListeners();
    };
  }, [user, mutate]);

  const handleCreateTask = async (data: any) => {
    try {
      setError('');
      await taskApi.createTask(data);
      setShowForm(false);
      mutate();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;

    try {
      setError('');
      await taskApi.updateTask(editingTask.id, data);
      setEditingTask(null);
      setShowForm(false);
      mutate();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setError('');
      await taskApi.deleteTask(taskId);
      mutate();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleStatusChange = async (taskId: string, status: Status) => {
    try {
      setError('');
      await taskApi.updateTask(taskId, { status });
      mutate();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setError('');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-gray-600 mt-2">Manage and organize your tasks</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : 'Create New Task'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as Status || undefined })
                }
                className="input"
              >
                <option value="">All</option>
                <option value={Status.ToDo}>To Do</option>
                <option value={Status.InProgress}>In Progress</option>
                <option value={Status.Review}>Review</option>
                <option value={Status.Completed}>Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value as Priority || undefined })
                }
                className="input"
              >
                <option value="">All</option>
                <option value={Priority.Low}>Low</option>
                <option value={Priority.Medium}>Medium</option>
                <option value={Priority.High}>High</option>
                <option value={Priority.Urgent}>Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as 'dueDate' | 'createdAt' | 'priority' || undefined,
                  })
                }
                className="input"
              >
                <option value="">Default</option>
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={filters.sortOrder || 'asc'}
                onChange={(e) =>
                  setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })
                }
                className="input"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton count={6} />
        ) : tasks && tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4">
              Create Your First Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
