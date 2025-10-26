import express from 'express';
import { getAllSkills } from '../controllers/skill.controllers.js';

const router = express.Router();

// Route pour obtenir toutes les compétences
router.get('/', getAllSkills);

export default router;