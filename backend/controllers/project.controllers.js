import Project from '../models/project.models.js';
import Freelancer from '../models/freelancer.models.js';
import Skill from '../models/Skill.models.js';

import AiLog from '../models/aiLog.models.js'; 
import mongoose from 'mongoose';
import ProjetFile from '../models/project_files.models.js';
import User from '../models/user.models.js';
import axios from 'axios';
const AXIOS_CONFIG = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};
import { 
  uploadFileToDrive, 
  deleteFileFromDrive, 
  setCredentials,
  createFolderInDrive,
  uploadMultipleFilesToDrive
} from '../services/googleDriveService.js';
import Client from '../models/client.models.js'

export const createProjectRequest = async (req, res) => {
    try {
        const { title, project_details, category_id, deadline_date, client_initial_budget } = req.body;

        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // --- START OF CORRECTION ---
        // 1. Find the Client document associated with this user
        const clientDoc = await Client.findOne({ user_id: req.user.id });
        if (!clientDoc) {
            return res.status(404).json({ message: "Client profile not found. Please complete your client profile before creating a project." });
        }

        // 2. Use the Client document ID (not the user ID)
        const client_id = clientDoc._id;
        // --- END OF CORRECTION ---

        // 1. Call Python service for skill extraction
        console.log("Calling Python AI service for skill extraction...");
        const aiServiceResponse = await fetch('https://aivisiocraft.up.railway.app/extract-skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_details: project_details }),
        });

        if (!aiServiceResponse.ok) {
            throw new Error(`AI service responded with status: ${aiServiceResponse.status}`);
        }

        const aiData = await aiServiceResponse.json();
        const extractedSkillNames = aiData.skills;
        console.log("Skills extracted by AI:", extractedSkillNames);

        // 2. Find or create skills in the database
        const skillPromises = extractedSkillNames.map(skillName =>
            Skill.findOneAndUpdate(
                { name: skillName },
                { name: skillName, category: 'Auto-detected' },
                { upsert: true, new: true }
            ).exec()
        );

        const skillDocuments = await Promise.all(skillPromises);
        const extractedSkillIds = skillDocuments.map(skill => skill._id);

        // 3. Create project with skill IDs
        const newProject = new Project({
            client_id,  // Now it's the CORRECT client ID
            title,      // Add title
            category_id,
            project_details,
            deadline_date,
            client_initial_budget,
            extracted_skills: extractedSkillIds,
            analysis_status: 'completed'
        });

        const savedProject = await newProject.save();

        // ... the rest of your function remains identical
        await AiLog.create({
            project_id: savedProject._id,
            action_type: 'skill_extraction',
            input_data: { project_details },
            output_data: { extractedSkillNames, extractedSkillIds },
            confidence_score: 0.9
        });

        console.log("Starting AI freelancer matching...");
        await findBestFreelancersForProject(savedProject._id);

        const projectWithSuggestions = await Project.findById(savedProject._id);

        res.status(201).json(projectWithSuggestions);

    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Error creating project.", error: error.message });
    }
};

