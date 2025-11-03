import axiosInstance from './axios';
import { handleApiError } from './api';
import { NotificationResponse, MarkReadResponse } from '../types/notification';

export const notificationApi = {
  /**
   * Fetch all notifications for the current user
   * @param page - Page number (default: 1)
   * @param pageSize - Number of items per page (default: 20)
   */
  getNotifications: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<NotificationResponse> => {
    try {
      const response = await axiosInstance.get('/notifications', {
        params: { page, pageSize },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark a single notification as read
   * @param id - Notification ID
   */
  markAsRead: async (id: string): Promise<MarkReadResponse> => {
    try {
      const response = await axiosInstance.post('/notifications/mark-read', {
        id,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<MarkReadResponse> => {
    try {
      const response = await axiosInstance.post(
        '/notifications/mark-all-read'
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete a notification
   * @param id - Notification ID
   */
  deleteNotification: async (id: string): Promise<MarkReadResponse> => {
    try {
      const response = await axiosInstance.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
