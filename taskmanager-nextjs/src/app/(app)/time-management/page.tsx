'use client';

import { useEffect, useState } from 'react';
import useTaskStore from '@/store/useTaskStore';
import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import { Task } from '@/types/task';
import { sendNotification } from '@/utils/notifications';

export default function TimeManagementPage() {
  const { 
    tasks, 
    lists, 
    fetchTasks, 
    fetchLists,
    updateTask 
  } = useTaskStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'timeline' | 'calendar' | 'schedule' | 'workload'>('timeline');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [focusMode, setFocusMode] = useState(false);
  const [timeBlockSize, setTimeBlockSize] = useState<15 | 30 | 60>(30);
  const [showProductivityTips, setShowProductivityTips] = useState(true);
  const [showAddEventForm, setShowAddEventForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTasks(), fetchLists()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTasks, fetchLists]);

  // Button handler functions
  const handleStartFocusSession = async () => {
    setFocusMode(true);
    await sendNotification({
      taskId: 'focus-session',
      title: '🎯 Focus Session Started',
      body: 'Focus mode activated. Minimize distractions and focus on your priority tasks.',
      type: 'reminder'
    });
  };

  const handleQuickAddTask = () => {
    // Focus on the AddTask component (scroll to it)
    const addTaskElement = document.querySelector('[data-component="add-task"]');
    if (addTaskElement) {
      addTaskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus on the task input if it exists
      const taskInput = addTaskElement.querySelector('input[type="text"]') as HTMLInputElement;
      if (taskInput) {
        setTimeout(() => taskInput.focus(), 300);
      }
    }
  };

  const handleRescheduleAll = async () => {
    if (confirm('Reschedule all overdue tasks to tomorrow?')) {
      const overdue = tasks.filter((task: Task) => {
        if (!task.dueDate || task.completed) return false;
        return new Date(task.dueDate) < today;
      });

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      try {
        await Promise.all(
          overdue.map(task =>
            updateTask(task.id, { ...task, dueDate: tomorrowString })
          )
        );
        
        await sendNotification({
          taskId: 'reschedule-complete',
          title: '📅 Tasks Rescheduled',
          body: `${overdue.length} overdue tasks have been moved to tomorrow.`,
          type: 'reminder'
        });
      } catch (error) {
        console.error('Error rescheduling tasks:', error);
      }
    }
  };

  const handleMarkPriority = async () => {
    const overdue = tasks.filter((task: Task) => {
      if (!task.dueDate || task.completed) return false;
      return new Date(task.dueDate) < today;
    });

    if (overdue.length === 0) {
      await sendNotification({
        taskId: 'no-overdue',
        title: 'No Overdue Tasks',
        body: 'All your tasks are up to date!',
        type: 'reminder'
      });
      return;
    }

    // Since we can't update priority, let's just update the description to mark as urgent
    try {
      await Promise.all(
        overdue.map(task =>
          updateTask(task.id, { 
            ...task, 
            description: `🔥 URGENT: ${task.description || task.title}` 
          })
        )
      );
      
      await sendNotification({
        taskId: 'priority-marked',
        title: '⚡ Tasks Marked Urgent',
        body: `${overdue.length} overdue tasks marked as urgent in their descriptions.`,
        type: 'reminder'
      });
    } catch (error) {
      console.error('Error marking as urgent:', error);
    }
  };

  const handleTimeBlock = () => {
    // For now, just show which time blocks are selected
    alert(`Time blocking set to ${timeBlockSize} minute intervals. This feature will help you organize your day into focused work blocks.`);
  };

  const handleAddEvent = () => {
    // Toggle the add event form in calendar view
    setShowAddEventForm(!showAddEventForm);
  };

  const handlePlanWeek = () => {
    // Switch to schedule view to see the weekly layout
    setSelectedView('schedule');
    setTimeout(() => {
      document.querySelector('[data-view="schedule"]')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleStartAll = async () => {
    const todayIncompleteTasks = todayTasks.filter(task => !task.completed);
    if (todayIncompleteTasks.length === 0) return;

    if (confirm(`Start working on all ${todayIncompleteTasks.length} tasks for today?`)) {
      setFocusMode(true);
      await sendNotification({
        taskId: 'start-all-tasks',
        title: '🚀 Daily Tasks Started',
        body: `Focus mode activated for ${todayIncompleteTasks.length} tasks. Let's get productive!`,
        type: 'reminder'
      });
    }
  };

  // Get tasks with due dates for time management
  const tasksWithDates = tasks.filter((task: Task) => task.dueDate && !task.completed);

  // Get today's tasks
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const todayTasks = tasks.filter((task: Task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
    return taskDate === todayString && !task.completed;
  });

  // Get this week's tasks
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const thisWeekTasks = tasks.filter((task: Task) => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= startOfWeek && taskDate <= endOfWeek && !task.completed;
  });

  // Group tasks by day for the selected week
  const getTasksForDate = (date: string) => {
    return tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === date && !task.completed;
    });
  };

  // Generate week dates
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }

  // Calculate workload statistics
  const totalTasks = tasks.filter((task: Task) => !task.completed).length;
  const overdueTasks = tasks.filter((task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < today;
  }).length;

  const upcomingTasks = tasks.filter((task: Task) => {
    if (!task.dueDate || task.completed) return false;
    const taskDate = new Date(task.dueDate);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return taskDate > today && taskDate <= nextWeek;
  }).length;

  // Productivity insights
  const completedToday = tasks.filter((task: Task) => {
    if (!task.completed) return false;
    // This would need a completedAt field in the Task model
    return true; // Placeholder for now
  }).length;

  const productivityScore = totalTasks > 0 ? Math.round((completedToday / (completedToday + totalTasks)) * 100) : 100;

  // Time blocking helper
  const getTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeBlockSize) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          display: `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
        });
      }
    }
    return slots;
  };

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
      <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Time Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Plan, schedule, and track your tasks efficiently</p>
          </div>
          
          {/* Productivity Score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{productivityScore}%</div>
              <div className="text-xs text-gray-500">Productivity</div>
            </div>
            
            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                focusMode 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {focusMode ? 'Exit Focus' : 'Focus Mode'}
            </button>
          </div>
        </div>

        {/* Productivity Tips */}
        {showProductivityTips && !focusMode && (
          <div className="mt-4 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-4 relative">
            <button
              onClick={() => setShowProductivityTips(false)}
              className="absolute top-2 right-2 text-blue-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-gray-100 mb-1">💡 Productivity Tip</h4>
                <p className="text-sm text-blue-800 dark:text-gray-200">
                  {overdueTasks > 0 
                    ? `You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}. Consider breaking them into smaller, manageable chunks.`
                    : todayTasks.length > 5
                    ? "You have many tasks today. Try time-blocking to stay focused and productive."
                    : "Great job staying on top of your tasks! Consider planning tomorrow's work now."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">View:</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
                <button
                  onClick={() => setSelectedView('timeline')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                    selectedView === 'timeline' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </button>
                <button
                  onClick={() => setSelectedView('calendar')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                    selectedView === 'calendar' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar
                </button>
                <button
                  onClick={() => setSelectedView('schedule')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                    selectedView === 'schedule' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </button>
                <button
                  onClick={() => setSelectedView('workload')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 whitespace-nowrap ${
                    selectedView === 'workload' 
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-gray-100 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>
              </div>
            </div>

            {/* Schedule View Controls */}
            {selectedView === 'schedule' && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Time blocks:</label>
                  <select
                    value={timeBlockSize}
                    onChange={(e) => setTimeBlockSize(Number(e.target.value) as 15 | 30 | 60)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date:</label>
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Stats - Right side */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-300">{totalTasks} pending</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600">{todayTasks.length} today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600">{completedToday} completed</span>
              </div>
              {overdueTasks > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">{overdueTasks} overdue</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                focusMode 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">{focusMode ? 'Exit Focus' : 'Focus Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {selectedView === 'timeline' && (
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Today's Focus</h3>
                  <p className="text-sm opacity-90">{todayTasks.length} tasks scheduled</p>
                </div>
                <div className="text-2xl">🎯</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={handleStartFocusSession}
                  className="text-xs px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
                >
                  Start Focus Session
                </button>
                <button 
                  onClick={handleQuickAddTask}
                  className="text-xs px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Progress Today</h3>
                  <p className="text-sm opacity-90">{completedToday} completed</p>
                </div>
                <div className="text-2xl">📈</div>
              </div>
              <div className="mt-3">
                <div className="bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(productivityScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 opacity-90">{productivityScore}% productivity score</p>
              </div>
            </div>

            <div className={`rounded-lg p-4 text-white ${
              overdueTasks > 0 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {overdueTasks > 0 ? 'Overdue Tasks' : 'All Clear!'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {overdueTasks > 0 ? `${overdueTasks} need attention` : 'No overdue tasks'}
                  </p>
                </div>
                <div className="text-2xl">{overdueTasks > 0 ? '⚠️' : '✅'}</div>
              </div>
              {overdueTasks > 0 && (
                <div className="mt-3">
                  <button 
                    onClick={() => setSelectedView('timeline')}
                    className="text-xs px-3 py-1 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
                  >
                    Review Overdue
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Task */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Schedule New Task</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleQuickAddTask}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Quick Add
                </button>
                <button 
                  onClick={handleTimeBlock}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Time Block
                </button>
              </div>
            </div>
            <div data-component="add-task">
              <AddTask />
            </div>
          </div>

          {/* Enhanced Task Sections */}
          {/* Today's Tasks */}
          <div className="bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 dark:bg-gray-500"></div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-gray-200 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm">
                  📅
                </div>
                Today's Tasks ({todayTasks.length})
              </h2>
              {todayTasks.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleStartAll}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Start All
                  </button>
                  <button 
                    onClick={handleTimeBlock}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Time Block
                  </button>
                </div>
              )}
            </div>
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task, index) => (
                  <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-blue-200 dark:border-gray-600 overflow-hidden relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                    <div className="pl-4">
                      <TaskItem task={task} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-blue-300 text-4xl mb-2">🌟</div>
                <p className="text-blue-700 text-sm">No tasks scheduled for today. Perfect time to plan ahead!</p>
              </div>
            )}
          </div>

          {/* Upcoming This Week */}
          <div className="bg-green-50 dark:bg-gray-700 rounded-lg border border-green-200 dark:border-gray-600 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 dark:bg-gray-500"></div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-green-800 dark:text-gray-200 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 dark:bg-gray-600 rounded-lg flex items-center justify-center text-white dark:text-gray-200 text-sm">
                  📊
                </div>
                Upcoming This Week ({upcomingTasks})
              </h2>
              {upcomingTasks > 0 && (
                <button 
                  onClick={handlePlanWeek}
                  className="text-xs px-3 py-1 bg-green-100 dark:bg-gray-600 text-green-700 dark:text-gray-200 rounded-md hover:bg-green-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Plan Week
                </button>
              )}
            </div>
            {upcomingTasks > 0 ? (
              <div className="space-y-2">
                {tasks
                  .filter((task: Task) => {
                    if (!task.dueDate || task.completed) return false;
                    const taskDate = new Date(task.dueDate);
                    const nextWeek = new Date(today);
                    nextWeek.setDate(today.getDate() + 7);
                    return taskDate > today && taskDate <= nextWeek;
                  })
                  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                  .slice(0, 5) // Show only first 5
                  .map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-green-200 dark:border-gray-600 overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 dark:bg-gray-500"></div>
                      <div className="pl-4">
                        <TaskItem task={task} />
                      </div>
                    </div>
                  ))}
                {upcomingTasks > 5 && (
                  <div className="text-center py-2">
                    <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                      View {upcomingTasks - 5} more upcoming tasks →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-300 text-4xl mb-2">🎉</div>
                <p className="text-green-700 text-sm">No upcoming tasks this week. You're ahead of schedule!</p>
              </div>
            )}
          </div>

          {/* Overdue Tasks */}
          {overdueTasks > 0 && (
            <div className="bg-red-50 dark:bg-gray-700 rounded-lg border border-red-200 dark:border-gray-600 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500 dark:bg-gray-500"></div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-red-800 dark:text-gray-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 dark:bg-gray-600 rounded-lg flex items-center justify-center text-white dark:text-gray-200 text-sm">
                    ⚠️
                  </div>
                  Overdue Tasks ({overdueTasks})
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={handleRescheduleAll}
                    className="text-xs px-3 py-1 bg-red-100 dark:bg-gray-600 text-red-700 dark:text-gray-200 rounded-md hover:bg-red-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    Reschedule All
                  </button>
                  <button 
                    onClick={handleMarkPriority}
                    className="text-xs px-3 py-1 bg-red-100 dark:bg-gray-600 text-red-700 dark:text-gray-200 rounded-md hover:bg-red-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    Mark Priority
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {tasks
                  .filter((task: Task) => {
                    if (!task.dueDate || task.completed) return false;
                    return new Date(task.dueDate) < today;
                  })
                  .map(task => (
                    <div key={task.id} className="bg-white dark:bg-gray-700 rounded-md border border-red-200 dark:border-gray-600 overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400 dark:bg-gray-500"></div>
                      <div className="pl-4">
                        <TaskItem task={task} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar View - Enhanced */}
      {selectedView === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Calendar View</h2>
            <div className="flex gap-3">
              <button 
                onClick={handleAddEvent}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  showAddEventForm 
                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {showAddEventForm ? 'Cancel' : 'Add Event'}
              </button>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              >
                <option value={new Date().toISOString().split('T')[0]}>Today</option>
                <option value={new Date(Date.now() + 86400000).toISOString().split('T')[0]}>Tomorrow</option>
                <option value={new Date(Date.now() + 7*86400000).toISOString().split('T')[0]}>Next Week</option>
              </select>
            </div>
          </div>
          
          {/* Inline Add Event Form */}
          {showAddEventForm && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Add New Event</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Scheduling for: {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <button 
                  onClick={() => setShowAddEventForm(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-white rounded-md p-4">
                <AddTask 
                  dueDate={selectedDate.toISOString().split('T')[0]} 
                  onAddTask={() => {
                    setShowAddEventForm(false);
                    // Optional: Show a success notification
                    sendNotification({
                      taskId: 'event-added',
                      title: '✅ Event Added',
                      body: `New task scheduled for ${selectedDate.toLocaleDateString()}`,
                      type: 'reminder'
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
            {/* Generate calendar days */}
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 6);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
              
              // Count tasks for this date
              const tasksForDate = tasks.filter((task: Task) => 
                task.dueDate && new Date(task.dueDate).toDateString() === date.toDateString()
              ).length;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`relative p-2 text-sm rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : isToday 
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' 
                      : isCurrentMonth 
                      ? 'hover:bg-gray-100 text-gray-700' 
                      : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  {date.getDate()}
                  {tasksForDate > 0 && (
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-blue-500'
                    }`}></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {/* Tasks for selected date */}
            <div className="space-y-3">
              {tasks
                .filter((task: Task) => 
                  task.dueDate && new Date(task.dueDate).toDateString() === selectedDate.toDateString()
                )
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                .map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      task.completed ? 'bg-green-500 dark:bg-gray-500' : 
                      new Date(task.dueDate!) < new Date() ? 'bg-red-500 dark:bg-gray-500' : 'bg-blue-500 dark:bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <TaskItem task={task} />
                    </div>
                  </div>
                ))
              }
              
              {tasks.filter((task: Task) => 
                task.dueDate && new Date(task.dueDate).toDateString() === selectedDate.toDateString()
              ).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-300 text-4xl mb-2">📅</div>
                  <p className="text-gray-500">No tasks scheduled for this date</p>
                  <button 
                    onClick={() => setShowAddEventForm(true)}
                    className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Schedule Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Schedule View */}
      {selectedView === 'schedule' && (
        <div data-view="schedule" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 gap-0">
            {weekDates.map((date, index) => {
              const dateString = date.toISOString().split('T')[0];
              const dayTasks = getTasksForDate(dateString);
              const isToday = dateString === todayString;
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = date.getDate();

              return (
                <div
                  key={dateString}
                  className={`border-r border-b border-gray-200 p-3 min-h-[300px] ${
                    isToday ? 'bg-blue-50 dark:bg-gray-600 border-blue-300 dark:border-gray-500' : 'bg-white dark:bg-gray-700'
                  } ${index === 6 ? 'border-r-0' : ''}`}
                >
                  {/* Day Header */}
                  <div className="text-center mb-4 pb-2 border-b border-gray-200">
                    <div className={`text-xs uppercase font-medium tracking-wide ${
                      isToday ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {dayName}
                    </div>
                    <div className={`text-xl font-semibold mt-1 ${
                      isToday 
                        ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                        : 'text-gray-700'
                    }`}>
                      {dayNumber}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className={`text-xs mt-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {dayTasks.map((task, taskIndex) => {
                      const hasTime = task.dueDate && task.dueDate.includes('T');
                      const taskDate = new Date(task.dueDate!);
                      const isOverdue = taskDate < new Date() && !task.completed;
                      
                      return (
                        <div
                          key={task.id}
                          className={`text-xs p-2 rounded-md cursor-pointer transition-all duration-200 ${
                            task.completed 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : isOverdue
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                          }`}
                          title={`${task.title}${task.description ? ` - ${task.description}` : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate ${
                                task.completed ? 'line-through opacity-70' : ''
                              }`}>
                                {task.title}
                              </div>
                              {hasTime && (
                                <div className={`mt-1 font-mono text-xs ${
                                  task.completed 
                                    ? 'text-green-600' 
                                    : isOverdue 
                                    ? 'text-red-600' 
                                    : 'text-blue-600'
                                }`}>
                                  {taskDate.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>
                              )}
                              {!hasTime && (
                                <div className={`mt-1 text-xs ${
                                  task.completed 
                                    ? 'text-green-600' 
                                    : isOverdue 
                                    ? 'text-red-600' 
                                    : 'text-blue-600'
                                }`}>
                                  All day
                                </div>
                              )}
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              {task.completed && (
                                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              {isOverdue && !task.completed && (
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {dayTasks.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-gray-300 text-2xl mb-2">📋</div>
                        <div className="text-xs text-gray-400 italic">No tasks scheduled</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Workload Analysis View */}
      {selectedView === 'workload' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Pending</div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="text-2xl font-bold text-blue-600 dark:text-gray-100">{todayTasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Due Today</div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="text-2xl font-bold text-green-600 dark:text-gray-100">{upcomingTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">This Week</div>
            </div>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
              <div className="text-2xl font-bold text-red-600 dark:text-gray-100">{overdueTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Overdue</div>
            </div>
          </div>

          {/* Tasks by List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4">Tasks by List</h2>
            <div className="space-y-3">
              {lists.map((list: any) => {
                const listTasks = tasks.filter((task: Task) => task.listId === list.id && !task.completed);
                const listOverdue = listTasks.filter((task: Task) => {
                  if (!task.dueDate) return false;
                  return new Date(task.dueDate) < today;
                });

                return (
                  <div key={list.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: list.color }}
                      ></div>
                      <span className="font-medium">{list.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{listTasks.length} total</span>
                      {listOverdue.length > 0 && (
                        <span className="text-red-600 font-medium">{listOverdue.length} overdue</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Task Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4">Daily Task Distribution (This Week)</h2>
            <div className="space-y-2">
              {weekDates.map(date => {
                const dateString = date.toISOString().split('T')[0];
                const dayTasks = getTasksForDate(dateString);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                
                return (
                  <div key={dateString} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm font-medium">{dayName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((dayTasks.length / Math.max(...weekDates.map(d => getTasksForDate(d.toISOString().split('T')[0]).length))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-right">{dayTasks.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
    </SidebarLayout>
  );
}