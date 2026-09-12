import apiClient from './client';

export const notificationsApi = {
  getMine: async () => {
    try {
      const response = await apiClient.get('/notifications/mine');
      const res = response.data;
      if (res.error) return [];
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    } catch (e) {
      return [];
    }
  },

  markAsRead: async (notifId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notifId}/read`);
      const res = response.data;
      return res.data || res;
    } catch (e) {
      console.error(`Failed to mark notification #${notifId} as read:`, e?.response?.data || e.message);
      return null;
    }
  }
};
