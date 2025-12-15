import React from 'react';
import { Task, Priority, Status } from '@/types';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Status) => void;
}

const priorityColors = {
  [Priority.Low]: 'bg-green-100 text-green-800',
  [Priority.Medium]: 'bg-yellow-100 text-yellow-800',
  [Priority.High]: 'bg-orange-100 text-orange-800',
  [Priority.Urgent]: 'bg-red-100 text-red-800',
};

const statusColors = {
  [Status.ToDo]: 'bg-gray-100 text-gray-800',
  [Status.InProgress]: 'bg-blue-100 text-blue-800',
  [Status.Review]: 'bg-purple-100 text-purple-800',
  [Status.Completed]: 'bg-green-100 text-green-800',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isOverdue = isPast(new Date(task.dueDate)) && task.status !== Status.Completed;

  return (
    <div className={`card hover:shadow-lg transition-shadow ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h3>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(task)} className="text-primary-600 hover:text-primary-800">
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
        {isOverdue && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <p>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
          {task.assignedTo && <p>Assigned to: {task.assignedTo.name}</p>}
        </div>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
        >
          <option value={Status.ToDo}>To Do</option>
          <option value={Status.InProgress}>In Progress</option>
          <option value={Status.Review}>Review</option>
          <option value={Status.Completed}>Completed</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;
