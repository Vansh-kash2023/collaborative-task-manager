import prisma from '../config/database';
import { User } from '@prisma/client';

export class UserRepository {
  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: { name?: string; email?: string }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
