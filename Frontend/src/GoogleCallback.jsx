
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../src/utils/api.js';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        navigate('/login?auth=error');
        return;
      }

      try {
        // 1. On envoie le code au serveur
        const response = await api.get(`/auth/google/callback?code=${code}`);
        
        // 2. On reçoit le colis (la réponse avec le token et l'utilisateur)
        const { token, user, redirectUrl } = response.data;

        if (token && user) {
          // 3. On met le ticket dans sa poche (localStorage)
          localStorage.setItem('token', token);
          
          // 4. On prévient tout le monde (comme la Navbar) qu'on est connecté
          window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { user } 
          }));
          
          // 5. On va au salon (on redirige vers le bon dashboard)
          if (redirectUrl) {
            // Create the redirect URL with token
            const url = new URL(redirectUrl);
            url.searchParams.append('token', token);
            window.location.href = url.toString();
          } else {
            // Fallback to home if no redirect URL
            navigate('/');
          }
        } else {
          navigate('/login?auth=error');
        }
      } catch (error) {
        console.error('Erreur:', error);
        navigate('/login?auth=error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Authentification en cours, veuillez patienter...</h2>
    </div>
  );
};

export default GoogleCallback;