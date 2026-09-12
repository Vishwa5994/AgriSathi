import apiClient from './client';

export const priceHistoryApi = {
  getPriceHistory: async (productId, location) => {
    try {
      const response = await apiClient.get('/price-history', {
        params: { product_id: productId, location }
      });
      const res = response.data;
      if (res.error) return [];
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Failed to fetch price history:', e?.response?.data || e.message);
      return [];
    }
  }
};
