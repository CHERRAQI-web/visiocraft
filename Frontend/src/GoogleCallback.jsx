// src/GoogleCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../src/utils/api.js'; 

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      navigate('/login?auth=error');
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        // Le frontend envoie le code au backend
        const response = await api.get(`/auth/google/callback?code=${code}`);
        const { token, user } = response.data;

        // Le frontend reçoit le JWT et le stocke
        localStorage.setItem('token', token);
        console.log(response.data)
        // Redirection finale
        window.location.href = 'https://client-visiocraft.vercel.app/';

      } catch (error) {
        console.error('Error exchanging code for token:', error);
        navigate('/login?auth=error');
      }
    };

    exchangeCodeForToken();
  }, [searchParams, navigate]);

  return <h2>Authentication in progress...</h2>;
};

export default GoogleCallback;