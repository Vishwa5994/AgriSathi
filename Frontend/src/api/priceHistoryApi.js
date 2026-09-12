import apiClient from './client';
import { mockPriceHistoryApi } from './mockService';

export const priceHistoryApi = {
  getPriceHistory: async (productId, location) => {
    try {
      const response = await apiClient.get('/price-history', {
        params: { product_id: productId, location }
      });
      return response.data;
    } catch (e) {
      return await mockPriceHistoryApi.getPriceHistory(productId);
    }
  }
};
