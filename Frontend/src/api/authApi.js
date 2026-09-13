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
      phone: userData.phone || '',
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
      access_token: googleData.access_token,
      id_token: googleData.id_token,
      credential: googleData.credential,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture
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
    return { user: data.user || data.data, token: data.token, isNewUser: data.isNewUser };
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

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || 'Failed to update user');
    }
    if (data.token) {
      localStorage.setItem('agri_auth_token', data.token);
    }
    const updated = data.user || data.data;
    if (updated) {
      localStorage.setItem('agri_user', JSON.stringify(updated));
    }
    return updated;
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

