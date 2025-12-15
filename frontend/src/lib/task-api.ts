import { apiClient } from './api-client';
import { Task, ApiResponse, TaskFilters } from '@/types';

export const taskApi = {
  async getTasks(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await apiClient.get<ApiResponse<Task[]>>(
      `/tasks?${params.toString()}`
    );
    return response.data;
  },

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    status: string;
    assignedToId?: string;
  }): Promise<ApiResponse<Task>> {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return response.data;
  },

  async updateTask(
    id: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: string;
      status?: string;
      assignedToId?: string | null;
    }
  ): Promise<ApiResponse<Task>> {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async getMyCreatedTasks(): Promise<ApiResponse<Task[]>> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks/my-created');
    return response.data;
  },

  async getMyAssignedTasks(): Promise<ApiResponse<Task[]>> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks/my-assigned');
    return response.data;
  },

  async getMyOverdueTasks(): Promise<ApiResponse<Task[]>> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks/my-overdue');
    return response.data;
  },
};
