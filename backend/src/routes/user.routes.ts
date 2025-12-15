import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Get all users (for task assignment)
router.get('/', authenticate, userController.getAllUsers.bind(userController));

export default router;
