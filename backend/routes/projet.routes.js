import { getMyProjects, completeProjectByFreelancer,acceptProject, createProjectRequest, assignProject, getAllProjects, deleteProject, updateProject, getProjectById, addFilesToProject } from "../controllers/project.controllers.js";
import { verifyToken, authorize } from "../middleware/auth.middleware.js";
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to get all projects (Admin only)
router.get('/all', getAllProjects);

// Apply token verification to all subsequent routes
router.use(verifyToken);

// Route to create a new project (Clients only)
router.post('/', authorize('Client'), createProjectRequest);

// Route to get the current user's projects
router.get('/', getMyProjects);

// Route to get details of a single project
router.get('/:id', getProjectById);

// Route to update a project
router.put('/:id', updateProject);

// Route to add files to a project
router.post('/:id/files', upload.array('files'), addFilesToProject);

// Route to assign a project to a freelancer (Admin only)
router.put('/:id/assign', authorize('Admin'), assignProject);

// Route to delete a project
router.delete('/:id', deleteProject);

// Route for a freelancer to accept a project
router.put('/:id/accept', authorize('Freelancer'), acceptProject);
router.put('/:id/complete', completeProjectByFreelancer);

export default router;