import apiClient from './client';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || 'Invalid credentials');
    }
    if (data.token) {
      localStorage.setItem('agri_auth_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('agri_user', JSON.stringify(data.user));
    }
    return { user: data.user, token: data.token };
  },

  signup: async (userData) => {
    const payload = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '9876543210',
      password: userData.password,
      role: userData.role || 'FARMER'
    };

    const response = await apiClient.post('/auth/register', payload);
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || 'Registration failed');
    }

    // Try logging in automatically with the registered credentials
    try {
      const loginRes = await authApi.login(userData.email, userData.password);
      return loginRes;
    } catch {
      return { user: data.data, token: null };
    }
  },

  loginWithGoogle: async (googleData) => {
    const response = await apiClient.post('/auth/google', {
      email: googleData.email,
      name: googleData.name,
      phone: googleData.phone,
      role: googleData.role || 'FARMER',
      picture: googleData.picture,
      profile: googleData.profile
    });
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || 'Google Sign-In failed');
    }
    if (data.token) {
      localStorage.setItem('agri_auth_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('agri_user', JSON.stringify(data.user));
    }
    return { user: data.user || data.data, token: data.token };
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const data = response.data;
      if (data.error) return null;
      return data.data || data.user || null;
    } catch (e) {
      return null;
    }
  },

  updateProfile: async (userId, profileData, role = 'FARMER') => {
    let endpoint = `/users/${userId}`;
    if (role === 'FARMER') {
      endpoint = `/farmer-profiles/${userId}`;
    } else if (role === 'BUYER') {
      endpoint = `/buyer-profiles/${userId}`;
    }
    const response = await apiClient.put(endpoint, profileData);
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data.data || data.user || data;
  }
};
