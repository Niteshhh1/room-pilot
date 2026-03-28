import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to append the JWT token
api.interceptors.request.use(
  (config) => {
    // We will store admin data in localStorage via Zustand
    const authState = JSON.parse(localStorage.getItem('auth-storage'));
    
    if (authState && authState.state && authState.state.token) {
      config.headers.Authorization = `Bearer ${authState.state.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
