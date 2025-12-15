import { io, Socket } from 'socket.io-client';
import { Task } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onTaskCreated(callback: (task: Task) => void): void {
    this.socket?.on('task:created', callback);
  }

  onTaskUpdated(callback: (task: Task) => void): void {
    this.socket?.on('task:updated', callback);
  }

  onTaskDeleted(callback: (data: { taskId: string }) => void): void {
    this.socket?.on('task:deleted', callback);
  }

  onTaskAssigned(callback: (task: Task) => void): void {
    this.socket?.on('task:assigned', callback);
  }

  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
