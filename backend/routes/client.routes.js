import {getClientProfile,getAllClients,deleteClient} from '../controllers/client.controllers.js'
import express from 'express';
const router=express.Router();


router.get('/:id',getClientProfile);
router.get('/',getAllClients);
router.delete('/:id', deleteClient);

export default router;