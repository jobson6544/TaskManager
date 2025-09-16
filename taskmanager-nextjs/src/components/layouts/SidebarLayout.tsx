'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import useTaskStore from '@/store/useTaskStore';
import useAuthStore from '@/store/useAuthStore';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { lists, tasks, addList, deleteList, updateList, fetchLists, fetchTasks } = useTaskStore();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editListColor, setEditListColor] = useState('');
  const [showListActions, setShowListActions] = useState<string | null>(null);
  const [isAddingListInline, setIsAddingListInline] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#6366F1');
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, [fetchLists, fetchTasks]);
  
  // Close sidebar when window is resized below md breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sign out
  const handleSignOut = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  // Handle editing a list
  const startEditingList = (list: any) => {
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListColor(list.color);
    setShowListActions(null);
  };

  const saveListEdit = () => {
    if (editListName.trim()) {
      updateList(editingListId!, {
        name: editListName.trim(),
        color: editListColor
      });
      setEditingListId(null);
    }
  };

  const cancelListEdit = () => {
    setEditingListId(null);
  };

  // Handle deleting a list
  const handleDeleteList = (listId: string) => {
    deleteList(listId);
    setShowListActions(null);
    // Navigate away if we're on the deleted list
    if (pathname === `/list/${listId}`) {
      router.push('/today');
    }
  };

  // Handle inline list creation
  const startAddingListInline = () => {
    setIsAddingListInline(true);
    setNewListName('');
    setNewListColor('#6366F1');
  };

  const saveNewListInline = async () => {
    if (newListName.trim()) {
      const newList = {
        name: newListName.trim(),
        color: newListColor,
      };
      const createdList = await addList(newList);
      setIsAddingListInline(false);
      
      // Navigate to the newly created list
      if (createdList) {
        router.push(`/list/${createdList.id}`);
      }
    }
  };

  const cancelAddListInline = () => {
    setIsAddingListInline(false);
  };

  // Count tasks for each list
  const getListTaskCount = useCallback((listId: string) => {
    return tasks.filter(task => task.listId === listId).length;
  }, [tasks]);

  // Get counts for today and upcoming tasks
  const getTodayTasksCount = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;
  }, [tasks]);
  
  const getUpcomingTasksCount = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() >= tomorrow.getTime();
    }).length;
  }, [tasks]);

  return (
    <div className="flex h-screen bg-gray-light dark:bg-dark relative">
      {/* When sidebar is closed, show a toggle button on the right edge */}
      {!sidebarOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-10 z-40 p-2 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-r-md"
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Overlay when sidebar is open - only on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed md:hidden left-0 inset-0 bg-black bg-opacity-40 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar - changed positioning and z-index for better mobile handling */}
      <aside 
        className={`w-64 bg-white dark:bg-gray-800 h-screen overflow-y-auto overflow-x-hidden flex-shrink-0 fixed md:sticky top-0 left-0 z-30 transition-transform duration-300 ease-in-out shadow-md ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:pt-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h1 className="text-xl font-bold dark:text-white">Menu</h1>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
        
        {/* Sidebar content - make scrollable */}
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {/* Search */}
          <div className="px-4 mt-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
              />
            </div>
          </div>
          
          {/* Tasks Navigation */}
          <div className="px-4 mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">TASKS</h2>
            <nav className="space-y-1">
              <Link
                href="/upcoming"
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/upcoming' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/upcoming' ? 'page' : undefined}
              >
                <span className={`mr-3 ${pathname === '/upcoming' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>»</span>
                <span className="flex-1">Upcoming</span>
                <span className={`px-2 py-0.5 text-xs rounded-md ${
                  pathname === '/upcoming'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'
                    : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {getUpcomingTasksCount()}
                </span>
              </Link>
              <Link
                href="/today"
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/today' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/today' ? 'page' : undefined}
              >
                <span className={`mr-3 ${pathname === '/today' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>≡</span>
                <span className="flex-1">Today</span>
                <span className={`px-2 py-0.5 text-xs rounded-md ${
                  pathname === '/today'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'
                    : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {getTodayTasksCount()}
                </span>
              </Link>
              <Link
                href="/pending"
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/pending' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/pending' ? 'page' : undefined}
              >
                <span className={`mr-3 flex items-center justify-center ${pathname === '/pending' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                <span className="flex-1">Pending Works</span>
              </Link>
              <Link
                href="/time-management"
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/time-management' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/time-management' ? 'page' : undefined}
              >
                <span className={`mr-3 flex items-center justify-center ${pathname === '/time-management' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="flex-1">Time Management</span>
              </Link>
              <Link
                href="/calendar"
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/calendar' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/calendar' ? 'page' : undefined}
              >
                <span className={`mr-3 flex items-center justify-center ${pathname === '/calendar' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="flex-1">Calendar</span>
              </Link>
              <Link
                href="/sticky-wall"
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/sticky-wall' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/sticky-wall' ? 'page' : undefined}
              >
                <span className={`mr-3 flex items-center justify-center ${pathname === '/sticky-wall' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="flex-1">Sticky Wall</span>
              </Link>
            </nav>
          </div>
          
          {/* Lists */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">LISTS</h2>
              <button 
                onClick={startAddingListInline}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
                aria-label="Add new list"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {/* Inline list creation form */}
              {isAddingListInline && (
                <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
                  <div className="mb-2">
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      placeholder="List name"
                      autoFocus
                    />
                  </div>
                  <div className="mb-2 flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Color:</span>
                    <input
                      type="color"
                      value={newListColor}
                      onChange={(e) => setNewListColor(e.target.value)}
                      className="w-6 h-6 border-0 p-0 rounded"
                    />
                  </div>
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={cancelAddListInline}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNewListInline}
                      className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                      disabled={!newListName.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              
              {/* List items */}
              {lists.map(list => (
                <div key={list.id} className="relative">
                  {editingListId === list.id ? (
                    <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="mb-2">
                        <input
                          type="text"
                          value={editListName}
                          onChange={(e) => setEditListName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                          autoFocus
                        />
                      </div>
                      <div className="mb-2 flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Color:</span>
                        <input
                          type="color"
                          value={editListColor}
                          onChange={(e) => setEditListColor(e.target.value)}
                          className="w-6 h-6 border-0 p-0 rounded"
                        />
                      </div>
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={cancelListEdit}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveListEdit}
                          className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                          disabled={!editListName.trim()}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/list/${list.id}`}
                        className={`flex items-center px-2 py-2 rounded-lg group transition-colors duration-150 ${
                          pathname === `/list/${list.id}` 
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        aria-current={pathname === `/list/${list.id}` ? 'page' : undefined}
                        onClick={() => setShowListActions(null)}
                      >
                        <span 
                          className="h-4 w-4 rounded-full mr-3" 
                          style={{ backgroundColor: list.color }}
                          aria-hidden="true"
                        ></span>
                        <span className="flex-1">{list.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-md ${
                          pathname === `/list/${list.id}`
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200'
                            : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {tasks.filter(task => task.listId === list.id).length}
                        </span>
                        <button 
                          className="opacity-0 group-hover:opacity-100 ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition-opacity duration-150"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowListActions(showListActions === list.id ? null : list.id);
                          }}
                          aria-label={`Actions for ${list.name}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </Link>
                      
                      {/* List actions dropdown */}
                      {showListActions === list.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => startEditingList(list)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* Tags */}
          <div className="px-4 mb-6">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">TAGS</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full text-xs dark:bg-blue-900 dark:text-blue-300">Tag 1</span>
              <span className="bg-pink-50 text-pink-600 px-3 py-0.5 rounded-full text-xs dark:bg-pink-900 dark:text-pink-300">Tag 2</span>
              <span className="text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">+ Add Tag</span>
            </div>
          </div>
          
          {/* Bottom actions */}
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0 left-0 right-0">
            <div className="space-y-2">
              <Link 
                href="/profile" 
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/profile' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/profile' ? 'page' : undefined}
              >
                <UserIcon className={`h-5 w-5 mr-3 ${pathname === '/profile' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`} />
                <span>Profile</span>
              </Link>
              <Link 
                href="/settings" 
                className={`flex items-center px-2 py-2 rounded-lg transition-colors duration-150 ${
                  pathname === '/settings' 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                aria-current={pathname === '/settings' ? 'page' : undefined}
              >
                <Cog6ToothIcon className={`h-5 w-5 mr-3 ${pathname === '/settings' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`} />
                <span>Settings</span>
              </Link>
              <button 
                onClick={handleSignOut} 
                className="flex items-center px-2 py-2 rounded-lg w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content - adjusted for proper spacing */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out dark:bg-dark dark:text-white ${
        sidebarOpen ? 'md:ml-0' : 'ml-0'
      } px-6 py-6`}>
        <div className="max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;