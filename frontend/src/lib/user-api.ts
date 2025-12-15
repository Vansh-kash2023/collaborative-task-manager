import { apiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const userApi = {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },
};
