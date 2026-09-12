import apiClient from './client';
import { mockNotificationsApi } from './mockService';

export const notificationsApi = {
  getMine: async (user) => {
    try {
      const response = await apiClient.get('/notifications/mine');
      return response.data;
    } catch (e) {
      return await mockNotificationsApi.getMine(user);
    }
  },

  markAsRead: async (notifId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notifId}/read`);
      return response.data;
    } catch (e) {
      return await mockNotificationsApi.markAsRead(notifId);
    }
  }
};
