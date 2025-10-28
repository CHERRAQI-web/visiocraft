import api from "./api.js";

export const isAuthenticated = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    const response = await api.get(`/auth/me?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur dans isAuthenticated:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Erreur lors du logout :", error);
  } finally {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userLoggedOut"));
    window.location.href = "https://frontend-visiocraft.vercel.app/login";
  }
};

// Add this missing function
export const redirectToAppWithToken = (url, token) => {
  if (!token) {
    console.error("No token provided for redirection");
    return;
  }
  
  // Create a URL with the token as a query parameter
  const redirectUrl = new URL(url);
  redirectUrl.searchParams.append('token', token);
  
  // Redirect to the URL with the token
  window.location.href = redirectUrl.toString();
};