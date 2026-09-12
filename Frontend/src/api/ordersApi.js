import apiClient from './client';
import { mockOrdersApi } from './mockService';

export const ordersApi = {
  getMine: async (user) => {
    try {
      const response = await apiClient.get('/orders/mine');
      return response.data;
    } catch (e) {
      return await mockOrdersApi.getMine(user);
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (e) {
      return await mockOrdersApi.getOrderById(id);
    }
  },

  createOrder: async (orderData, currentUser) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (e) {
      return await mockOrdersApi.createOrder(orderData, currentUser);
    }
  },

  claimPayment: async (orderId, paymentMethod, transactionRef) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/claim-payment`, {
        payment_method: paymentMethod,
        transaction_id: transactionRef
      });
      return response.data;
    } catch (e) {
      return await mockOrdersApi.claimPayment(orderId, paymentMethod, transactionRef);
    }
  },

  confirmReceipt: async (orderId, received = true) => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/confirm-receipt`, {
        received
      });
      return response.data;
    } catch (e) {
      return await mockOrdersApi.confirmReceipt(orderId, received);
    }
  }
};
