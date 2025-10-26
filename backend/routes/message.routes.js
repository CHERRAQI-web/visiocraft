import { getMessagesForProject, sendMessage } from "../controllers/message.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import express from 'express';

const router = express.Router();

router.use(verifyToken);

router.get('/projects/:projectId/messages', getMessagesForProject);
router.post('/projects/:projectId/messages', sendMessage);

export default router;