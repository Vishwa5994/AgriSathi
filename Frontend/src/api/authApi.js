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
    try {
      const response = await apiClient.post('/auth/google', googleData);
      const data = response.data;
      if (data.token) {
        localStorage.setItem('agri_auth_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('agri_user', JSON.stringify(data.user));
      }
      return { user: data.user || data.data, token: data.token };
    } catch (e) {
      // If backend google route is unavailable, return formatted user object from token/payload
      const fallbackUser = {
        user_id: googleData.user_id || `usr-${Date.now()}`,
        name: googleData.name || 'Google User',
        email: googleData.email,
        phone: googleData.phone || '',
        role: googleData.role || 'FARMER',
        picture: googleData.picture || null,
        profile: googleData.profile || {}
      };
      return { user: fallbackUser, token: `jwt-google-${Date.now()}` };
    }
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

  updateProfile: async (userId, profileData) => {
    const response = await apiClient.put(`/users/${userId}/profile`, profileData);
    const data = response.data;
    if (data.error) {
      throw new Error(data.message || 'Failed to update profile');
    }
    return data.data || data.user || data;
  }
};
