'use client';

import { useEffect } from 'react';
import useTaskStore from '@/store/useTaskStore';

export function useInitializeData() {
  const { fetchTasks, fetchLists, fetchTags } = useTaskStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchTasks(),
          fetchLists(), 
          fetchTags()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [fetchTasks, fetchLists, fetchTags]);
}