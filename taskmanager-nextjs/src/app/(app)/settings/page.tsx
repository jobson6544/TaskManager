'use client';

import { useState, useEffect } from 'react';
import useTaskStore from '@/store/useTaskStore';
import { 
  CogIcon, 
  SunIcon, 
  MoonIcon, 
  TrashIcon,
  BellIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermission,
  areNotificationsSupported,
  sendTestNotification,
  type NotificationSettings
} from '@/utils/notifications';
import {
  getCookieConsentStatus,
  clearNonEssentialCookies,
  getAllCookies,
  deleteCookie,
  type CookieConsent
} from '@/utils/cookies';

const SettingsPage = () => {
  const { tasks, lists, tags, notes, resetTasks, resetAllData, loading } = useTaskStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isClient, setIsClient] = useState(false);
  
  // Initialize theme after component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(savedTheme || systemTheme);
    }
  }, []);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    taskReminders: true,
    taskDeadlines: true,
    dailyDigest: false,
    sound: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  // Initialize notification settings after component mounts
  useEffect(() => {
    if (isClient) {
      const settings = getNotificationSettings();
      setNotificationSettings(settings);
    }
  }, [isClient]);
  
  // Cookie settings
  const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null);
  const [showCookieManager, setShowCookieManager] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  // UI states
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmResetAll, setShowConfirmResetAll] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy'>('general');
  const [isResetting, setIsResetting] = useState(false);

  // Initialize component state
  useEffect(() => {
    const settings = getNotificationSettings();
    setNotificationSettings(settings);
    setNotificationPermission(getNotificationPermission());
    
    const { consent } = getCookieConsentStatus();
    setCookieConsent(consent);
  }, []);

  // Apply theme on component mount and when theme changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    showSaveMessage('Theme updated!');
  };

  // Notification handlers
  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: any) => {
    const updatedSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(updatedSettings);
    saveNotificationSettings(updatedSettings);
    showSaveMessage('Notification settings updated!');
  };

  const handleRequestNotificationPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        showSaveMessage('Notification permission granted!');
      } else {
        showSaveMessage('Notification permission denied. You can enable it in browser settings.');
      }
    } catch (error) {
      showSaveMessage('Failed to request notification permission.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      showSaveMessage('Test notification sent!');
    } catch (error) {
      showSaveMessage('Failed to send test notification. Check your settings.');
    }
  };

  // Cookie handlers
  const handleCookieConsentChange = (consent: CookieConsent) => {
    setCookieConsent(consent);
    showSaveMessage('Cookie preferences updated!');
  };

  const handleClearCookies = () => {
    clearNonEssentialCookies();
    showSaveMessage('Non-essential cookies cleared!');
  };

  const handleShowCookieManager = () => {
    setShowCookieBanner(true);
  };

  // Data management
  const handleResetTasks = () => {
    resetTasks();
    setShowConfirmReset(false);
    showSaveMessage('All tasks have been deleted!');
  };

  const handleResetAllData = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      setShowConfirmResetAll(false);
      showSaveMessage('All data has been reset to defaults!');
    } catch (error) {
      showSaveMessage('Error resetting data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto dark:bg-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center mb-8">
          <CogIcon className="h-8 w-8 mr-3 text-blue-600 dark:text-gray-400" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'general', label: 'General', icon: CogIcon },
            { id: 'notifications', label: 'Notifications', icon: BellIcon },
            { id: 'privacy', label: 'Privacy & Cookies', icon: ShieldCheckIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-gray-200 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            {/* Appearance */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <SunIcon className="h-5 w-5 mr-2 text-orange-500 dark:text-gray-400" />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-3">Theme</p>
                <div className="flex">
                  <button
                    className={`flex items-center justify-center px-6 py-3 border rounded-l-lg transition-colors ${
                      theme === 'light'
                        ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
                        : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <SunIcon className="h-5 w-5 mr-2" />
                    Light
                  </button>
                  <button
                    className={`flex items-center justify-center px-6 py-3 border rounded-r-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500'
                        : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <MoonIcon className="h-5 w-5 mr-2" />
                    Dark
                  </button>
                </div>
              </div>
            </section>

            {/* Data Management */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <TrashIcon className="h-5 w-5 mr-2 text-red-500 dark:text-gray-400" />
                <h2 className="text-xl font-semibold">Data Management</h2>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Manage your task data and reset options.
              </p>

              {/* Data Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-gray-200">{tasks.length}</div>
                  <div className="text-sm text-blue-600 dark:text-gray-400">Tasks</div>
                </div>
                <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-gray-200">{lists.length}</div>
                  <div className="text-sm text-green-600 dark:text-gray-400">Lists</div>
                </div>
                <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-gray-200">{tags.length}</div>
                  <div className="text-sm text-purple-600 dark:text-gray-400">Tags</div>
                </div>
                <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-gray-200">{notes.length}</div>
                  <div className="text-sm text-orange-600 dark:text-gray-400">Notes</div>
                </div>
              </div>

              {/* Reset Tasks Only */}
              <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-800 dark:text-gray-200 mb-2">
                      Reset Tasks Only
                    </h3>
                    <p className="text-orange-700 dark:text-gray-300 text-sm mb-3">
                      This will only delete your tasks, keeping lists, tags, and notes intact.
                    </p>
                    
                    {showConfirmReset ? (
                      <div className="space-y-3">
                        <p className="text-orange-800 dark:text-gray-200 font-medium">
                          Are you sure you want to delete all {tasks.length} tasks?
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleResetTasks}
                            className="px-4 py-2 bg-orange-600 dark:bg-gray-600 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-gray-500 text-sm font-medium"
                            disabled={isResetting}
                          >
                            Yes, delete all tasks
                          </button>
                          <button
                            onClick={() => setShowConfirmReset(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                            disabled={isResetting}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmReset(true)}
                        className="flex items-center px-4 py-2 bg-orange-100 dark:bg-gray-600 text-orange-700 dark:text-gray-200 rounded-lg hover:bg-orange-200 dark:hover:bg-gray-500 text-sm font-medium"
                        disabled={tasks.length === 0 || isResetting}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Reset Tasks Only ({tasks.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset All Data */}
              <div className="bg-red-50 dark:bg-gray-700 border border-red-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-gray-400 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-800 dark:text-gray-200 mb-2">
                      Complete Data Reset
                    </h3>
                    <p className="text-red-700 dark:text-gray-300 text-sm mb-3">
                      This will permanently delete ALL your data (tasks, custom lists, custom tags, and notes) and reset everything to defaults. This action cannot be undone.
                    </p>
                    
                    {showConfirmResetAll ? (
                      <div className="space-y-3">
                        <p className="text-red-800 dark:text-gray-200 font-medium">
                          Are you absolutely sure? This will delete everything and cannot be undone.
                        </p>
                        <div className="bg-red-100 dark:bg-gray-600 rounded p-3 mb-3">
                          <div className="text-sm text-red-800 dark:text-gray-200 space-y-1">
                            <div>• {tasks.length} tasks will be deleted</div>
                            <div>• {Math.max(0, lists.length - 3)} custom lists will be deleted</div>
                            <div>• {Math.max(0, tags.length - 2)} custom tags will be deleted</div>
                            <div>• {notes.length} notes will be deleted</div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleResetAllData}
                            className="px-4 py-2 bg-red-600 dark:bg-gray-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-gray-500 text-sm font-medium flex items-center"
                            disabled={isResetting}
                          >
                            {isResetting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Resetting...
                              </>
                            ) : (
                              'Yes, delete everything'
                            )}
                          </button>
                          <button
                            onClick={() => setShowConfirmResetAll(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                            disabled={isResetting}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmResetAll(true)}
                        className="flex items-center px-4 py-2 bg-red-100 dark:bg-gray-600 text-red-700 dark:text-gray-200 rounded-lg hover:bg-red-200 dark:hover:bg-gray-500 text-sm font-medium"
                        disabled={isResetting || (tasks.length === 0 && lists.length <= 3 && tags.length <= 2 && notes.length === 0)}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Complete Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <BellIcon className="h-5 w-5 mr-2 text-blue-500 dark:text-gray-400" />
                <h2 className="text-xl font-semibold">Notification Settings</h2>
              </div>

              {/* Permission Status */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Browser Permission:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    notificationPermission === 'granted' 
                      ? 'bg-green-100 text-green-800 dark:bg-gray-600 dark:text-gray-200'
                      : notificationPermission === 'denied'
                      ? 'bg-red-100 text-red-800 dark:bg-gray-600 dark:text-gray-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {notificationPermission === 'granted' ? 'Allowed' : 
                     notificationPermission === 'denied' ? 'Blocked' : 'Not Requested'}
                  </span>
                </div>
                
                {notificationPermission !== 'granted' && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {notificationPermission === 'denied' 
                        ? 'Notifications are blocked. Enable them in your browser settings.'
                        : 'Allow notifications to receive task reminders and alerts.'
                      }
                    </p>
                    {notificationPermission !== 'denied' && (
                      <button
                        onClick={handleRequestNotificationPermission}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Enable Notifications
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Notification Toggles */}
              <div className="space-y-4">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium">Enable Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Master switch for all notifications
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingChange('enabled', !notificationSettings.enabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      notificationSettings.enabled ? 'bg-blue-500 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    disabled={notificationPermission !== 'granted'}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationSettings.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                {/* Task Reminders */}
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium">Task Reminders</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified before tasks are due
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingChange('taskReminders', !notificationSettings.taskReminders)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      notificationSettings.taskReminders && notificationSettings.enabled 
                        ? 'bg-blue-500 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    disabled={!notificationSettings.enabled}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationSettings.taskReminders && notificationSettings.enabled 
                        ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                {/* Task Deadlines */}
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium">Task Deadlines</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified when tasks are due or overdue
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingChange('taskDeadlines', !notificationSettings.taskDeadlines)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      notificationSettings.taskDeadlines && notificationSettings.enabled 
                        ? 'bg-blue-500 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    disabled={!notificationSettings.enabled}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationSettings.taskDeadlines && notificationSettings.enabled 
                        ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                {/* Daily Digest */}
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium">Daily Digest</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Daily summary of your tasks
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingChange('dailyDigest', !notificationSettings.dailyDigest)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      notificationSettings.dailyDigest && notificationSettings.enabled 
                        ? 'bg-blue-500 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    disabled={!notificationSettings.enabled}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationSettings.dailyDigest && notificationSettings.enabled 
                        ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h3 className="font-medium">Notification Sound</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Play sound with notifications
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationSettingChange('sound', !notificationSettings.sound)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      notificationSettings.sound && notificationSettings.enabled 
                        ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    disabled={!notificationSettings.enabled}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      notificationSettings.sound && notificationSettings.enabled 
                        ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Test Notification */}
              {notificationSettings.enabled && notificationPermission === 'granted' && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleTestNotification}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                  >
                    Send Test Notification
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Privacy & Cookie Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500" />
                <h2 className="text-xl font-semibold">Privacy & Cookie Settings</h2>
              </div>

              {/* Cookie Consent Status */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="font-medium mb-2">Cookie Consent Status</h3>
                {cookieConsent ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className={`flex items-center ${cookieConsent.necessary ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${cookieConsent.necessary ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        Essential: {cookieConsent.necessary ? 'Allowed' : 'Blocked'}
                      </div>
                      <div className={`flex items-center ${cookieConsent.preferences ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${cookieConsent.preferences ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        Preferences: {cookieConsent.preferences ? 'Allowed' : 'Blocked'}
                      </div>
                      <div className={`flex items-center ${cookieConsent.analytics ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${cookieConsent.analytics ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        Analytics: {cookieConsent.analytics ? 'Allowed' : 'Blocked'}
                      </div>
                      <div className={`flex items-center ${cookieConsent.marketing ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${cookieConsent.marketing ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        Marketing: {cookieConsent.marketing ? 'Allowed' : 'Blocked'}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {cookieConsent.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No cookie preferences set</p>
                )}
              </div>

              {/* Cookie Management Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleShowCookieManager}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Manage Cookie Preferences</h3>
                      <p className="text-sm text-blue-100 mt-1">
                        Choose which cookies you want to allow
                      </p>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={handleClearCookies}
                  className="w-full px-4 py-3 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Clear Non-Essential Cookies</h3>
                      <p className="text-sm opacity-75 mt-1">
                        Remove all cookies except necessary ones
                      </p>
                    </div>
                    <TrashIcon className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {/* Privacy Information */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h3 className="font-medium mb-2">How We Use Cookies</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>• <strong>Essential cookies:</strong> Required for basic functionality and security</p>
                  <p>• <strong>Preference cookies:</strong> Remember your settings and customizations</p>
                  <p>• <strong>Analytics cookies:</strong> Help us understand usage patterns (anonymous)</p>
                  <p>• <strong>Marketing cookies:</strong> Currently not used but reserved for future features</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Read our{' '}
                  <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  for more information.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div className="fixed bottom-8 right-8 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg z-50">
            {saveMessage}
          </div>
        )}

        {/* Cookie Banner */}
        {showCookieBanner && (
          <CookieConsentBanner
            onConsentChange={(consent) => {
              handleCookieConsentChange(consent);
              setShowCookieBanner(false);
            }}
          />
        )}
      </div>
    </SidebarLayout>
  );
}

export default SettingsPage;