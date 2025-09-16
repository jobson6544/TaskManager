'use client';

import { useState, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import useTaskStore from '@/store/useTaskStore';

interface AddTaskProps {
  listId?: string | null;
  section?: string | null;
  dueDate?: string | null;
  onAddTask?: ((title: string, listId: string | null) => void) | null;
}

const AddTask = ({ 
  listId = null, 
  section = null, 
  dueDate = null, 
  onAddTask = null 
}: AddTaskProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState('');
  const { addTask, fetchTasks } = useTaskStore();

  // Memoize form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const taskTitle = title.trim();
    
    // Use the selected due date or the prop-provided date
    const finalDueDate = dueDate || selectedDueDate || new Date().toISOString();
    
    // If custom onAddTask handler is provided, use it
    if (onAddTask) {
      onAddTask(taskTitle, listId);
    } else {
      // Otherwise use the default flow with API integration
      const newTask = {
        title: taskTitle,
        listId: listId || undefined,
        section: section || undefined,
        dueDate: finalDueDate,
      };
      
      const result = await addTask(newTask);
      if (result) {
        // Refresh the task list after successful addition
        await fetchTasks();
      }
    }
    
    setTitle('');
    setSelectedDueDate('');
    setIsExpanded(false);
  }, [title, listId, section, dueDate, selectedDueDate, addTask, fetchTasks, onAddTask]);

  // Set default due date when component expands
  const expandForm = useCallback(() => {
    setIsExpanded(true);
    // Set default due date to current time if not provided
    if (!selectedDueDate && !dueDate) {
      const now = new Date();
      // Format as datetime-local input format (YYYY-MM-DDTHH:mm)
      const formattedDate = now.toISOString().slice(0, 16);
      setSelectedDueDate(formattedDate);
    }
  }, [selectedDueDate, dueDate]);

  const collapseForm = useCallback(() => {
    setIsExpanded(false);
    setSelectedDueDate('');
  }, []);

  // Memoize title change handler
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  // Handle due date change
  const handleDueDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDueDate(e.target.value);
  }, []);

  // Quick preset functions for common due dates
  const setDueDatePreset = useCallback((preset: 'now' | 'today' | 'tomorrow' | 'next-week') => {
    const now = new Date();
    let targetDate = new Date();

    switch (preset) {
      case 'now':
        targetDate = now;
        break;
      case 'today':
        targetDate.setHours(23, 59, 0, 0); // End of today
        break;
      case 'tomorrow':
        targetDate.setDate(now.getDate() + 1);
        targetDate.setHours(9, 0, 0, 0); // 9 AM tomorrow
        break;
      case 'next-week':
        targetDate.setDate(now.getDate() + 7);
        targetDate.setHours(9, 0, 0, 0); // 9 AM next week
        break;
    }

    const formattedDate = targetDate.toISOString().slice(0, 16);
    setSelectedDueDate(formattedDate);
  }, []);

  // Set placeholder text based on section
  const getPlaceholderText = () => {
    if (section === 'today') {
      return "What do you need to do today?";
    }
    return "What do you need to do?";
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {!isExpanded ? (
        <div className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" onClick={expandForm}>
          <PlusIcon className="h-5 w-5 mr-2" />
          <span>Add New Task</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4">
          <input
            type="text"
            placeholder={getPlaceholderText()}
            className="w-full border-b border-gray-300 dark:border-gray-600 py-2 bg-transparent dark:text-white focus:outline-none focus:border-primary mb-3"
            value={title}
            onChange={handleTitleChange}
            autoFocus
          />
          
          {/* Due Date and Time Picker */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              value={selectedDueDate}
              onChange={handleDueDateChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Quick preset buttons */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setDueDatePreset('now')}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => setDueDatePreset('today')}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                End of Today
              </button>
              <button
                type="button"
                onClick={() => setDueDatePreset('tomorrow')}
                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
              >
                Tomorrow 9AM
              </button>
              <button
                type="button"
                onClick={() => setDueDatePreset('next-week')}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                Next Week
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📅 Auto-set to current time - use presets or adjust manually
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="text-gray-500 dark:text-gray-400 mr-3 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={collapseForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-primary dark:text-primary font-medium hover:text-primary-dark"
              disabled={!title.trim()}
            >
              Add Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddTask;