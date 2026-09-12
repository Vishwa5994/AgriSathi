import apiClient from './client';
import { mockAuthApi } from './mockService';

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (e) {
      console.log('Using dev mock auth for login');
      return await mockAuthApi.login(email, password);
    }
  },

  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.data;
    } catch (e) {
      console.log('Using dev mock auth for signup');
      return await mockAuthApi.signup(userData);
    }
  },

  loginWithGoogle: async (googleData) => {
    try {
      const response = await apiClient.post('/auth/google', googleData);
      return response.data;
    } catch (e) {
      console.log('Using dev mock auth for google login');
      return await mockAuthApi.loginWithGoogle(googleData);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (e) {
      return null;
    }
  },

  updateProfile: async (userId, profileData) => {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      return response.data;
    } catch (e) {
      return await mockAuthApi.updateProfile(userId, profileData);
    }
  }
};
