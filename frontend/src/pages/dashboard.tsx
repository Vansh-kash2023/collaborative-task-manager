import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useMyCreatedTasks, useMyAssignedTasks, useMyOverdueTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { tasks: createdTasks, isLoading: createdLoading } = useMyCreatedTasks();
  const { tasks: assignedTasks, isLoading: assignedLoading } = useMyAssignedTasks();
  const { tasks: overdueTasks, isLoading: overdueLoading } = useMyOverdueTasks();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Here is an overview of your tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Created by Me</h3>
            <p className="text-4xl font-bold text-blue-600">
              {createdLoading ? '-' : createdTasks?.length || 0}
            </p>
          </div>

          <div className="card bg-green-50 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Assigned to Me</h3>
            <p className="text-4xl font-bold text-green-600">
              {assignedLoading ? '-' : assignedTasks?.length || 0}
            </p>
          </div>

          <div className="card bg-red-50 border border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Overdue Tasks</h3>
            <p className="text-4xl font-bold text-red-600">
              {overdueLoading ? '-' : overdueTasks?.length || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks Assigned to Me</h2>
            {assignedLoading ? (
              <LoadingSkeleton count={2} />
            ) : assignedTasks && assignedTasks.length > 0 ? (
              <div className="space-y-4">
                {assignedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="card hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {task.status}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tasks assigned to you yet.</p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Created Tasks</h2>
            {createdLoading ? (
              <LoadingSkeleton count={2} />
            ) : createdTasks && createdTasks.length > 0 ? (
              <div className="space-y-4">
                {createdTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="card hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                    </p>
                    <div className="mt-2 flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {task.status}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You have not created any tasks yet.</p>
            )}
          </div>
        </div>

        {overdueTasks && overdueTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Overdue Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="card border-l-4 border-red-500 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Was due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      Overdue
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/tasks')}
            className="btn btn-primary"
          >
            View All Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
