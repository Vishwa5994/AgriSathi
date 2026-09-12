import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL configured via environment variable VITE_API_URL or defaulting to Render Express Backend
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://agrisathi-3eew.onrender.com';
const BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

let coldStartToastId = null;

// Interceptor to attach Authorization Bearer token from localStorage & track request start
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config._timer = setTimeout(() => {
      if (!coldStartToastId) {
        coldStartToastId = toast.loading('Server waking up (Render free tier), this may take up to a minute...', {
          duration: 10000,
        });
      }
    }, 3500);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration, cold-start toast clear, and unauthorized errors
apiClient.interceptors.response.use(
  (response) => {
    if (response.config._timer) clearTimeout(response.config._timer);
    if (coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }
    return response;
  },
  (error) => {
    if (error.config?._timer) clearTimeout(error.config._timer);
    if (coldStartToastId) {
      toast.dismiss(coldStartToastId);
      coldStartToastId = null;
    }
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Clearing stored auth token.');
      localStorage.removeItem('agri_auth_token');
      localStorage.removeItem('agri_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
