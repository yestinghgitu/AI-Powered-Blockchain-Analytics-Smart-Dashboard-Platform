import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Optimized API Client for Nexus OS
 * Automatically attaches JWT from localStorage and handles authentication failures.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // AI pipeline (CSV → MongoDB → FastAPI → response) can take >15s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the bearer token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and potentially redirect or trigger a re-auth UI
      console.warn('[API Client] Unauthorized access - redirecting to login');
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: auto-logout
    }
    return Promise.reject(error);
  }
);

export default apiClient;
