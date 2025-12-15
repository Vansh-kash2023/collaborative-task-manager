import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketService {
  private io: Server;
  private userSockets: Map<string, string>;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.userSockets = new Map();
    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers(): void {
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId}`);

      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });
  }

  public emitTaskUpdate(task: any): void {
    this.io.emit('task:updated', task);
  }

  public emitTaskCreated(task: any): void {
    this.io.emit('task:created', task);
  }

  public emitTaskDeleted(taskId: string): void {
    this.io.emit('task:deleted', { taskId });
  }

  public emitTaskAssignment(userId: string, task: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('task:assigned', task);
    }
  }

  public getIO(): Server {
    return this.io;
  }
}

let socketService: SocketService | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketService => {
  socketService = new SocketService(httpServer);
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
};
