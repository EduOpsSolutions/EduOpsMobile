import { create } from 'zustand';
import { notificationApi } from '../utils/notificationApi';
import { Notification } from '../types/notification';

interface NotificationStore {
  // State
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;

  // Auto-refresh
  refreshInterval: NodeJS.Timeout | null;

  // Actions
  fetchNotifications: (page?: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Computed values
  getUnreadNotifications: () => Notification[];

  // Auto-refresh control
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;

  // Reset
  resetStore: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Initial State
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  page: 1,
  pageSize: 20,
  total: 0,
  hasMore: true,
  refreshInterval: null,

  // Fetch notifications
  fetchNotifications: async (page = 1) => {
    try {
      set({ loading: true, error: null });

      const response = await notificationApi.getNotifications(
        page,
        get().pageSize
      );

      // Calculate unread count
      const unreadCount = response.data.filter((n) => !n.isRead).length;

      set({
        notifications: response.data,
        unreadCount,
        page: response.page,
        total: response.total,
        hasMore: response.page * response.pageSize < response.total,
        loading: false,
      });
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      set({
        loading: false,
        error: error.message || 'Failed to fetch notifications',
      });
    }
  },

  // Refresh notifications (silent refresh without loading state)
  refreshNotifications: async () => {
    try {
      const response = await notificationApi.getNotifications(
        get().page,
        get().pageSize
      );

      // Calculate unread count
      const unreadCount = response.data.filter((n) => !n.isRead).length;

      set({
        notifications: response.data,
        unreadCount,
        page: response.page,
        total: response.total,
        hasMore: response.page * response.pageSize < response.total,
        error: null,
      });
    } catch (error: any) {
      console.error('Failed to refresh notifications:', error);
      // Silent fail - don't update error state for background refresh
    }
  },

  // Mark single notification as read
  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      const newUnreadCount = updatedNotifications.filter((n) => !n.isRead).length;

      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      });

      // API call
      await notificationApi.markAsRead(id);

      // Optionally refresh to ensure sync
      // await get().refreshNotifications();
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);

      // Revert optimistic update on error
      await get().refreshNotifications();

      set({
        error: error.message || 'Failed to mark notification as read',
      });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      // Optimistic update
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));

      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      });

      // API call
      await notificationApi.markAllAsRead();

      // Refresh to ensure sync
      await get().refreshNotifications();
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);

      // Revert optimistic update on error
      await get().refreshNotifications();

      set({
        error: error.message || 'Failed to mark all as read',
      });
    }
  },

  // Delete a notification
  deleteNotification: async (id: string) => {
    try {
      // Optimistic update
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.filter(
        (notif) => notif.id !== id
      );
      const newUnreadCount = updatedNotifications.filter((n) => !n.isRead).length;

      set({
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
        total: get().total - 1,
      });

      // API call
      await notificationApi.deleteNotification(id);

      // Optionally refresh
      // await get().refreshNotifications();
    } catch (error: any) {
      console.error('Failed to delete notification:', error);

      // Revert optimistic update on error
      await get().refreshNotifications();

      set({
        error: error.message || 'Failed to delete notification',
      });
    }
  },

  // Get only unread notifications
  getUnreadNotifications: () => {
    return get().notifications.filter((notif) => !notif.isRead);
  },

  // Start auto-refresh (default: every 30 seconds)
  startAutoRefresh: (intervalMs = 30000) => {
    // Clear existing interval if any
    const currentInterval = get().refreshInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    // Set new interval
    const interval = setInterval(() => {
      get().refreshNotifications();
    }, intervalMs);

    set({ refreshInterval: interval });
  },

  // Stop auto-refresh
  stopAutoRefresh: () => {
    const interval = get().refreshInterval;
    if (interval) {
      clearInterval(interval);
      set({ refreshInterval: null });
    }
  },

  // Reset store
  resetStore: () => {
    // Clear interval
    const interval = get().refreshInterval;
    if (interval) {
      clearInterval(interval);
    }

    set({
      notifications: [],
      loading: false,
      error: null,
      unreadCount: 0,
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true,
      refreshInterval: null,
    });
  },
}));

export default useNotificationStore;
