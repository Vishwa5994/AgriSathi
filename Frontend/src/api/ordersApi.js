import apiClient from './client';

export const ordersApi = {
  getMine: async () => {
    try {
      const response = await apiClient.get('/orders/mine');
      const res = response.data;
      if (res.error) return [];
      const orders = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      return orders;
    } catch (e) {
      // 404 or empty orders for user
      return [];
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      const res = response.data;
      if (res.error) return null;
      return res.data || res;
    } catch (e) {
      console.error(`Failed to fetch order #${id}:`, e?.response?.data || e.message);
      return null;
    }
  },

  createOrder: async (orderData) => {
    const payload = {
      listing_id: Number(orderData.listing_id),
      quantity: Number(orderData.quantity)
    };

    const response = await apiClient.post('/orders', payload);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to create order');
    }
    return res.data || res;
  },

  claimPayment: async (orderId, paymentMethod = 'UPI', transactionRef) => {
    const payload = {
      payment_method: paymentMethod,
      transaction_id: transactionRef || `TXN-${Date.now()}`
    };

    const response = await apiClient.post(`/orders/${orderId}/claim-payment`, payload);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to claim payment');
    }
    return res.data || res;
  },

  confirmReceipt: async (orderId, received = true) => {
    const response = await apiClient.post(`/orders/${orderId}/confirm-receipt`, { received });
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to confirm receipt');
    }
    return res.data || res;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to cancel order');
    }
    return res.data || res;
  },

  returnOrder: async (orderId, reason, note) => {
    const response = await apiClient.post(`/orders/${orderId}/return`, { reason, note });
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to submit return request');
    }
    return res.data || res;
  }
};