// @desc    Admin assigns a project to a freelancer
export const assignProject = async (req, res) => {
    const { id } = req.params; // Project ID
    const { freelancer_id } = req.body; // ID of the freelancer to assign
    const admin_id = req.user.id; // Logged in admin

    try {
        const project = await Project.findByIdAndUpdate(
            id,
            {
                freelancer_id,
                assigned_by_admin_id: admin_id,
                status: 'assigned'
            },
            { new: true }
        ).populate('freelancer_id', 'name_or_company');

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// @desc    Get projects for the logged in user
export const getMyProjects = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get pagination and filtering parameters from the request
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const search = req.query.search || null;

    try {
        let projects;
        let totalProjects = 0;
        let stats = {}; // To hold the status counts

        // --- Helper function to get project stats using aggregation ---
        const getProjectStats = async (matchFilter = {}) => {
            const pipeline = [
                { $match: matchFilter },
                {
                    $group: {
                        _id: null, // Group all documents together
                        total: { $sum: 1 },
                        pending: {
                            $sum: { $cond: [{ $eq: ["$status", "pending_assignment"] }, 1, 0] }
                        },
                        assigned: {
                            $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] }
                        },
                        inProgress: {
                            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] }
                        },
                        review: {
                            $sum: { $cond: [{ $eq: ["$status", "in_review"] }, 1, 0] }
                        },
                        completed: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                        },
                        cancelled: {
                            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                        }
                    }
                }
            ];
            
            const result = await Project.aggregate(pipeline);
            // If no projects match, return default zero stats
            return result.length > 0 ? result[0] : {
                total: 0, pending: 0, assigned: 0, inProgress: 0, review: 0, completed: 0, cancelled: 0
            };
        };

        // Build the base filter object
        let baseFilter = {};
        if (status) {
            baseFilter.status = status;
        }
        
        let searchFilter = {};
        if (search) {
            searchFilter = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { project_details: { $regex: search, $options: "i" } }
                ]
            };
        }

        if (userRole === 'Client') {
            const clientDoc = await Client.findOne({ user_id: userId });
            if (!clientDoc) {
                return res.status(404).json({ message: "Client profile not found for this user." });
            }

            const clientFilter = { client_id: clientDoc._id };
            
            // 1. Get stats for this client
            stats = await getProjectStats(clientFilter);

            // 2. Get paginated and filtered projects
            const finalFilter = { ...clientFilter, ...baseFilter, ...searchFilter };
            totalProjects = await Project.countDocuments(finalFilter);
            
            projects = await Project.find(finalFilter)
                .populate({
                    path: 'client_id',
                    populate: {
                        path: 'user_id',
                        model: 'User', // Fixed: Use 'User' instead of 'user'
                        select: 'first_name last_name email company_name'
                    }
                })
                .populate('freelancer_id', 'name_or_company')
                .populate('extracted_skills')
                .populate('category_id')
                .populate({
                    path: 'ai_suggested_freelancers.freelancer_id',
                    select: 'name_or_company skills rating portfolio_url bio',
                    populate: {
                        path: 'user_id',
                        model: 'User', // Fixed: Use 'User' instead of 'user'
                        select: 'first_name last_name email'
                    }
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

        } else if (userRole === 'Freelancer') {
            const freelancerDoc = await Freelancer.findOne({ user_id: userId });
            if (!freelancerDoc) {
                return res.status(404).json({ message: "Freelancer profile not found for this user." });
            }

            const freelancerFilter = { freelancer_id: freelancerDoc._id };

            // 1. Get stats for this freelancer
            stats = await getProjectStats(freelancerFilter);

            // 2. Get paginated and filtered projects
            const finalFilter = { ...freelancerFilter, ...baseFilter, ...searchFilter };
            totalProjects = await Project.countDocuments(finalFilter);
            
            projects = await Project.find(finalFilter)
                .populate({
                    path: 'client_id',
                    populate: {
                        path: 'user_id',
                        model: 'User', // Fixed: Use 'User' instead of 'user'
                        select: 'first_name last_name email company_name'
                    }
                })
                .populate('freelancer_id', 'name_or_company')
                .populate('extracted_skills')
                .populate('category_id')
                .populate({
                    path: 'ai_suggested_freelancers.freelancer_id',
                    select: 'name_or_company skills rating portfolio_url bio',
                    populate: {
                        path: 'user_id',
                        model: 'User', // Fixed: Use 'User' instead of 'user'
                        select: 'first_name last_name email'
                    }
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

        } else if (userRole === 'Admin') {
            // 1. Get stats for all projects (no filter needed for admin)
            stats = await getProjectStats({});

            // 2. Get paginated and filtered projects
            const adminFilter = { ...baseFilter, ...searchFilter };
            totalProjects = await Project.countDocuments(adminFilter);
            
            // 3. Get paginated and filtered projects
            projects = await Project.find(adminFilter)
                .populate({
                    path: 'client_id',
                    populate: {
                        path: 'user_id',
                        model: 'User', // Fixed: Use 'User' instead of 'user'
                        select: 'first_name last_name email company_name'
                    }
                })
                .populate('freelancer_id', 'name_or_company')
                .populate('extracted_skills')
                .populate('category_id')
                .populate({
                    path: 'ai_suggested_freelancers.freelancer_id',
                    select: 'name_or_company skills rating portfolio_url bio',
                    populate: {
                        path: 'user_id',
                        model: 'User', // Fixed: Use 'User' instead of 'user'
                        select: 'first_name last_name email'
                    }
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
        }

        // Return results with pagination info AND stats
        res.status(200).json({
            projects,
            stats, // Add the stats object here
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProjects / limit),
                totalItems: totalProjects,
                limit
            }
        });

    } catch (error) {
        console.error("Error in getMyProjects:", error);
        res.status(500).json({ error: error.message });
    }
};


// @desc    AI matching to find the best freelancers for a project
export const findBestFreelancersForProject = async (projectId) => {
    try {
        // 1. Get project with extracted skills
        const project = await Project.findById(projectId).populate('extracted_skills');
        if (!project || !project.extracted_skills || project.extracted_skills.length === 0) {
            console.log("No project found or no skills extracted for project:", projectId);
            return [];
        }

        const requiredSkillIds = project.extracted_skills.map(skill => skill._id.toString());

        // 2. Get all available freelancers
        const availableFreelancers = await Freelancer.find({ 
            availability_status: 'available' 
        }).populate('skills');

        // 3. Calculate score for each freelancer
        const freelancerScores = availableFreelancers.map(freelancer => {
            const freelancerSkillIds = freelancer.skills.map(skill => skill._id.toString());

            // Calculate skill match
            const matchingSkills = freelancerSkillIds.filter(skillId => requiredSkillIds.includes(skillId));
            const skillMatchScore = requiredSkillIds.length > 0 ? (matchingSkills.length / requiredSkillIds.length) : 0;

            // Final score (give more weight to skill match)
            const finalScore = (skillMatchScore * 0.8) + (freelancer.ai_score / 100 * 0.2);

            // Generate a reason for the score
            let reason = `Score: ${finalScore.toFixed(2)}. `;
            if (skillMatchScore > 0.75) {
                reason += `Excellent match on required skills (${matchingSkills.length}/${requiredSkillIds.length}).`;
            } else if (skillMatchScore > 0.4) {
                reason += `Good match on required skills (${matchingSkills.length}/${requiredSkillIds.length}).`;
            } else {
                reason += `Partial match on required skills (${matchingSkills.length}/${requiredSkillIds.length}).`;
            }

            return {
                freelancer_id: freelancer._id,
                score: finalScore,
                reason: reason
            };
        });

        // 4. Sort by descending score and take the top 5
        const topFreelancers = freelancerScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // 5. Update project with suggestions
        await Project.findByIdAndUpdate(projectId, {
            ai_suggested_freelancers: topFreelancers
        });

        console.log(`AI matching completed for project ${projectId}. Found ${topFreelancers.length} suggestions.`);
        return topFreelancers;

    } catch (error) {
        console.error("Error during AI freelancer matching:", error);
        return [];
    }
}


export const getAllProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const searchTerm = req.query.search || '';
        // --- STEP 1: Get the 'status' parameter from the request ---
        const status = req.query.status || null; // Will be 'pending_assignment' or null
        const skip = (page - 1) * limit;

        // --- STEP 2: Build the filter dynamically ---
        // We create an array of conditions to combine search AND status
        const matchConditions = [];

        if (searchTerm) {
            matchConditions.push({
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },  // Add title to search
                    { project_details: { $regex: searchTerm, $options: 'i' } },
                    { status: { $regex: searchTerm, $options: 'i' } }
                ]
            });
        }

        // If a status is provided, add it to the filter conditions
        if (status) {
            matchConditions.push({ status: status });
        }

        // Create the final $match stage. If there are conditions, combine them with $and.
        // Otherwise, match everything ($match: {}).
        const matchStage = matchConditions.length > 0 ? { $match: { $and: matchConditions } } : { $match: {} };

        // Build the aggregation pipeline
        const pipeline = [
            // 1. Use our dynamic filter as the first step
            matchStage,
            
            // 2. The rest of your pipeline remains identical...
            { $lookup: { from: 'clients', localField: 'client_id', foreignField: '_id', as: 'client_info' } },
            { $lookup: { from: 'users', localField: 'client_info.user_id', foreignField: '_id', as: 'user_info' } },
            { $lookup: { from: 'freelancers', localField: 'freelancer_id', foreignField: '_id', as: 'freelancer_info' } },
            { $lookup: { from: 'skills', localField: 'extracted_skills', foreignField: '_id', as: 'skills_info' } },
            { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category_info' } },

            { $unwind: { path: '$client_info', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$freelancer_info', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$category_info', preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    title: 1,  // Add title to projected fields
                    project_details: 1, status: 1, analysis_status: 1, deadline_date: 1,
                    complexity_level: 1, client_initial_budget: 1, budget_status: 1,
                    ai_suggested_freelancers: 1, createdAt: 1, updatedAt: 1,
                    client_id: {
                        $mergeObjects: [
                            { $ifNull: ['$client_info', {}] },
                            { $ifNull: ['$user_info', {}] }
                        ]
                    },
                    freelancer_id: '$freelancer_info',
                    extracted_skills: '$skills_info',
                    category_id: '$category_info'
                }
            },
            
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ];

        // Execute the aggregation to get the data
        const projects = await Project.aggregate(pipeline);

        // --- STEP 3: Fix the counting for pagination ---
        // We need to count documents that match the filters, not ALL documents
        const countPipeline = [
            matchStage, // Reuse the same filter
            { $count: "total" }
        ];
        const countResult = await Project.aggregate(countPipeline);
        const totalProjects = countResult.length > 0 ? countResult[0].total : 0;
        const totalPages = Math.ceil(totalProjects / limit);

        res.status(200).json({
            projects,
            pagination: {
                currentPage: page,
                totalPages,
                totalProjects,
                limit
            }
        });

    } catch (error) {
        console.error("Error in getAllProjects:", error);
        res.status(500).json({ error: error.message });
    }
};



