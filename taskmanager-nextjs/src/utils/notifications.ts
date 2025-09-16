/**
 * Notification management utilities
 */

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  taskDeadlines: boolean;
  dailyDigest: boolean;
  sound: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface TaskNotification {
  id: string;
  taskId: string;
  title: string;
  body: string;
  type: 'reminder' | 'deadline' | 'overdue' | 'digest';
  scheduledFor: Date;
  tag?: string;
}

const NOTIFICATION_SETTINGS_KEY = 'notification-settings';
const NOTIFICATION_PERMISSION_REQUESTED_KEY = 'notification-permission-requested';

/**
 * Default notification settings
 */
const defaultSettings: NotificationSettings = {
  enabled: false,
  taskReminders: true,
  taskDeadlines: true,
  dailyDigest: false,
  sound: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

/**
 * Check if notifications are supported
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!areNotificationsSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!areNotificationsSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }

  // Mark that we've requested permission
  localStorage.setItem(NOTIFICATION_PERMISSION_REQUESTED_KEY, 'true');

  const permission = await Notification.requestPermission();
  
  // Update settings based on permission
  if (permission === 'granted') {
    const settings = getNotificationSettings();
    settings.enabled = true;
    saveNotificationSettings(settings);
  }

  return permission;
}

/**
 * Check if permission has been requested before
 */
export function hasRequestedPermission(): boolean {
  return localStorage.getItem(NOTIFICATION_PERMISSION_REQUESTED_KEY) === 'true';
}

/**
 * Save notification settings
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Get notification settings
 */
export function getNotificationSettings(): NotificationSettings {
  // Return defaults during SSR
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { ...defaultSettings };
  }
  
  const settingsString = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  
  if (!settingsString) {
    return { ...defaultSettings };
  }

  try {
    const settings = JSON.parse(settingsString) as NotificationSettings;
    // Merge with defaults to ensure all properties exist
    return { ...defaultSettings, ...settings };
  } catch {
    return { ...defaultSettings };
  }
}

/**
 * Check if notifications are currently enabled and allowed
 */
export function canSendNotifications(): boolean {
  const settings = getNotificationSettings();
  return (
    areNotificationsSupported() &&
    getNotificationPermission() === 'granted' &&
    settings.enabled
  );
}

/**
 * Check if we're in quiet hours
 */
export function isInQuietHours(): boolean {
  const settings = getNotificationSettings();
  
  if (!settings.quietHours.enabled) {
    return false;
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const { start, end } = settings.quietHours;
  
  // Handle quiet hours that span midnight
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  } else {
    return currentTime >= start && currentTime <= end;
  }
}

/**
 * Send a browser notification
 */
export async function sendNotification(notification: Omit<TaskNotification, 'id' | 'scheduledFor'>): Promise<void> {
  if (!canSendNotifications()) {
    console.warn('Cannot send notification: permission denied or notifications disabled');
    return;
  }

  const settings = getNotificationSettings();

  // Check if this type of notification is enabled
  switch (notification.type) {
    case 'reminder':
      if (!settings.taskReminders) return;
      break;
    case 'deadline':
    case 'overdue':
      if (!settings.taskDeadlines) return;
      break;
    case 'digest':
      if (!settings.dailyDigest) return;
      break;
  }

  // Check quiet hours
  if (isInQuietHours()) {
    console.log('Notification skipped due to quiet hours');
    return;
  }

  try {
    const notificationOptions: NotificationOptions = {
      body: notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.tag || notification.taskId,
      silent: !settings.sound,
      data: {
        taskId: notification.taskId,
        type: notification.type,
      },
    };

    const browserNotification = new Notification(notification.title, notificationOptions);

    // Handle notification click
    browserNotification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      // Navigate to the task (you can customize this)
      window.location.href = `/today?taskId=${notification.taskId}`;
      browserNotification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 10000);

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Schedule a notification for a task
 */
export function scheduleTaskNotification(
  taskId: string,
  title: string,
  dueDate: Date,
  reminderMinutes: number = 30
): void {
  if (!canSendNotifications()) {
    return;
  }

  const reminderTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);
  const now = new Date();

  // Only schedule if the reminder time is in the future
  if (reminderTime > now) {
    const timeoutMs = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification({
        taskId,
        title: 'Task Reminder',
        body: `"${title}" is due in ${reminderMinutes} minutes`,
        type: 'reminder',
        tag: `reminder-${taskId}`,
      });
    }, timeoutMs);
  }

  // Schedule deadline notification
  if (dueDate > now) {
    const deadlineTimeoutMs = dueDate.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification({
        taskId,
        title: 'Task Deadline',
        body: `"${title}" is due now!`,
        type: 'deadline',
        tag: `deadline-${taskId}`,
      });
    }, deadlineTimeoutMs);
  }
}

/**
 * Send daily digest notification
 */
export function sendDailyDigest(taskCount: number, overdueCount: number): void {
  if (!canSendNotifications()) {
    return;
  }

  const settings = getNotificationSettings();
  if (!settings.dailyDigest) {
    return;
  }

  let body = `You have ${taskCount} tasks for today`;
  if (overdueCount > 0) {
    body += ` and ${overdueCount} overdue tasks`;
  }

  sendNotification({
    taskId: 'daily-digest',
    title: 'Daily Task Summary',
    body,
    type: 'digest',
    tag: 'daily-digest',
  });
}

/**
 * Test notification functionality
 */
export async function sendTestNotification(): Promise<void> {
  if (!canSendNotifications()) {
    throw new Error('Notifications are not available');
  }

  await sendNotification({
    taskId: 'test',
    title: 'Test Notification',
    body: 'Notifications are working correctly!',
    type: 'reminder',
    tag: 'test-notification',
  });
}

/**
 * Clear all scheduled notifications for a task
 */
export function clearTaskNotifications(taskId: string): void {
  // Note: Browser doesn't provide a way to cancel setTimeout by tag
  // This would typically be handled by a service worker for proper scheduling
  console.log(`Clearing notifications for task ${taskId}`);
}

/**
 * Initialize notification system
 */
export function initializeNotifications(): void {
  // Check if we should request permission on app start
  const settings = getNotificationSettings();
  
  if (settings.enabled && getNotificationPermission() === 'default' && !hasRequestedPermission()) {
    // Don't auto-request, let user explicitly enable
    console.log('Notifications are enabled in settings but permission not granted');
  }

  // Register service worker for notifications if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  }
}