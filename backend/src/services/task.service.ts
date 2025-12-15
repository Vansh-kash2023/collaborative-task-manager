import { TaskRepository } from '../repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/errors';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { TaskFilters, TaskSortOptions } from '../types/task.types';
import { Task } from '@prisma/client';
import { getSocketService } from '../config/socket';

export class TaskService {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }

  async createTask(creatorId: string, data: CreateTaskDto): Promise<Task> {
    if (data.assignedToId) {
      const assignedUser = await this.userRepository.findById(
        data.assignedToId
      );
      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404);
      }
    }

    const task = await this.taskRepository.create({
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      priority: data.priority,
      status: data.status,
      creator: {
        connect: { id: creatorId },
      },
      ...(data.assignedToId && {
        assignedTo: {
          connect: { id: data.assignedToId },
        },
      }),
    });

    try {
      const socketService = getSocketService();
      socketService.emitTaskCreated(task);

      if (data.assignedToId) {
        socketService.emitTaskAssignment(data.assignedToId, task);
      }
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return task;
  }

  async getTasks(
    filters: TaskFilters,
    sortOptions: TaskSortOptions
  ): Promise<Task[]> {
    return this.taskRepository.findAll(filters, sortOptions);
  }

  async getTaskById(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  async updateTask(
    taskId: string,
    _userId: string,
    data: UpdateTaskDto
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const previousAssignedToId = task.assignedToId;

    if (data.assignedToId !== undefined) {
      if (data.assignedToId === null) {
      } else {
        const assignedUser = await this.userRepository.findById(
          data.assignedToId
        );
        if (!assignedUser) {
          throw new AppError('Assigned user not found', 404);
        }
      }
    }

    const updateData: any = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.priority && { priority: data.priority }),
      ...(data.status && { status: data.status }),
    };

    if (data.assignedToId !== undefined) {
      if (data.assignedToId === null) {
        updateData.assignedTo = { disconnect: true };
      } else {
        updateData.assignedTo = { connect: { id: data.assignedToId } };
      }
    }

    const updatedTask = await this.taskRepository.update(taskId, updateData);

    try {
      const socketService = getSocketService();
      socketService.emitTaskUpdate(updatedTask);

      if (
        data.assignedToId &&
        data.assignedToId !== previousAssignedToId
      ) {
        socketService.emitTaskAssignment(data.assignedToId, updatedTask);
      }
    } catch (error) {
      console.error('Socket emission error:', error);
    }

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.creatorId !== userId) {
      throw new AppError('Only the creator can delete this task', 403);
    }

    await this.taskRepository.delete(taskId);

    try {
      const socketService = getSocketService();
      socketService.emitTaskDeleted(taskId);
    } catch (error) {
      console.error('Socket emission error:', error);
    }
  }

  async getUserCreatedTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findByCreatorId(userId);
  }

  async getUserAssignedTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findByAssignedToId(userId);
  }

  async getUserOverdueTasks(userId: string): Promise<Task[]> {
    return this.taskRepository.findOverdueTasks(userId);
  }
}
