// src/utils/auth.jsx

// --- CHANGEMENT 1 : On importe notre instance 'api' configurée ---
import api from "./api.js";

// --- Fonction pour vérifier si l'utilisateur est authentifié ---
export const isAuthenticated = async () => {
  try {
    // On récupère le token depuis le localStorage
    const token = localStorage.getItem("token");
    
    // S'il n'y a pas de token, l'utilisateur n'est pas connecté
    if (!token) {
      return null;
    }
    
    // --- CHANGEMENT 2 : On utilise 'api' qui ajoute automatiquement le token ---
    // L'ancien code avec `axios` et `withCredentials: true` causait des erreurs.
    // `api.get` envoie la requête avec le header `Authorization: Bearer <token>`
    const response = await api.get(`/auth/me?t=${Date.now()}`);
    
    return response.data;
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    // En cas d'erreur (ex: token invalide), on retourne null
    return null;
  }
};

// --- Fonction pour se déconnecter ---
export const logout = async () => {
  try {
    // --- CHANGEMENT 3 : On utilise 'api' pour l'appel de logout ---
    // Le backend saura quel utilisateur déconnecter grâce au token JWT
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  } finally {
    // Dans tous les cas, on nettoie le côté client
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userLoggedOut"));
    localStorage.setItem("logout", Date.now());
    // On redirige vers la page de login principale
    window.location.href = "https://frontend-visiocraft.vercel.app/login";
  }
};

// --- Fonctions pour la redirection entre tes différentes applications (Client, Admin, Freelancer) ---
// Ces fonctions sont correctes et n'ont pas besoin d'être changées.

// Fonction pour rediriger avec le token (utile pour passer d'une app à l'autre)
export const redirectToAppWithToken = (appUrl, token) => {
  if (!token) {
    console.error("Aucun token trouvé pour la redirection.");
    return;
  }
  // On ajoute le token comme paramètre d'URL pour que l'autre application puisse le récupérer
  const url = new URL(appUrl);
  url.searchParams.set('token', token);
  window.location.href = url.toString();
};

// Fonction pour gérer le token reçu depuis l'URL (à appeler au démarrage de l'app cible)
export const handleTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl) {
    console.log("Token reçu depuis l'URL, sauvegarde en cours...");
    // 1. Sauvegarder le token dans le localStorage de cette application
    localStorage.setItem("token", tokenFromUrl);
    
    // 2. Nettoyer l'URL pour enlever le token (très important pour la sécurité)
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // 3. Recharger la page pour s'assurer que tout est bien initialisé avec le nouveau token
    window.location.reload(); 
    
    return true; // Indique qu'un token a été traité
  }
  
  return false; // Aucun token dans l'URL
};