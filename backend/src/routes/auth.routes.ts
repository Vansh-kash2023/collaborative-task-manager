import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '../dtos/auth.dto';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

router.post('/login', validateBody(loginSchema), authController.login);

router.get('/profile', authenticate, authController.getProfile);

router.put(
  '/profile',
  authenticate,
  validateBody(updateProfileSchema),
  authController.updateProfile
);

router.post('/logout', authenticate, authController.logout);

export default router;
