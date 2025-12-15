import { z } from 'zod';
import { Priority, Status } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().datetime('Invalid date format'),
  priority: z.nativeEnum(Priority).default(Priority.Medium),
  status: z.nativeEnum(Status).default(Status.ToDo),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters')
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  dueDate: z.string().datetime('Invalid date format').optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  assignedToId: z.string().uuid('Invalid user ID').nullable().optional(),
});

export const taskQuerySchema = z.object({
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type TaskQueryDto = z.infer<typeof taskQuerySchema>;
