import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('agri_auth_token') || null);
  const [loading, setLoading] = useState(false);

  // Initialize and verify authentication on app start / page refresh
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('agri_auth_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem('agri_user', JSON.stringify(currentUser));
          }
        } catch (err) {
          // Only clear session if token is explicitly rejected (401 Unauthorized)
          if (err?.response?.status === 401) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('agri_user');
            localStorage.removeItem('agri_auth_token');
          }
        }
      } else {
        // No stored auth token -> ensure unauthenticated state
        setUser(null);
        setToken(null);
        localStorage.removeItem('agri_user');
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('agri_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('agri_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setUser(res.user);
      setToken(res.token);
      toast.success(`Welcome back, ${res.user.name || 'User'}!`);
      return res.user;
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleUserData) => {
    setLoading(true);
    try {
      const res = await authApi.loginWithGoogle(googleUserData);
      setUser(res.user);
      setToken(res.token);
      toast.success(`Signed in as ${res.user.name || 'User'}!`);
      return { user: res.user, isNewUser: res.isNewUser };
    } catch (err) {
      toast.error(err.message || 'Google Sign-In failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await authApi.signup(formData);
      setUser(res.user);
      setToken(res.token);
      toast.success(`Account created! Welcome, ${res.user.name || 'User'}`);
      return res.user;
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please check inputs.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.updateProfile(user.user_id, profileData);
      if (updatedUser) {
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to update profile');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_auth_token');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || 'GUEST',
        login,
        loginWithGoogle,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
