import User from '../models/user.models.js';
import Client from '../models/client.models.js';
import Freelancer from '../models/freelancer.models.js';
import Admin from '../models/admin.models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import generateToken from '../utils/generateToken.js';
import { getAccessToken, setCredentials, getUserInfo } from '../services/googleDriveService.js';
import { google } from 'googleapis';
import { handleGoogleCallbackAndFetchUser } from '../services/googleDriveService.js';

// Login Handler
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid login details' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid login details' });
    }

    // Generate token using generateToken function
    const token = generateToken(user);
    
    console.log("Generated token for user", user.email, ":", token);

    res.cookie("token", token, {
      httpOnly: true,
secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
    });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Profile
export const getMyProfile = async (req, res) => {
  try {
    // req.user now holds the full user object from the database, thanks to the corrected middleware
    const userId = req.user._id; 
    const userRole = req.user.role;

    console.log(`Retrieving profile for user ID: ${userId}, Role: ${userRole}`);

    let profile;

    // Logic to fetch specific profile (Client, Freelancer, etc.)
    if (userRole === 'Freelancer') {
      profile = await Freelancer.findOne({ user_id: userId }).populate('user_id', 'first_name last_name email role');
    } else if (userRole === 'Client') {
      profile = await Client.findOne({ user_id: userId }).populate('user_id', 'first_name last_name email role');
    } else if (userRole === 'Admin') {
      profile = await Admin.findOne({ user_id: userId }).populate('user_id', 'first_name last_name email role');
    }
    
    // If no specific profile is found, return the basic user info
    if (!profile) {
        profile = req.user; // Return the basic user info if detailed profile does not exist
    }

    res.status(200).json(profile);

  } catch (error) {
    console.error("Error in getMyProfile:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout Handler
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, 
      sameSite: 'None', 
      path: "/", 
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle Google OAuth Callback
// controllers/auth.controllers.js

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html><body><h1>Error: Authorization code missing.</h1></body></html>
    `);
  }

  try {
    const { tokens, userInfo } = await handleGoogleCallbackAndFetchUser(code);
    
    if (!userInfo || !userInfo.email) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html><body><h1>Error: Unable to retrieve user information.</h1></body></html>
      `);
    }
    
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      // ... (ton code pour créer un nouvel utilisateur reste le même)
      user = new User({
        first_name: userInfo.given_name || '',
        last_name: userInfo.family_name || '',
        email: userInfo.email,
        password: 'google_oauth_' + Math.random().toString(36).substring(2, 15),
        role: 'Client', // Default role
        googleTokens: tokens
      });
      await user.save();
      
      const newClient = new Client({
        user_id: user._id,
        company_name: userInfo.name || '',
        industry: '',
        googleTokens: tokens
      });
      await newClient.save();
    } else {
      // ... (ton code pour mettre à jour l'utilisateur existant reste le même)
      user.googleTokens = tokens;
      await user.save();
      
      const client = await Client.findOne({ user_id: user._id });
      if (client) {
        client.googleTokens = tokens;
        await client.save();
      }
    }

    // Create JWT token with userId
    const jwtToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set the cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 1000,
      sameSite: 'Lax'
    });
    
    console.log("Authentication successful for user:", user.email, "with role:", user.role);
    
    // === HADI HIYA L-KHOTBA L-JDIDA DYAL REDIRECTION ===
    let redirectUrl = 'https://client-visiocraft.vercel.app/'; // URL par défaut

    // Vérifie le rôle de l'utilisateur et choisit la bonne URL
    switch (user.role) {
      case 'Freelancer':
        redirectUrl = 'https://freelancer-visiocraft.vercel.app/';
        break;
      case 'Admin':
        redirectUrl = 'https://admin-visiocraft.vercel.app/';
        break;
      case 'Client':
        // C'est déjà l'URL par défaut, mais on la laisse pour la clarté
        redirectUrl = 'https://client-visiocraft.vercel.app/';
        break;
      default:
        // Si le rôle est inconnu, on redirige vers la page client par sécurité
        console.warn(`Rôle inconnu '${user.role}' pour l'utilisateur ${user.email}. Redirection vers la page client par défaut.`);
        redirectUrl = 'https://client-visiocraft.vercel.app/';
        break;
    }

    // Ajoute le paramètre de succès à l'URL finale
    const finalRedirectUrl = `${redirectUrl}?auth=success`;

    console.log(`Redirection de l'utilisateur vers : ${finalRedirectUrl}`);
    
    // Effectue la redirection vers la bonne page
    res.redirect(finalRedirectUrl);
    
  } catch (error) {
    console.error("=== DETAILED ERROR DURING GOOGLE CALLBACK ===");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("===============================================");
    
    // En cas d'erreur, on redirige vers la page de login du client
    res.redirect('https://client-visiocraft.vercel.app/login?auth=error');
  }
};

// Get Google Authentication URL
export const getGoogleAuthUrl = async (req, res) => {
  try {
    const { getAuthUrl } = await import('../services/googleDriveService.js');
    const authUrl = getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authentication URL' });
  }
};

// Check Google Auth Status
export const checkGoogleAuthStatus = async (req, res) => {
  try {
    // req.user comes from the verifyToken middleware
    const userId = req.user.id;
    
    // First search in the User model
    let user = await User.findById(userId).select('+googleTokens');
    
    // Check if tokens exist in the User model
    let hasTokens = !!(user && user.googleTokens);
    
    // If tokens are not found in User, check in Client
    if (!hasTokens) {
      const client = await Client.findOne({ user_id: userId });
      hasTokens = !!(client && client.googleTokens);
    }
    
    res.status(200).json({ isConnected: hasTokens });
  } catch (error) {
    console.error('Error checking Google auth status:', error);
    res.status(500).json({ message: 'Error checking Google connection status' });
  }
};

export { registerClient } from './client.controllers.js';
export { registerFreelancer } from './freelancer.controllers.js';
export { registerAdmin } from './admin.controllers.js';
