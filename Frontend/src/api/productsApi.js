import apiClient from './client';

export const productsApi = {
  getProducts: async () => {
    try {
      const response = await apiClient.get('/products');
      const res = response.data;
      if (res.error) return [];
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    } catch (e) {
      console.error('Failed to fetch products:', e?.response?.data || e.message);
      return [];
    }
  },

  createProduct: async (productData) => {
    const payload = {
      product_name: productData.product_name,
      category: productData.category || 'General',
      unit: productData.unit || 'KG',
      description: productData.description || 'Fresh agricultural produce'
    };

    const response = await apiClient.post('/products', payload);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to create product');
    }
    return res.data || res;
  }
};
