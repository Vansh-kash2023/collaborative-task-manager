import { Priority, Status } from '@prisma/client';

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  assignedToId?: string;
  creatorId?: string;
  isOverdue?: boolean;
}

export interface TaskSortOptions {
  sortBy?: 'dueDate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}