export const deleteProject = async (req, res) => {
  const { id } = req.params; // Get the ID of the project to delete

  let session;

  try {
    // 1. Start a session and transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 2. Find the project in the database
    const project = await Project.findById(id).session(session);
    if (!project) {
      // If the project doesn't exist, abort the transaction and respond with an error
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Project not found' });
    }

    // 3. Delete the project
    const deletedProject = await Project.findByIdAndDelete(id).session(session);
    if (!deletedProject) {
      // If deletion fails, abort the transaction and respond with an error
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Error deleting project' });
    }

    // 4. Commit and execute the transaction
    await session.commitTransaction();
    session.endSession();

    // 5. Respond with a success message
    res.status(200).json({
      message: 'Project deleted successfully',
      deletedProject: {
        id: deletedProject._id,
        project_details: deletedProject.project_details, // Add more details if needed
      }
    });

  } catch (error) {
    // 6. In case of error, abort the entire transaction
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }
    console.error("Error deleting project:", error);
    res.status(500).json({ message: 'Error deleting project.', error: error.message });
  }
};

// @desc    Update project
export const updateProject = async (req, res) => {
    const { id } = req.params; // Project ID
    const {
        title,            // Add title
        project_details,
        category_id,
        deadline_date,
        client_initial_budget,
        status
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    let session;

    try {
        // Start session for transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Check if project exists
        const project = await Project.findById(id).session(session);
        if (!project) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Project not found' });
        }

        // 2. Check user permissions
        // Client can only update their own project, Admin can update any project
        if (userRole === 'Client' && project.client_id.toString() !== userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You are not authorized to update this project' });
        }

        // 3. Update basic fields
        const updatedFields = {};
        if (title) updatedFields.title = title;           // Add title
        if (project_details) updatedFields.project_details = project_details;
        if (category_id) updatedFields.category_id = category_id;
        if (deadline_date) updatedFields.deadline_date = deadline_date;
        if (client_initial_budget) updatedFields.client_initial_budget = client_initial_budget;
        
        // Only Admin can change status
        if (status && userRole === 'Admin') {
            updatedFields.status = status;
        }

        // 4. If project details are updated, re-extract skills
        if (project_details && project_details !== project.project_details) {
            console.log("Project details changed, re-extracting skills...");
            
            // Call AI service to extract skills
            const aiServiceResponse = await fetch('https://aivisiocraft.up.railway.app/extract-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_details: project_details }),
            });

            if (!aiServiceResponse.ok) {
                throw new Error(`AI service responded with status: ${aiServiceResponse.status}`);
            }

            const aiData = await aiServiceResponse.json();
            const extractedSkillNames = aiData.skills;
            console.log("Skills extracted by AI:", extractedSkillNames);

            // Find or create skills in the database
            const skillPromises = extractedSkillNames.map(skillName =>
                Skill.findOneAndUpdate(
                       { name: skillName },
                { name: skillName, category: 'Auto-detected' },
                { upsert: true, new: true }
                ).session(session).exec()
            );

            const skillDocuments = await Promise.all(skillPromises);
            const extractedSkillIds = skillDocuments.map(skill => skill._id);
            
            // Update extracted skills
            updatedFields.extracted_skills = extractedSkillIds;
            updatedFields.analysis_status = 'completed';

            // Log skill extraction process
            await AiLog.create([{
                project_id: project._id,
                action_type: 'skill_extraction',
                input_data: { project_details },
                output_data: { extractedSkillNames, extractedSkillIds },
                confidence_score: 0.9
            }], { session });
        }

        // 5. Update project
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true, session }
        )
        .populate('client_id', 'company_name email first_name last_name')
        .populate('freelancer_id', 'name_or_company')
        .populate('extracted_skills')
        .populate('category_id');

        // 6. If project details are updated, restart freelancer matching
        if (project_details && project_details !== project.project_details) {
            console.log("Restarting AI freelancer matching...");
            await findBestFreelancersForProject(updatedProject._id);
            
            // Get project again with updated freelancer suggestions
            const projectWithSuggestions = await Project.findById(updatedProject._id)
                .populate('client_id', 'company_name email first_name last_name')
                .populate('freelancer_id', 'name_or_company')
                .populate('extracted_skills')
                .populate('category_id')
                .session(session);
            
            await session.commitTransaction();
            session.endSession();
            
            return res.status(200).json({
                message: 'Project updated successfully',
                project: projectWithSuggestions
            });
        }

        // 7. End transaction and return updated project
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Project updated successfully',
            project: updatedProject
        });

    } catch (error) {
        // In case of error, abort transaction
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }
        if (session) {
            session.endSession();
        }
        console.error("Error updating project:", error);
        res.status(500).json({ 
            message: 'Error updating project', 
            error: error.message 
        });
    }
};


