'use client';

import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import useTaskStore from '@/store/useTaskStore';

export default function UpcomingPage() {
  const { getTasksByFilter, loading } = useTaskStore();
  const upcomingTasks = getTasksByFilter('upcoming');

  // Set default due date to tomorrow for upcoming tasks
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  // Group tasks by date for better organization
  const groupedTasks = upcomingTasks.reduce((groups, task) => {
    if (!task.dueDate) return groups;
    
    const date = new Date(task.dueDate).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, typeof upcomingTasks>);

  const groupedDates = Object.keys(groupedTasks).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Upcoming Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Plan ahead and stay organized
          </p>
        </div>

        {/* Add New Task Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Task</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">For upcoming days</span>
          </div>
          <AddTask section="upcoming" dueDate={tomorrowDate} />
        </div>

        {/* Task Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{upcomingTasks.length} upcoming task{upcomingTasks.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{upcomingTasks.filter(t => t.completed).length} completed</span>
            <span>•</span>
            <span>{upcomingTasks.filter(t => !t.completed).length} pending</span>
            <span>•</span>
            <span>{groupedDates.length} day{groupedDates.length !== 1 ? 's' : ''} scheduled</span>
          </div>
        </div>

        {/* Tasks Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading upcoming tasks...</span>
          </div>
        ) : (
          <>
            {upcomingTasks.length > 0 ? (
              <div className="space-y-6">
                {groupedDates.map((dateString) => {
                  const date = new Date(dateString);
                  const tasksForDate = groupedTasks[dateString];
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  
                  let dateLabel = date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                  
                  if (isToday) dateLabel = `Today - ${dateLabel}`;
                  if (isTomorrow) dateLabel = `Tomorrow - ${dateLabel}`;

                  return (
                    <div key={dateString} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {dateLabel}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tasksForDate.map((task) => (
                          <TaskItem key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No upcoming tasks</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Plan ahead by adding some tasks for the upcoming days!
                </p>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                  💡 Tip: Use the "Add New Task" section above to schedule tasks for future dates
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}