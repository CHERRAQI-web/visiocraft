// src/utils/api.js

import axios from "axios";

// Create a custom Axios instance
const api = axios.create({
  baseURL: 'https://backend-visiocraft-production.up.railway.app/api',
  // withCredentials: true, // On le laisse commenté car on utilise le JWT dans le localStorage
});

// Add an interceptor to add the JWT token to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Récupère le token depuis le localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Ajoute le token dans le header d'autorisation
    }
    
    // If the request contains FormData, don't set the Content-Type
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
      console.error('Authentication error (401): Token might be expired or invalid.');
      // Ila token expiré, on peut déconnecter l'utilisateur et le rediriger
      localStorage.removeItem('token');
      window.location.href = '/login?auth=expired';
    } else if (error.response?.status === 500) {
      console.error('Server error (500):', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default api;