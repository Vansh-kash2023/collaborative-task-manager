import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { sendErrorResponse } from '../utils/errors';
import { AuthRequest } from '../middleware/auth.middleware';
import { TaskFilters, TaskSortOptions } from '../types/task.types';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const creatorId = req.user!.userId;
      const task = await this.taskService.createTask(creatorId, req.body);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const filters: TaskFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
      };

      const sortOptions: TaskSortOptions = {
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const tasks = await this.taskService.getTasks(filters, sortOptions);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const task = await this.taskService.getTaskById(req.params.id);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const task = await this.taskService.updateTask(
        req.params.id,
        userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.taskService.deleteTask(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getMyCreatedTasks = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const tasks = await this.taskService.getUserCreatedTasks(userId);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getMyAssignedTasks = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const tasks = await this.taskService.getUserAssignedTasks(userId);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getMyOverdueTasks = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const tasks = await this.taskService.getUserOverdueTasks(userId);

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };
}
