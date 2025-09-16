'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import useTaskStore from '@/store/useTaskStore';

export default function IndividualListPage() {
  const params = useParams();
  const listId = params.listId as string;
  const { tasks, lists, loading, fetchTasks, fetchLists } = useTaskStore();
  
  useEffect(() => {
    fetchTasks();
    fetchLists();
  }, [fetchTasks, fetchLists]);

  // Filter tasks by the current list
  const currentList = lists.find(list => list.id === listId);
  const listTasks = tasks.filter(task => task.listId === listId);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </SidebarLayout>
    );
  }

  if (!currentList) {
    return (
      <SidebarLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              List Not Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              The list you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: currentList.color }}
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentList.name}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({listTasks.length} {listTasks.length === 1 ? 'task' : 'tasks'})
            </span>
          </div>
        </div>

        <div className="mb-6">
          <AddTask listId={listId} section={`list-${listId}`} />
        </div>

        <div className="space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {listTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {listTasks.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-2">No tasks in this list yet.</div>
              <div className="text-sm">Add your first task to get started!</div>
            </div>
          )}
        </div>

        {/* List Stats */}
        {listTasks.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {listTasks.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Tasks
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {listTasks.filter(task => task.completed).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {listTasks.filter(task => !task.completed).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Pending
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {listTasks.filter(task => 
                    !task.completed && 
                    task.dueDate && 
                    new Date(task.dueDate) < new Date()
                  ).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Overdue
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}