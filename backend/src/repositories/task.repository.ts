import prisma from '../config/database';
import { Task, Prisma } from '@prisma/client';
import { TaskFilters, TaskSortOptions } from '../types/task.types';

export class TaskRepository {
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return prisma.task.create({
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(
    filters: TaskFilters,
    sortOptions: TaskSortOptions
  ): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters.isOverdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        not: 'Completed',
      };
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (sortOptions.sortBy) {
      orderBy[sortOptions.sortBy] = sortOptions.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return prisma.task.findMany({
      where,
      orderBy,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Task> {
    return prisma.task.delete({
      where: { id },
    });
  }

  async findByCreatorId(creatorId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { creatorId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByAssignedToId(assignedToId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: { assignedToId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOverdueTasks(userId: string): Promise<Task[]> {
    return prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          { creatorId: userId },
        ],
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: 'Completed',
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}
