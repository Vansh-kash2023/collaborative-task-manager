import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/errors';
import { Priority, Status } from '@prisma/client';

jest.mock('../repositories/task.repository');
jest.mock('../repositories/user.repository');
jest.mock('../config/socket', () => ({
  getSocketService: jest.fn(() => ({
    emitTaskCreated: jest.fn(),
    emitTaskAssignment: jest.fn(),
    emitTaskUpdate: jest.fn(),
    emitTaskDeleted: jest.fn(),
  })),
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    taskService = new TaskService();
    mockTaskRepository = TaskRepository.prototype as jest.Mocked<TaskRepository>;
    mockUserRepository = UserRepository.prototype as jest.Mocked<UserRepository>;
  });

  describe('createTask', () => {
    it('should create a task successfully when all data is valid', async () => {
      const creatorId = 'user-123';
      const assignedToId = 'user-456';
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
        priority: Priority.High,
        status: Status.ToDo,
        assignedToId,
      };

      const mockUser = {
        id: assignedToId,
        email: 'assigned@test.com',
        name: 'Assigned User',
        password: 'hashedpw',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTask = {
        id: 'task-123',
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate),
        priority: taskData.priority,
        status: taskData.status,
        creatorId,
        assignedToId,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: mockUser,
        assignedTo: mockUser,
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockTaskRepository.create = jest.fn().mockResolvedValue(mockTask);

      const result = await taskService.createTask(creatorId, taskData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(assignedToId);
      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw AppError when assigned user does not exist', async () => {
      const creatorId = 'user-123';
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
        priority: Priority.Medium,
        status: Status.ToDo,
        assignedToId: 'non-existent-user',
      };

      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        taskService.createTask(creatorId, taskData)
      ).rejects.toThrow(AppError);
      await expect(
        taskService.createTask(creatorId, taskData)
      ).rejects.toThrow('Assigned user not found');
    });

    it('should create task without assignedToId when not provided', async () => {
      const creatorId = 'user-123';
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
        priority: Priority.Low,
        status: Status.ToDo,
      };

      const mockTask = {
        id: 'task-123',
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate),
        priority: taskData.priority,
        status: taskData.status,
        creatorId,
        assignedToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: null,
        assignedTo: null,
      };

      mockTaskRepository.create = jest.fn().mockResolvedValue(mockTask);

      const result = await taskService.createTask(creatorId, taskData);

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockTaskRepository.create).toHaveBeenCalled();
      expect(result.assignedToId).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should throw AppError when task does not exist', async () => {
      const taskId = 'non-existent-task';
      const userId = 'user-123';
      const updateData = { title: 'Updated Title' };

      mockTaskRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        taskService.updateTask(taskId, userId, updateData)
      ).rejects.toThrow(AppError);
      await expect(
        taskService.updateTask(taskId, userId, updateData)
      ).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should throw AppError when user is not the creator', async () => {
      const taskId = 'task-123';
      const userId = 'user-456';
      const creatorId = 'user-123';

      const mockTask = {
        id: taskId,
        title: 'Test Task',
        description: 'Test',
        dueDate: new Date(),
        priority: Priority.Medium,
        status: Status.ToDo,
        creatorId,
        assignedToId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findById = jest.fn().mockResolvedValue(mockTask);

      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow(
        AppError
      );
      await expect(taskService.deleteTask(taskId, userId)).rejects.toThrow(
        'Only the creator can delete this task'
      );
    });
  });
});
