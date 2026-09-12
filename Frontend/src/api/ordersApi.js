import apiClient from './client';

export const ordersApi = {
  getMine: async (user) => {
    try {
      const params = {};
      if (user?.role === 'BUYER') {
        params.buyer_id = user.user_id;
      } else if (user?.role === 'FARMER') {
        params.farmer_id = user.user_id;
      }
      const response = await apiClient.get('/orders', { params });
      const res = response.data;
      if (res.error) return [];
      const orders = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      return orders;
    } catch (e) {
      console.error('Failed to fetch orders:', e?.response?.data || e.message);
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

  createOrder: async (orderData, user) => {
    const payload = {
      listing_id: Number(orderData.listing_id),
      quantity: Number(orderData.quantity),
      price_per_unit: Number(orderData.price_per_unit || orderData.price || 0),
      buyer_id: orderData.buyer_id || user?.user_id
    };

    const response = await apiClient.post('/orders', payload);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to create order');
    }
    return res.data || res;
  },

  claimPayment: async (orderId, amount, paymentMethod = 'UPI', transactionRef) => {
    const payload = {
      order_id: Number(orderId),
      amount: Number(amount || 0),
      payment_method: paymentMethod,
      payment_status: 'PAID',
      transaction_id: transactionRef || `TXN-${Date.now()}`
    };

    const response = await apiClient.post('/payments', payload);
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to claim payment');
    }

    // Also update order status to CONFIRMED
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: 'CONFIRMED' });
    } catch (err) {
      console.warn('Could not auto-update order status to CONFIRMED:', err.message);
    }

    return res.data || res;
  },

  confirmReceipt: async (orderId, received = true) => {
    const status = received ? 'CONFIRMED' : 'CANCELLED';
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to update order status');
    }
    return res.data || res;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status: 'CANCELLED', reason });
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to cancel order');
    }
    return res.data || res;
  },

  returnOrder: async (orderId, reason, note) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status: 'CANCELLED', reason: note || reason });
    const res = response.data;
    if (res.error) {
      throw new Error(res.message || 'Failed to submit return request');
    }
    return res.data || res;
  }
};
