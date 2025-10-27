import axios from "axios";

// Create a custom Axios instance with authentication settings
const api = axios.create({
  baseURL: 'https://backend-visiocraft-production.up.railway.app/api',
  withCredentials: true,
});

// Add an interceptor to correctly set the Content-Type for FormData
api.interceptors.request.use(
  (config) => {
    // If the request contains FormData, don't set the Content-Type
    // Let the browser automatically set it with the correct boundary
    if (config.data instanceof FormData) {
      config.headers = {
        ...config.headers,
        // Don't set Content-Type for FormData
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 and 500 errors automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response.data);
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;
