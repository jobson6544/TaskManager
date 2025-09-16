'use client';

import { useEffect } from 'react';
import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import useTaskStore from '@/store/useTaskStore';

export default function TodayPage() {
  const { getTasksByFilter, tasks, loading, fetchTasks } = useTaskStore();
  const todayTasks = getTasksByFilter('today');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debug logging
  console.log('Debug - Today Page:', {
    loading,
    totalTasks: tasks.length,
    todayTasks: todayTasks.length,
    allTasks: tasks,
    todayTasksFiltered: todayTasks
  });

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Today's Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Focus on what matters today
          </p>
        </div>

        {/* Add New Task Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Task</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">For today</span>
          </div>
          <AddTask section="today" dueDate={new Date().toISOString().split('T')[0]} />
        </div>

        {/* Task Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} for today</span>
            <span>•</span>
            <span>{todayTasks.filter(t => t.completed).length} completed</span>
            <span>•</span>
            <span>{todayTasks.filter(t => !t.completed).length} remaining</span>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading today's tasks...
            </div>
          ) : (
            <>
              {todayTasks.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {todayTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No tasks for today</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start your day by adding some tasks to get organized!
                  </p>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    💡 Tip: Use the "Add New Task" section above to create your first task
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}