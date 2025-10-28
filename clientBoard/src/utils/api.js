import axios from "axios";

const api = axios.create({
  baseURL: 'https://backend-visiocraft-production.up.railway.app/api',
  withCredentials: true, // --- CRUCIAL : Demande au navigateur d'envoyer les cookies ---
});

// --- IMPORTANT : Tu peux SUPPRIMER l'intercepteur qui ajoutait le header Authorization ---
// Le navigateur s'en occupe maintenant automatiquement avec le cookie.
api.interceptors.request.use(
  (config) => {
    // On garde la logique pour FormData
    if (config.data instanceof FormData) {
      config.headers = { ...config.headers };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// L'intercepteur de réponse pour gérer les 401 est toujours bon à garder.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error (401): Token might be expired or invalid.');
      // En cas d'erreur, on redirige vers la page de login principale
      window.location.href = 'https://frontend-visiocraft.vercel.app/login?auth=expired';
    }
    return Promise.reject(error);
  }
);

export default api;