// FILE: frontend/src/hooks/useNotifications.ts
import { create } from 'zustand';
import { notificationAPI } from '@/services/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const { data } = await notificationAPI.getAll({ limit: 20 });
      set({ 
        notifications: data.notifications,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await notificationAPI.getUnreadCount();
      set({ unreadCount: data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      
      const { notifications, unreadCount } = get();
      const updatedNotifications = notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      );
      
      set({
        notifications: updatedNotifications,
        unreadCount: Math.max(0, unreadCount - 1)
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      const { notifications } = get();
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      
      set({
        notifications: updatedNotifications,
        unreadCount: 0
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationAPI.delete(id);
      
      const { notifications, unreadCount } = get();
      const notification = notifications.find(n => n._id === id);
      const updatedNotifications = notifications.filter(n => n._id !== id);
      
      set({
        notifications: updatedNotifications,
        unreadCount: notification?.isRead ? unreadCount : Math.max(0, unreadCount - 1)
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },
}));