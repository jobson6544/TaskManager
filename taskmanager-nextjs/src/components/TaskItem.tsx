'use client';

import { useState, useCallback, useMemo } from 'react';
import { CheckIcon, ChevronRightIcon, CalendarIcon, ChevronDownIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useTaskStore from '@/store/useTaskStore';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: string;
    dueDate?: string;
    listId?: string;
    section?: string;
    subtasks?: number;
  };
  showDetails?: boolean;
}

const TaskItem = ({ task, showDetails = false }: TaskItemProps) => {
  const { toggleTaskCompletion, updateTask, deleteTask, lists } = useTaskStore();
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  
  // Memoize finding the task list to avoid recalculation on each render
  const taskList = useMemo(() => {
    return lists.find(list => list.id === task.listId);
  }, [lists, task.listId]);
  
  // Memoize formatted date
  const formattedDate = useMemo(() => {
    if (!task.dueDate) return null;
    
    return new Intl.DateTimeFormat('en-US', { 
      day: '2-digit',
      month: '2-digit',
      year: '2-digit' 
    }).format(new Date(task.dueDate));
  }, [task.dueDate]);
    
  // Cache the task toggle handler
  const handleTaskToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleTaskCompletion(task.id);
  }, [toggleTaskCompletion, task.id]);
  
  // Toggle expanded view
  const toggleExpanded = useCallback(() => {
    if (!isEditing) {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded, isEditing]);

  // Handle edit mode
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setIsExpanded(true);
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback(async () => {
    if (editTitle.trim()) {
      await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined
      });
      setIsEditing(false);
    }
  }, [updateTask, task.id, editTitle, editDescription, editDueDate]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setIsEditing(false);
  }, [task.title, task.description, task.dueDate]);

  // Handle delete
  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  }, [deleteTask, task.id]);

  // Check if the task belongs to the today section
  const isTodayTask = task.section === 'today';

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div 
        className="flex items-center px-4 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div 
          onClick={handleTaskToggle}
          className={`w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 mr-3 flex items-center justify-center cursor-pointer ${
            task.completed ? 'bg-primary border-primary' : ''
          }`}
        >
          {task.completed && <CheckIcon className="h-3 w-3 text-dark" />}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-grow text-sm font-medium bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
              />
            ) : (
              <p className={`text-sm font-medium dark:text-white ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                {task.title}
              </p>
            )}
            
            {/* Show today badge if task is in today section */}
            {isTodayTask && !isEditing && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 dark:!bg-gray-600 dark:!text-gray-200 text-xs rounded-full">
                Today
              </span>
            )}
          </div>
          
          {/* Always show minimal info */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {/* Show list tag */}
            {taskList && (
              <span 
                className="inline-flex items-center text-xs px-2 py-0.5 rounded-full text-white dark:bg-gray-600 dark:text-gray-200"
                style={{ backgroundColor: taskList.color }}
              >
                {taskList.name}
              </span>
            )}
            
            {/* Show due date if available */}
            {formattedDate && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Edit task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                title="Save changes"
              >
                <CheckIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Cancel editing"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        
        {/* Change icon based on expanded state */}
        {!isEditing && (
          isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
          )
        )}
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-2 px-12 pb-1">
          {isEditing ? (
            <div className="space-y-3">
              {/* Edit description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:text-white resize-none"
                  rows={2}
                  placeholder="Add a description..."
                />
              </div>
              
              {/* Edit due date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Show subtask count if available */}
              {task.subtasks && (
                <div className="mb-2">
                  <span className="inline-flex items-center text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-full">
                    {task.subtasks} {task.subtasks === 1 ? 'Subtask' : 'Subtasks'}
                  </span>
                </div>
              )}
              
              {/* Description if available */}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
              )}
              
              {/* Created date */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;