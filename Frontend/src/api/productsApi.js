import apiClient from './client';
import { mockProductsApi } from './mockService';

export const productsApi = {
  getProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      return response.data;
    } catch (e) {
      return await mockProductsApi.getProducts();
    }
  },
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (e) {
      return await mockProductsApi.createProduct(productData);
    }
  }
};
