import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getMine(user);
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (orderData) => {
    try {
      const newOrder = await ordersApi.createOrder(orderData, user);
      toast.success('Order placed successfully!');
      fetchOrders();
      return newOrder;
    } catch (err) {
      toast.error('Failed to create order');
      throw err;
    }
  };

  const claimPayment = async (orderId, paymentMethod, txnRef) => {
    try {
      const updatedOrder = await ordersApi.claimPayment(orderId, paymentMethod, txnRef);
      toast.success('Payment claim submitted! Farmer notified.');
      fetchOrders();
      return updatedOrder;
    } catch (err) {
      toast.error('Failed to submit payment claim');
      throw err;
    }
  };

  const confirmReceipt = async (orderId, received) => {
    try {
      const updatedOrder = await ordersApi.confirmReceipt(orderId, received);
      if (received) {
        toast.success('Payment confirmed! Order marked CONFIRMED.');
      } else {
        toast.error('Order cancelled / payment rejected.');
      }
      fetchOrders();
      return updatedOrder;
    } catch (err) {
      toast.error('Action failed');
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    claimPayment,
    confirmReceipt
  };
};
