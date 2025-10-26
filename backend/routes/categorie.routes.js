import { getCategorieById, addCategorie, deleteCategorie, updateCategorie, getAllCategorie } from "../controllers/categorie.controllers.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import express from 'express';

const router = express.Router();

router.get('/', getAllCategorie);
router.get('/:id', getCategorieById);

router.post('/', addCategorie);
router.put('/:id', verifyToken, authorize('Admin'), updateCategorie);
router.delete('/:id', verifyToken, authorize('Admin'), deleteCategorie);

export default router;