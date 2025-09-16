'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, List, Tag } from '@/types/task';
import * as api from '@/services/api';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

interface TaskStore {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  notes: Note[];
  loading: boolean;
  
  // Data fetching
  fetchTasks: () => Promise<void>;
  fetchLists: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => Promise<Task | null>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  
  // List operations
  addList: (list: Omit<List, 'id'>) => Promise<List | null>;
  updateList: (listId: string, updatedList: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  
  // Tag operations
  addTag: (tag: Omit<Tag, 'id'>) => Promise<Tag | null>;
  
  // Note operations
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<Note | null>;
  updateNote: (noteId: string, updatedNote: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  
  // Local operations
  resetTasks: () => void;
  resetAllData: () => Promise<void>;
  getTasksByFilter: (filter: string) => Task[];
}

// Helper function to get today's date with time set to midnight
const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Memoization helper for expensive calculations
const createSelector = <T extends unknown[], R>(fn: (...args: T) => R) => {
  let lastArgs: T | undefined;
  let lastResult: R;
  return (...args: T): R => {
    if (!lastArgs || !args.every((arg, i) => arg === lastArgs![i])) {
      lastArgs = args;
      lastResult = fn(...args);
    }
    return lastResult;
  };
};

const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => {
      // Return the store
      return {
        tasks: [],
        lists: [],
        tags: [],
        notes: [],
        loading: false,
        
        // Data fetching methods
        fetchTasks: async () => {
          set({ loading: true });
          try {
            const tasks = await api.fetchTasks();
            set({ tasks, loading: false });
          } catch (error) {
            console.error('Error fetching tasks:', error);
            // Don't clear existing tasks on error, just stop loading
            set({ loading: false });
          }
        },
        
        fetchLists: async () => {
          try {
            const lists = await api.fetchLists();
            set({ lists });
          } catch (error) {
            console.error('Error fetching lists:', error);
            // Fallback to default lists if API fails
            set({ 
              lists: [
                { id: 'personal', name: 'Personal', color: '#FF6B6B' },
                { id: 'work', name: 'Work', color: '#4ECDC4' },
                { id: 'list1', name: 'List 1', color: '#FFD166' },
              ]
            });
          }
        },
        
        fetchTags: async () => {
          try {
            const tags = await api.fetchTags();
            set({ tags });
          } catch (error) {
            console.error('Error fetching tags:', error);
            // Fallback to default tags if API fails
            set({ 
              tags: [
                { id: 'tag1', name: 'Tag 1' },
                { id: 'tag2', name: 'Tag 2' },
              ]
            });
          }
        },
        
        fetchNotes: async () => {
          try {
            const notes = await api.fetchNotes();
            set({ notes });
          } catch (error) {
            console.error('Error fetching notes:', error);
            set({ notes: [] });
          }
        },
        
        // Task operations with API integration
        addTask: async (task) => {
          try {
            const taskWithCompleted = { ...task, completed: false };
            const newTask = await api.addTask(taskWithCompleted);
            if (newTask) {
              set((state) => ({
                tasks: [...state.tasks, newTask],
              }));
              return newTask;
            }
            return null;
          } catch (error) {
            console.error('Error adding task:', error);
            return null;
          }
        },
        
        updateTask: async (taskId, updatedTask) => {
          try {
            const success = await api.updateTask(taskId, updatedTask);
            if (success) {
              set((state) => ({
                tasks: state.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updatedTask } : task
                ),
              }));
            }
          } catch (error) {
            console.error('Error updating task:', error);
          }
        },
        
        deleteTask: async (taskId) => {
          try {
            const success = await api.deleteTask(taskId);
            if (success) {
              set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== taskId),
              }));
            }
          } catch (error) {
            console.error('Error deleting task:', error);
          }
        },
        
        toggleTaskCompletion: async (taskId) => {
          try {
            const success = await api.toggleTaskCompletion(taskId);
            if (success) {
              set((state) => ({
                tasks: state.tasks.map((task) =>
                  task.id === taskId
                    ? { ...task, completed: !task.completed }
                    : task
                ),
              }));
            }
          } catch (error) {
            console.error('Error toggling task completion:', error);
          }
        },
        
        // List operations with API integration
        addList: async (list) => {
          try {
            const newList = await api.addList(list);
            if (newList) {
              set((state) => ({
                lists: [...state.lists, newList],
              }));
              return newList;
            }
            return null;
          } catch (error) {
            console.error('Error adding list:', error);
            return null;
          }
        },
        
        updateList: async (listId, updatedList) => {
          try {
            const success = await api.updateList(listId, updatedList);
            if (success) {
              set((state) => ({
                lists: state.lists.map((list) =>
                  list.id === listId ? { ...list, ...updatedList } : list
                ),
              }));
            }
          } catch (error) {
            console.error('Error updating list:', error);
          }
        },
        
        deleteList: async (listId) => {
          try {
            const success = await api.deleteList(listId);
            if (success) {
              set((state) => ({
                lists: state.lists.filter((list) => list.id !== listId),
                // Also remove all tasks associated with this list
                tasks: state.tasks.filter((task) => task.listId !== listId),
              }));
            }
          } catch (error) {
            console.error('Error deleting list:', error);
          }
        },
        
        // Tag operations with API integration
        addTag: async (tag) => {
          try {
            const newTag = await api.addTag(tag);
            if (newTag) {
              set((state) => ({
                tags: [...state.tags, newTag],
              }));
              return newTag;
            }
            return null;
          } catch (error) {
            console.error('Error adding tag:', error);
            return null;
          }
        },
        
        // Note operations with API integration
        addNote: async (note) => {
          try {
            const newNote = await api.addNote(note);
            if (newNote) {
              set((state) => ({
                notes: [...state.notes, newNote],
              }));
              return newNote;
            }
            return null;
          } catch (error) {
            console.error('Error adding note:', error);
            return null;
          }
        },
        
        updateNote: async (noteId, updatedNote) => {
          try {
            const success = await api.updateNote(noteId, updatedNote);
            if (success) {
              set((state) => ({
                notes: state.notes.map((note) =>
                  note.id === noteId ? { ...note, ...updatedNote } : note
                ),
              }));
            }
          } catch (error) {
            console.error('Error updating note:', error);
          }
        },
        
        deleteNote: async (noteId) => {
          try {
            const success = await api.deleteNote(noteId);
            if (success) {
              set((state) => ({
                notes: state.notes.filter((note) => note.id !== noteId),
              }));
            }
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        },
        
        // Local operations
        resetTasks: () => {
          set({ tasks: [] });
        },
        
        // Comprehensive data reset
        resetAllData: async () => {
          set({ loading: true });
          try {
            // Get current state
            const { tasks, lists, tags, notes } = get();
            
            // Delete all data from backend
            const deletePromises: Promise<boolean>[] = [];
            
            // Delete all tasks
            tasks.forEach(task => {
              deletePromises.push(api.deleteTask(task.id));
            });
            
            // Delete all custom lists (keep default lists)
            const customLists = lists.filter(list => 
              !['personal', 'work', 'list1'].includes(list.id)
            );
            customLists.forEach(list => {
              deletePromises.push(api.deleteList(list.id));
            });
            
            // Delete all custom tags (keep default tags)
            const customTags = tags.filter(tag => 
              !['tag1', 'tag2'].includes(tag.id)
            );
            customTags.forEach(tag => {
              deletePromises.push(api.deleteTag(tag.id));
            });
            
            // Delete all notes
            notes.forEach(note => {
              deletePromises.push(api.deleteNote(note.id));
            });
            
            // Wait for all deletions to complete
            await Promise.allSettled(deletePromises);
            
            // Reset local state to default values
            set({ 
              tasks: [],
              lists: [
                { id: 'personal', name: 'Personal', color: '#FF6B6B' },
                { id: 'work', name: 'Work', color: '#4ECDC4' },
                { id: 'list1', name: 'List 1', color: '#FFD166' },
              ],
              tags: [
                { id: 'tag1', name: 'Tag 1' },
                { id: 'tag2', name: 'Tag 2' },
              ],
              notes: [],
              loading: false
            });
            
          } catch (error) {
            console.error('Error resetting data:', error);
            // Even if API calls fail, reset local state
            set({ 
              tasks: [],
              lists: [
                { id: 'personal', name: 'Personal', color: '#FF6B6B' },
                { id: 'work', name: 'Work', color: '#4ECDC4' },
                { id: 'list1', name: 'List 1', color: '#FFD166' },
              ],
              tags: [
                { id: 'tag1', name: 'Tag 1' },
                { id: 'tag2', name: 'Tag 2' },
              ],
              notes: [],
              loading: false
            });
          }
        },
        
        // Memoized selector included in the store
        getTasksByFilter: (filter: string) => {
          const { tasks } = get();
          console.log('[FILTER DEBUG] Getting tasks for filter:', filter);
          console.log('[FILTER DEBUG] All tasks:', tasks);
          
          const today = getTodayDate();
          console.log('[FILTER DEBUG] Today date:', today);
          
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          console.log('[FILTER DEBUG] Tomorrow date:', tomorrow);
          
          let filteredTasks: Task[] = [];
          
          switch (filter) {
            case 'today':
              filteredTasks = tasks.filter((task) => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                const isToday = taskDate.getTime() === today.getTime();
                console.log('[FILTER DEBUG] Task:', task.title, 'Due:', task.dueDate, 'TaskDate:', taskDate, 'IsToday:', isToday);
                return isToday;
              });
              break;
            case 'upcoming':
              filteredTasks = tasks.filter((task) => {
                if (!task.dueDate) return false;
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                return taskDate.getTime() >= tomorrow.getTime();
              });
              break;
            case 'work':
            case 'personal':
            case 'list1':
              filteredTasks = tasks.filter((task) => task.listId === filter);
              break;
            default:
              filteredTasks = tasks;
          }
          
          console.log('[FILTER DEBUG] Filtered tasks for', filter, ':', filteredTasks);
          return filteredTasks;
        },
      };
    },
    {
      name: 'organic-mind-storage',
      // Only persist basic state, not the loading state
      partialize: (state) => ({
        tasks: state.tasks,
        lists: state.lists,
        tags: state.tags,
        notes: state.notes,
      }),
    }
  )
);

export default useTaskStore;