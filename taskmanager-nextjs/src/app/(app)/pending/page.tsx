'use client';

import { useEffect, useState } from 'react';
import useTaskStore from '@/store/useTaskStore';
import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { Task } from '@/types/task';

export default function PendingPage() {
  const { 
    tasks, 
    lists, 
    fetchTasks, 
    fetchLists, 
    getTasksByFilter,
    updateTask,
    deleteTask 
  } = useTaskStore();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTasks(), fetchLists()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTasks, fetchLists]);

  // Get pending (incomplete) tasks
  const allTasks = showCompleted ? tasks : tasks.filter((task: Task) => !task.completed);
  
  // Apply search filter
  const searchFilteredTasks = searchQuery 
    ? allTasks.filter((task: Task) => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allTasks;
  
  // Apply list filter if selected
  const filteredTasks = selectedListId 
    ? searchFilteredTasks.filter((task: Task) => task.listId === selectedListId)
    : searchFilteredTasks;

  // Sort tasks based on selected criteria
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        // Assuming we'll add priority later, for now sort by due date
        return a.title.localeCompare(b.title);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Group tasks by urgency
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const overdueTasks = sortedTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date()
  );
  const todayTasks = sortedTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) <= today && new Date(task.dueDate) >= new Date()
  );
  const tomorrowTasks = sortedTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) <= tomorrow && new Date(task.dueDate) > today
  );
  const thisWeekTasks = sortedTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) <= nextWeek && new Date(task.dueDate) > tomorrow
  );
  const laterTasks = sortedTasks.filter(task => 
    !task.dueDate || new Date(task.dueDate) > nextWeek
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout>
      <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Pending Works</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your incomplete tasks and stay on track</p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    viewMode === 'kanban' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
                  </svg>
                  Board
                </button>
              </div>
            </div>

            {/* List Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">List:</label>
              <select
                value={selectedListId || ''}
                onChange={(e) => setSelectedListId(e.target.value || null)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Lists</option>
                {lists.map((list: any) => (
                  <option key={list.id} value={list.id}>{list.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'created')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Created Date</option>
              </select>
            </div>

            {/* Show Completed Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showCompleted"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-gray-400 focus:ring-blue-500 dark:focus:ring-gray-500"
              />
              <label htmlFor="showCompleted" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show completed
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{filteredTasks.length} tasks shown</span>
            <span>{tasks.filter(t => !t.completed).length} pending</span>
            {overdueTasks.length > 0 && (
              <span className="text-red-600 dark:text-gray-300 font-medium">{overdueTasks.length} overdue</span>
            )}
          </div>
        </div>
      </div>

      {/* Add Task */}
      <div className="mb-6">
        <AddTask />
      </div>

      {/* Task Groups */}
      <div className="space-y-6">
        {viewMode === 'list' ? (
          // List View
          <>
            {/* Quick Actions Bar */}
            {filteredTasks.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
                  {searchQuery && (
                    <span className="ml-2 text-blue-600 dark:text-gray-300">
                      for "{searchQuery}"
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-gray-200 rounded-md hover:bg-blue-200 dark:hover:bg-gray-500 transition-colors">
                    Mark all complete
                  </button>
                </div>
              </div>
            )}

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-gray-600 text-red-800 dark:text-gray-200">
                    🚨 Urgent
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-red-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Overdue ({overdueTasks.length})
                </h2>
                <div className="space-y-2">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-red-200 dark:border-gray-600 overflow-hidden">
                      <TaskItem task={task} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Today */}
            {todayTasks.length > 0 && (
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    📅 Today
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-orange-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Due Today ({todayTasks.length})
                </h2>
                <div className="space-y-2">
                  {todayTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-orange-200 dark:border-gray-600 overflow-hidden">
                      <TaskItem task={task} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Tomorrow */}
            {tomorrowTasks.length > 0 && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⏰ Tomorrow
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-yellow-800 dark:text-gray-200 mb-3">
                  Due Tomorrow ({tomorrowTasks.length})
                </h2>
                <div className="space-y-2">
                  {tomorrowTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-yellow-200 dark:border-gray-600 overflow-hidden">
                      <TaskItem task={task} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due This Week */}
            {thisWeekTasks.length > 0 && (
              <div className="bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-gray-600 text-blue-800 dark:text-gray-200">
                    📊 This Week
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-blue-800 dark:text-gray-200 mb-3">
                  Due This Week ({thisWeekTasks.length})
                </h2>
                <div className="space-y-2">
                  {thisWeekTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-blue-200 dark:border-gray-600 overflow-hidden">
                      <TaskItem task={task} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Later / No Due Date */}
            {laterTasks.length > 0 && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    📋 Later
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Later / No Due Date ({laterTasks.length})
                </h2>
                <div className="space-y-2">
                  {laterTasks.map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <TaskItem task={task} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // Kanban Board View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overdue Column */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Overdue ({overdueTasks.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {overdueTasks.map(task => (
                  <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md shadow-sm border border-red-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-xs text-red-600 dark:text-gray-400 font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Today Column */}
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Today ({todayTasks.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {todayTasks.map(task => (
                  <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md shadow-sm border border-orange-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-xs text-orange-600 dark:text-gray-400 font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* This Week Column */}
            <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 dark:bg-gray-500 rounded-full"></span>
                This Week ({thisWeekTasks.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {thisWeekTasks.map(task => (
                  <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md shadow-sm border border-blue-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-xs text-blue-600 dark:text-gray-400 font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Later Column */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                Later ({laterTasks.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {laterTasks.map(task => (
                  <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No tasks found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks match your search criteria "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 dark:text-gray-300 hover:text-blue-800 dark:hover:text-gray-100 font-medium"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">All caught up!</h3>
                <p className="text-gray-500 dark:text-gray-400">You have no pending tasks. Great job!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
}