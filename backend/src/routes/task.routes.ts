import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema } from '../dtos/task.dto';

const router = Router();
const taskController = new TaskController();

router.use(authenticate);

router.post('/', validateBody(createTaskSchema), taskController.createTask);

router.get('/', taskController.getTasks);

router.get('/my-created', taskController.getMyCreatedTasks);

router.get('/my-assigned', taskController.getMyAssignedTasks);

router.get('/my-overdue', taskController.getMyOverdueTasks);

router.get('/:id', taskController.getTaskById);

router.put('/:id', validateBody(updateTaskSchema), taskController.updateTask);

router.delete('/:id', taskController.deleteTask);

export default router;