export const addFilesToProject = async (req, res) => {
    const { id } = req.params; // Project ID
    const userId = req.user.id; // ID of the logged in user
    const userRole = req.user.role; // Role of the user (Client, Freelancer, Admin)

    try {
        // 1. Check if project exists
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project does not exist.' });
        }

        // 2. Check if user has permission to add files
        // Client: can add files to their own project
        // Freelancer: can add files to projects assigned to them
        // Admin: can add files to any project
        if (userRole === 'Client' && project.client_id.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to add files to this project.' });
        }
        
        if (userRole === 'Freelancer' && project.freelancer_id.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to add files to this project.' });
        }

        // 3. Check if user is connected to Google
        // Get full user information to get Google tokens
        const user = await User.findById(userId);
        if (!user || !user.googleTokens || !user.googleTokens.access_token) {
            return res.status(401).json({
                message: 'You need to connect your Google account to add files.',
                requiresGoogleAuth: true
            });
        }

        // 4. Check if files are included in the request
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        // 5. Check if project has a Google Drive folder, create one if not
        let googleDriveFolderId = project.googleDriveFolderId;
        if (!googleDriveFolderId) {
            try {
                googleDriveFolderId = await createDriveFolder(
                    `Project_${id}_${project.project_details.substring(0, 20)}`,
                    process.env.GOOGLE_DRIVE_FOLDER_ID
                );
                
                // Update project with Google Drive folder ID
                await Project.findByIdAndUpdate(id, { googleDriveFolderId });
            } catch (folderError) {
                console.error("Error creating Google Drive folder:", folderError);
                return res.status(500).json({
                    message: 'Error creating Google Drive folder for this project.',
                    error: folderError.message
                });
            }
        }

        // 6. Array to store saved files
        const savedFiles = [];

        // 7. Initialize Google Drive authentication info
        await setDriveCredentials(user.googleTokens);

        for (const file of req.files) {
            try {
                // 8. Upload file to Google Drive
                const fileUrl = await uploadFileToDrive(
                    file.buffer,       // File content
                    file.originalname, // Original file name
                    file.mimetype,     // MIME type
                    googleDriveFolderId // Google Drive folder ID where to store the file
                );

                // 9. Save file information in the database
                const newFile = await ProjetFile.create({
                    project_id: id,
                    uploaded_by_id: userId,
                    file_name: file.originalname,
                    google_drive_url: fileUrl,
                });

                // Add saved file to the array
                savedFiles.push(newFile);
            } catch (fileError) {
                console.error(`Failed to upload file ${file.originalname}:`, fileError);
                
                // Handle Google specific errors
                if (fileError.message.includes('invalid_grant') || fileError.message.includes('TOKEN_EXPIRED')) {
                    return res.status(401).json({
                        message: 'Google token has expired, please reconnect.',
                        requiresReauth: true
                    });
                }
                
                // Other errors
                return res.status(500).json({
                    message: `Failed to upload file: ${file.originalname}`,
                    error: fileError.message
                });
            }
        }

        // 10. Respond with uploaded files
        res.status(201).json({
            message: 'Files added successfully.',
            files: savedFiles
        });

    } catch (error) {
        console.error("Error adding files:", error);
        
        // Handle general errors
        res.status(500).json({
            message: 'Error adding files.',
            error: error.message
        });
    }
};

