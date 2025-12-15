import useSWR from 'swr';
import { Task, TaskFilters } from '@/types';
import { taskApi } from '@/lib/task-api';
import { useEffect } from 'react';
import { socketService } from '@/lib/socket';

export const useTasks = (filters?: TaskFilters) => {
  const { data, error, mutate, isLoading } = useSWR(
    ['tasks', JSON.stringify(filters)],
    () => taskApi.getTasks(filters).then((res) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    const handleTaskCreated = (task: Task) => {
      mutate();
    };

    const handleTaskUpdated = (task: Task) => {
      mutate();
    };

    const handleTaskDeleted = () => {
      mutate();
    };

    const handleTaskAssigned = (task: Task) => {
      mutate();
      // Show notification for assigned task
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('New Task Assigned', {
            body: `You have been assigned: ${task.title}`,
            icon: '/favicon.ico',
          });
        }
      }
    };

    socketService.onTaskCreated(handleTaskCreated);
    socketService.onTaskUpdated(handleTaskUpdated);
    socketService.onTaskDeleted(handleTaskDeleted);
    socketService.onTaskAssigned(handleTaskAssigned);

    return () => {
      socketService.removeAllListeners();
    };
  }, [mutate]);

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useMyCreatedTasks = () => {
  const { data, error, mutate, isLoading } = useSWR(
    'my-created-tasks',
    () => taskApi.getMyCreatedTasks().then((res) => res.data),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const handleTaskUpdate = () => {
      mutate();
    };

    socketService.onTaskCreated(handleTaskUpdate);
    socketService.onTaskUpdated(handleTaskUpdate);
    socketService.onTaskDeleted(handleTaskUpdate);

    return () => {
      socketService.removeAllListeners();
    };
  }, [mutate]);

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useMyAssignedTasks = () => {
  const { data, error, mutate, isLoading } = useSWR(
    'my-assigned-tasks',
    () => taskApi.getMyAssignedTasks().then((res) => res.data),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const handleTaskUpdate = () => {
      mutate();
    };

    socketService.onTaskCreated(handleTaskUpdate);
    socketService.onTaskUpdated(handleTaskUpdate);
    socketService.onTaskDeleted(handleTaskUpdate);
    socketService.onTaskAssigned(handleTaskUpdate);

    return () => {
      socketService.removeAllListeners();
    };
  }, [mutate]);

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useMyOverdueTasks = () => {
  const { data, error, mutate, isLoading } = useSWR(
    'my-overdue-tasks',
    () => taskApi.getMyOverdueTasks().then((res) => res.data),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
};
