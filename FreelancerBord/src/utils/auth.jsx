import axios from "axios";

export const isAuthenticated = async () => {
  try {
    // Vérifiez d'abord si le token est dans l'URL (pour le cross-domain)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      // Nettoyez l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      return null;
    }
    
    // Ajoutez le token aux en-têtes
    const response = await axios.get(`https://backend-visiocraft-production.up.railway.app/api/auth/me?t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await axios.post("https://backend-visiocraft-production.up.railway.app/api/auth/logout", {}, { 
      withCredentials: true,
    });
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  } finally {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userLoggedOut"));
    localStorage.setItem("logout", Date.now());
    window.location.href = "https://frontend-visiocraft.vercel.app/login";
  }
};

// Fonction pour rediriger avec le token
export const redirectToAppWithToken = (appUrl, token) => {
  if (!token) {
    console.error("Aucun token trouvé pour la redirection.");
    return;
  }
  // On ajoute le token comme paramètre d'URL
  const url = new URL(appUrl);
  url.searchParams.set('token', token);
  window.location.href = url.toString();
};

// Fonction pour gérer le token reçu depuis l'URL
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