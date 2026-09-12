import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { MOCK_USERS } from '../utils/mockData';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agri_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('agri_auth_token') || null);
  const [loading, setLoading] = useState(false);

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
      localStorage.setItem('agri_auth_token', res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      return res.user;
    } catch (err) {
      toast.error('Login failed. Please check credentials.');
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
      localStorage.setItem('agri_auth_token', res.token);
      toast.success(`Signed in with Google as ${res.user.name}!`);
      return res.user;
    } catch (err) {
      toast.error('Google Sign-In failed. Please try again.');
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
      localStorage.setItem('agri_auth_token', res.token);
      toast.success(`Account created! Welcome, ${res.user.name}`);
      return res.user;
    } catch (err) {
      toast.error('Signup failed. Please try again.');
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
      toast.error('Failed to update profile');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agri_user');
    localStorage.removeItem('agri_auth_token');
    toast.success('Logged out successfully');
  };

  // Quick Demo Role Switcher
  const switchDemoRole = (role) => {
    let targetUser = null;

    if (role === 'FARMER') {
      targetUser = MOCK_USERS.find((u) => u.role === 'FARMER' && u.name.includes('Ramesh')) || MOCK_USERS.find((u) => u.role === 'FARMER');
      toast.success('Switched to Farmer Demo Mode (Ramesh Patel)');
    } else if (role === 'BUYER') {
      targetUser = MOCK_USERS.find((u) => u.role === 'BUYER' && u.name.includes('Vikram')) || MOCK_USERS.find((u) => u.role === 'BUYER');
      toast.success('Switched to Buyer Demo Mode (FreshMandi Wholesale)');
    } else if (role === 'ADMIN') {
      targetUser = MOCK_USERS.find((u) => u.role === 'ADMIN') || {
        user_id: 'usr-admin-1',
        name: 'Market Director APMC',
        email: 'admin@agrisathi.in',
        phone: '+91 99999 00000',
        role: 'ADMIN',
        isProfileCompleted: true,
        profile: { department: 'Price Stabilization Cell' }
      };
      toast.success('Switched to Admin Demo Mode');
    }

    if (targetUser) {
      const mockToken = `mock-token-${targetUser.user_id}`;
      setUser(targetUser);
      setToken(mockToken);
      localStorage.setItem('agri_user', JSON.stringify(targetUser));
      localStorage.setItem('agri_auth_token', mockToken);

      // Persist to agri_users list for consistency
      try {
        const usersRaw = localStorage.getItem('agri_users');
        const storedUsers = usersRaw ? JSON.parse(usersRaw) : MOCK_USERS;
        const idx = storedUsers.findIndex((u) => u.email?.toLowerCase() === targetUser.email?.toLowerCase());
        if (idx >= 0) {
          storedUsers[idx] = { ...storedUsers[idx], ...targetUser };
        } else {
          storedUsers.push(targetUser);
        }
        localStorage.setItem('agri_users', JSON.stringify(storedUsers));
      } catch {
        // fallback ignored
      }
    }

    return targetUser;
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
        updateProfile,
        switchDemoRole
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
