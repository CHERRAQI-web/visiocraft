import express from 'express';
import {
  uploadProjectFile,
  getFilesForProject,
  deleteProjectFile,
  uploadProjectFolder,
  markFile,
  toggleFileVisibility
} from '../controllers/project_files.controllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply token verification to all routes
router.use(verifyToken);

// Route to upload a single file for a specific project
router.post('/projects/:projectId/files', upload.single('file'), uploadProjectFile);

// Route to upload a folder (multiple files) for a specific project
router.post('/projects/:projectId/folder', upload.array('files'), uploadProjectFolder);

// Route to get all files and folders associated with a specific project
router.get('/projects/:projectId/files', getFilesForProject);

// Route to mark a file
router.put('/files/:fileId/mark', markFile);

// Route to change the visibility status of a file
router.put('/files/:fileId/visibility', toggleFileVisibility);

// Route to delete a specific file or folder
router.delete('/files/:fileId', deleteProjectFile);

export default router;