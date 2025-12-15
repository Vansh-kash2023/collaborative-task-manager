import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendErrorResponse } from '../utils/errors';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const profile = await this.authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const updatedProfile = await this.authService.updateProfile(
        userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      sendErrorResponse(res, error);
    }
  };

  logout = async (_req: AuthRequest, res: Response): Promise<void> => {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  };
}
