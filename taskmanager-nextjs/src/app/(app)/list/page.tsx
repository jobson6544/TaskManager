'use client';

import { useState, useEffect } from 'react';
import AddTask from '@/components/AddTask';
import TaskItem from '@/components/TaskItem';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import useTaskStore from '@/store/useTaskStore';

export default function ListPage() {
  const { lists, tasks, loading, fetchTasks, fetchLists } = useTaskStore();
  const [selectedList, setSelectedList] = useState<string>('');

  useEffect(() => {
    fetchTasks();
    fetchLists();
  }, [fetchTasks, fetchLists]);

  // Set default selected list when lists are loaded
  useEffect(() => {
    if (lists.length > 0 && !selectedList) {
      setSelectedList(lists[0].id);
    }
  }, [lists, selectedList]);

  const filteredTasks = selectedList ? tasks.filter(task => task.listId === selectedList) : tasks;
  const currentList = lists.find(list => list.id === selectedList);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentList?.name || 'All Tasks'}
          </h1>
          <div className="flex gap-2 mb-4">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setSelectedList(list.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedList === list.id
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: list.color }}
                />
                {list.name}
              </button>
            ))}
          </div>
        </div>

        <AddTask listId={selectedList} />

        <div className="space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {selectedList 
                ? `No tasks in ${currentList?.name || 'this list'}. Add some tasks to get started!`
                : 'No tasks available. Add some tasks to get started!'
              }
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}