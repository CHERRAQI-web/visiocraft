// utils/auth.jsx
import axios from "axios";

export const isAuthenticated = async () => {
  try {
    // On ajoute un paramètre unique (timestamp) à chaque appel pour contourner le cache du navigateur
    const response = await axios.get(`http://localhost:8080/api/auth/me?t=${Date.now()}`, {
      withCredentials: true,
    });
    
    // AJOUT POUR LE DÉBOGAGE : Vérifiez ce que vous recevez
    console.log("Réponse de /api/me :", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await axios.post("http://localhost:8080/api/auth/logout", {}, { 
      withCredentials: true,
      // Note : 'credentials: "include"' est redondant quand on utilise déjà 'withCredentials: true' avec axios
    });
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  } finally {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userLoggedOut"));
    localStorage.setItem("logout", Date.now());
    window.location.href = "http://localhost:5173/login";
  }
};