import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto add token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle all errors in here
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 - Redirect to login
    if (error.response?.status === 401) {
      Cookies.remove('token');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    
    // All other errors are passed through, deal with them in the hooks/components
    return Promise.reject(error);
  }
);

export default api;