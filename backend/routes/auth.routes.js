import express from 'express';
import {
  login,
  getMyProfile,
  registerClient,
  registerFreelancer,
  registerAdmin,logout,handleGoogleCallback,getGoogleAuthUrl,checkGoogleAuthStatus
} from '../controllers/auth.controllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/login', login);
router.post('/logout', logout);    


router.post('/register-client', registerClient);


router.post('/register-freelancer', registerFreelancer);


router.post('/register-admin', registerAdmin);


router.get('/me', verifyToken, getMyProfile);

router.get('/google/callback', handleGoogleCallback);
router.get('/google/auth-url', getGoogleAuthUrl);
router.get('/me/google-status', verifyToken, checkGoogleAuthStatus); 

export default router;