// @desc    Get details of a single project
export const getProjectById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    try {
        const pipeline = [
            // 1. Filter by project ID
            { $match: { _id: new mongoose.Types.ObjectId(id) } },

            // 2. Join with main collections
            { $lookup: { from: 'clients', localField: 'client_id', foreignField: '_id', as: 'client_info' } },
            { $lookup: { from: 'freelancers', localField: 'freelancer_id', foreignField: '_id', as: 'freelancer_info' } },
            { $lookup: { from: 'skills', localField: 'extracted_skills', foreignField: '_id', as: 'skills_info' } },
            { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category_info' } },

            // 3. Unwind arrays
            { $unwind: { path: '$client_info', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$freelancer_info', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$category_info', preserveNullAndEmptyArrays: true } },

            // 4. Join user info for client and main freelancer
            {
                $lookup: {
                    from: 'users',
                    localField: 'client_info.user_id',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'freelancer_info.user_id',
                    foreignField: '_id',
                    as: 'freelancer_user_info'
                }
            },
            { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$freelancer_user_info', preserveNullAndEmptyArrays: true } },

            // 5. Join details of AI suggested freelancers
            {
                $lookup: {
                    from: 'freelancers',
                    let: { freelancerIds: '$ai_suggested_freelancers.freelancer_id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$freelancerIds'] } } },
                        { $project: { name_or_company: 1, skills: 1, rating: 1, portfolio_url: 1, bio: 1, user_id: 1 } }
                    ],
                    as: 'suggested_freelancers_details'
                }
            },
            // 5.5 Join user info for suggested freelancers
            {
                $lookup: {
                    from: 'users',
                    let: { userIds: '$suggested_freelancers_details.user_id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$userIds'] } } },
                        { $project: { first_name: 1, last_name: 1, email: 1 } }
                    ],
                    as: 'suggested_users_details'
                }
            },

            // --- NEW STEP TO MERGE SUGGESTED DATA ---
            // 6. Create a clean array of suggested freelancers with their user info
            {
                $addFields: {
                    suggested_freelancers_merged: {
                        $map: {
                            input: '$suggested_freelancers_details',
                            as: 'freelancer',
                            in: {
                                $mergeObjects: [
                                    '$$freelancer',
                                    {
                                        user_id: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$suggested_users_details',
                                                        as: 'user',
                                                        cond: { $eq: ['$$user._id', '$$freelancer.user_id'] }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },

            // 7. Reshape the final document
            {
                $project: {
                    title: 1,  // Add title to projected fields
                    project_details: 1, status: 1, analysis_status: 1, deadline_date: 1,
                    complexity_level: 1, client_initial_budget: 1, budget_status: 1,
                    createdAt: 1, updatedAt: 1,
                    client_id: { $mergeObjects: ['$client_info', { user_id: '$user_info' }] },
                    freelancer_id: { $mergeObjects: ['$freelancer_info', { user_id: '$freelancer_user_info' }] },
                    extracted_skills: '$skills_info',
                    category_id: '$category_info',
                    // --- SIMPLIFIED LOGIC THANKS TO THE PREVIOUS STEP ---
                    ai_suggested_freelancers: {
                        $map: {
                            input: '$ai_suggested_freelancers',
                            as: 'suggested',
                            in: {
                                freelancer_id: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$suggested_freelancers_merged', // Use the merged array
                                                cond: { $eq: ['$$this._id', '$$suggested.freelancer_id'] }
                                            }
                                        },
                                        0
                                    ]
                                },
                                score: '$$suggested.score',
                                reason: '$$suggested.reason'
                            }
                        }
                    }
                }
            }
        ];

        const [project] = await Project.aggregate(pipeline);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Authorization logic (unchanged)
        if (userRole === 'Client' && project.client_id?.user_id?._id?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }
        if (userRole === 'Freelancer' && project.freelancer_id?.user_id?._id?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        res.status(200).json(project);

    } catch (error) {
        console.error("Error retrieving project details:", error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const acceptProject = async (req, res) =>{ 
  try {
        const { id } = req.params;
        const freelancerId = req.user.id; // The ID of the logged in user, provided by the 'protect' middleware

        // 1. Find the project
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // 2. Check that the status is 'assigned'
        if (project.status !== 'assigned') {
            return res.status(400).json({ message: "This project cannot be accepted. Current status is: " + project.status });
        }

        // 3. Find the Freelancer document associated with the logged in user
        const freelancer = await Freelancer.findOne({ user_id: freelancerId });
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer profile not found for this user." });
        }

        // 4. Check that the logged in freelancer is the one assigned to the project
        if (project.freelancer_id.toString() !== freelancer._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to accept this project." });
        }

        // 5. Update project status
        project.status = 'completed';
        project.assigned_at = new Date();
        await project.save();

        res.status(200).json({
            message: "Project accepted successfully.",
            project: {
                _id: project._id,
                status: project.status,
                title: project.title
            }
        });

    } catch (error) {
        console.error("Error accepting project:", error);
        res.status(500).json({ 
            message: "Internal server error.", 
            error: error.message 
        });
    }};

// @desc    Freelancer marks a project as completed
export const completeProjectByFreelancer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // The ID of the logged in user

        // 1. Find the project
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // 2. Check that the status is 'in_progress'
        if (project.status !== 'in_progress') {
            return res.status(400).json({ message: "This project cannot be marked as completed. Current status is: " + project.status });
        }

        // 3. Find the Freelancer document associated with the logged in user
        const freelancer = await Freelancer.findOne({ user_id: userId });
        if (!freelancer) {
            return res.status(404).json({ message: "Freelancer profile not found for this user." });
        }

        // 4. Check that the logged in freelancer is the one assigned to the project
        if (project.freelancer_id.toString() !== freelancer._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to complete this project." });
        }

        // 5. Update project status
        project.status = 'completed';
        project.completed_at = new Date();
        await project.save();

        res.status(200).json({
            message: "Project marked as completed successfully.",
            project: {
                _id: project._id,
                status: project.status,
                title: project.title
            }
        });

    } catch (error) {
        console.error("Error completing project:", error);
        res.status(500).json({ 
            message: "Internal server error.", 
            error: error.message 
        });
    }
};
