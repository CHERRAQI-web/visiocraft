import api from "./api.js";

export const isAuthenticated = async () => {
  try {
    // --- PLUS BESOIN DE RÉCUPÉRER LE TOKEN MANUELLEMENT ---
    // Le navigateur envoie automatiquement le cookie avec la requête.
    const response = await api.get(`/auth/me?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    // Le backend va s'occuper de supprimer le cookie.
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  } finally {
    // Nettoyage côté client et redirection.
    window.location.href = 'https://frontend-visiocraft.vercel.app/login';
  }
};

