import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://dummyjson.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach authentication token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error handling and 401 redirection
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If request was canceled by AbortController, propagate clean cancellation
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      // 401 Unauthorized handling: Token expired or invalid
      if (error.response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = `/login?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
