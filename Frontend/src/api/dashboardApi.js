import apiClient from './client';

export const dashboardApi = {
  getFarmerDashboard: async (farmerId) => {
    try {
      const url = farmerId ? `/dashboard/farmer?farmer_id=${farmerId}` : '/dashboard/farmer';
      const response = await apiClient.get(url);
      return response.data?.data || response.data;
    } catch (err) {
      console.error('dashboardApi.getFarmerDashboard error:', err);
      throw err;
    }
  },

  getBuyerDashboard: async (buyerId) => {
    try {
      const url = buyerId ? `/dashboard/buyer?buyer_id=${buyerId}` : '/dashboard/buyer';
      const response = await apiClient.get(url);
      return response.data?.data || response.data;
    } catch (err) {
      console.error('dashboardApi.getBuyerDashboard error:', err);
      throw err;
    }
  },

  getAdminDashboard: async () => {
    try {
      const response = await apiClient.get('/dashboard/admin');
      return response.data?.data || response.data;
    } catch (err) {
      console.error('dashboardApi.getAdminDashboard error:', err);
      throw err;
    }
  }
};

export default dashboardApi;
