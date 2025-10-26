import { getAllFreelancers,deleteFreelancer,getFreelancerById } from "../controllers/freelancer.controllers.js";
import express from 'express';



const router = express.Router();

router.get('/',getAllFreelancers);

router.delete('/:id',deleteFreelancer);

router.get('/:id',getFreelancerById);

export default router