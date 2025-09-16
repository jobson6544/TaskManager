'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import useTaskStore from '@/store/useTaskStore';

const CalendarPage = () => {
  const { tasks, loading } = useTaskStore();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  
  // Calendar helper functions
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };
  
  // Navigate to previous/next period based on view mode
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };
  
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  // Format date based on view mode
  const formatDisplayDate = () => {
    if (viewMode === 'day') {
      return new Intl.DateTimeFormat('en-US', { 
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      }).format(currentDate);
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startOfWeek);
      const year = startOfWeek.getFullYear();
      
      return `${startDay}–${endDay} ${month} ${year}`;
    } else {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }).format(currentDate);
    }
  };
  
  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = task.dueDate.split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getDayTasks = (date: Date) => {
    return getTasksForDate(date);
  };

  const generateMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the starting day of the week (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();
    
    // Calculate the number of days in the previous month
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    // Add days from the previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Add days from the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Add days from the next month to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const generateWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Adjust for Sunday = 0
    startOfWeek.setDate(diff);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    
    return weekDays;
  };
  
  // Get tasks for current day (day view)
  const getDayTasks = (date: Date) => {
    return getTasksForDate(date);
  };
  
  // Generate days for week view
  const generateWeekView = () => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };
  
  // Generate calendar days for month view
  const generateMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    const prevMonth = new Date(year, month, 0);
    const nextMonth = new Date(year, month + 1, 1);
    
    // Add days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = new Date(prevMonth);
      day.setDate(prevMonth.getDate() - firstDayOfMonth + i + 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // Add days from next month to fill out the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(nextMonth);
      day.setDate(i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  
  // Render different calendar views
  const renderCalendarView = () => {
    if (viewMode === 'day') {
      // Day view - show tasks for the selected day
      const dayTasks = getDayTasks(currentDate);
      const selectedDateStr = currentDate.toISOString().split('T')[0];
      
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <AddTask section="calendar" dueDate={selectedDateStr} />
          </div>
          
          <div className="space-y-2">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading tasks...
              </div>
            ) : (
              <>
                {dayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {dayTasks.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks for this day. Add some tasks!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    } else if (viewMode === 'week') {
      // Week view - show tasks for each day of the week
      const weekDays = generateWeekView();
      
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {weekDays.map(day => (
              <div key={day.toString()} className="p-4 text-center font-medium text-gray-600 dark:text-gray-300">
                <div className="text-sm">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(day)}
                </div>
                <div className="text-lg">
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {weekDays.map(day => {
              const dayTasks = getTasksForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[200px] border-r border-gray-200 dark:border-gray-700 p-2 ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div 
                        key={task.id}
                        className="text-xs p-1 bg-blue-100 dark:bg-blue-800 rounded truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      // Month view - show tasks for each day of the month
      const days = generateMonthView();
      const weeks = [];
      
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }
      
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="text-center py-4 font-medium text-gray-600 dark:text-gray-300">
                {day}
              </div>
            ))}
          </div>
          
          <div>
            {weeks.map((week, weekIndex) => (
              <div key={`week-${weekIndex}`} className="grid grid-cols-7">
                {week.map((day, dayIndex) => {
                  const dayTasks = getTasksForDate(day.date);
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={`day-${weekIndex}-${dayIndex}`}
                      className={`h-32 border-r border-b border-gray-200 dark:border-gray-700 p-2 relative ${
                        !day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900' : 'dark:text-gray-200'
                      } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="font-medium text-sm mb-1">
                        {day.date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div 
                            key={task.id}
                            className="text-xs p-1 bg-blue-100 dark:bg-blue-800 rounded truncate"
                          >
                            {task.title}
                          </div>
                        ))}
                        
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <SidebarLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{formatDisplayDate()}</h1>
          
          <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
            Add Event
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          {/* View tabs */}
          <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button 
              className={`px-4 py-2 rounded-lg ${viewMode === 'day' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${viewMode === 'month' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPrevious}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={goToNext}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Calendar content */}
        {renderCalendarView()}
      </div>
    </SidebarLayout>
  );
};

export default CalendarPage;