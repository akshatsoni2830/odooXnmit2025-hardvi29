import axios from 'axios';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Wait for auth to be ready and get current user's token
const getAuthToken = async () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken();
          console.log('Got auth token for user:', user.uid);
          resolve(token);
        } catch (error) {
          console.error('Error getting token:', error);
          resolve(null);
        }
      } else {
        console.log('No authenticated user found');
        resolve(null);
      }
    });
  });
};

// Request interceptor to attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Attached auth token to request:', config.url);
      } else {
        console.log('No auth token available for request:', config.url);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('401 error, attempting token refresh and retry');

      try {
        // Force token refresh and retry
        if (auth.currentUser) {
          const newToken = await auth.currentUser.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log('Retrying request with refreshed token');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(error);
      }
    }

    // Log detailed error information
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('API No Response:', error.message);
    } else {
      console.error('API Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;