import axios from "axios";

const api = axios.create({
  baseURL: 'https://backend-visiocraft-production.up.railway.app/api',
  withCredentials: true, // Important pour envoyer les cookies
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login?auth=expired';
    }
    return Promise.reject(error);
  }
);

export default api;