import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendErrorResponse } from '../utils/errors';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(_req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      sendErrorResponse(res, error);
    }
  }
}
