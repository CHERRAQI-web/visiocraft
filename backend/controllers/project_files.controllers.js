import ProjectFile from '../models/project_files.models.js';
import User from '../models/user.models.js';
import { 
  uploadFileToDrive, 
  deleteFileFromDrive, 
  setCredentials,
  createFolderInDrive,
  uploadMultipleFilesToDrive
} from '../services/googleDriveService.js';
import Client from '../models/client.models.js';

// Function to set credentials before using the service
const setDriveCredentials = async (userId) => {
  try {
    console.log(`[Set Drive Credentials] Function called for User ID: ${userId}`);
    
    // First, search in the User model
    let user = await User.findById(userId).select('+googleTokens');
    
    if (user && user.googleTokens) {
      console.log(`[Set Drive Credentials] Found tokens in User model.`);
      setCredentials(user.googleTokens);
      return true;
    }
    
    // If not found in User model, search in the Client model
    const client = await Client.findOne({ user_id: userId });
    
    if (client && client.googleTokens) {
      console.log(`[Set Drive Credentials] Found tokens in Client model.`);
      setCredentials(client.googleTokens);
      return true;
    }
    
    // If no tokens found anywhere
    console.log(`[Set Drive Credentials] ERROR: No valid tokens found for User ID: ${userId}.`);
    throw new Error('GOOGLE_AUTH_REQUIRED'); 
    
  } catch (error) {
    console.error('[Set Drive Credentials] Error setting drive credentials:', error.message);
    throw error;
  }
};

export const uploadProjectFile = async (req, res) => {
  console.log("=== UPLOAD FILE DEBUG ===");
  console.log("Request headers:", req.headers);
  console.log("Request cookies:", req.cookies);
  console.log("User from middleware:", req.user);
  console.log("File received:", req.file);
  console.log("File details:", req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    buffer: req.file.buffer ? `Buffer of length ${req.file.buffer.length}` : 'No buffer'
  } : 'No file');
  console.log("========================");

  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded.' });
  }

  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    await setDriveCredentials(userId);

    const fileUrl = await uploadFileToDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    const newFile = await ProjectFile.create({
      project_id: projectId,
      uploaded_by_id: userId,
      file_name: req.file.originalname,
      google_drive_url: fileUrl,
    });

    res.status(201).json(newFile);

  } catch (error) {
    console.error("Error uploading file:", error);
    
    if (error.message === 'GOOGLE_AUTH_REQUIRED') {
      return res.status(401).json({ 
        message: 'Google account linking is required to upload files.',
        requiresGoogleAuth: true
      });
    }
    
    if (error.message.includes('invalid_grant') || error.message.includes('TOKEN_EXPIRED')) {
      return res.status(401).json({ 
        message: 'Token has expired, please re-authenticate',
        requiresReauth: true
      });
    }
    
    res.status(500).json({ 
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getFilesForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const files = await ProjectFile.find({ project_id: projectId })
      .populate({
        path: 'uploaded_by_id',
        select: 'first_name last_name'
      })
      .sort({ createdAt: -1 });

    res.status(200).json(files);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProjectFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    // 1. Get the file from the database
    const fileToDelete = await ProjectFile.findById(fileId);

    if (!fileToDelete) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set credentials
    await setDriveCredentials(userId);

    // 2. Delete the file from Google Drive API
    try {
      await deleteFileFromDrive(fileToDelete.google_drive_url);
    } catch (driveError) {
      console.error('Failed to delete file from Google Drive:', driveError);
      
      // If the error is related to token expiration
      if (driveError.message.includes('invalid_grant') || driveError.message.includes('TOKEN_EXPIRED')) {
        return res.status(401).json({ 
          message: 'Token has expired, please re-authenticate',
          requiresReauth: true
        });
      }
    }

    // 3. Delete the file record from the database
    await ProjectFile.findByIdAndDelete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { isMarked, markDescription } = req.body;
    const userId = req.user.id;

    // Check if the file exists
    const file = await ProjectFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update the file
    const updatedFile = await ProjectFile.findByIdAndUpdate(
      fileId,
      {
        is_marked: isMarked,
        mark_description: markDescription
      },
      { new: true }
    );

    res.status(200).json({
      file: updatedFile,
      message: 'Mark updated successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New function to control file visibility for freelancers
export const toggleFileVisibility = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { isVisible } = req.body;
    const userId = req.user.id;

    // Check if the file exists
    const file = await ProjectFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update the file
    const updatedFile = await ProjectFile.findByIdAndUpdate(
      fileId,
      {
        is_visible_to_freelancer: isVisible
      },
      { new: true }
    );

    res.status(200).json({
      file: updatedFile,
      message: 'File visibility updated successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadProjectFolder = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files were uploaded' });
  }

  try {
    const { projectId } = req.params;
    const { folderName, isMarked, markDescription } = req.body;
    const userId = req.user.id;

    // Set credentials
    await setDriveCredentials(userId);

    // 1. Create a folder in Google Drive
    const folderUrl = await createFolderInDrive(
      folderName || `Project_${projectId}_Files`,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    // Extract folder ID from URL
    const folderId = folderUrl.split('/').pop();

    // 2. Upload files to the folder
    const uploadedFiles = await uploadMultipleFilesToDrive(
      req.files,
      folderId // Use folder ID instead of full URL
    );

    // 3. Store folder info in the database
    const newFolder = await ProjectFile.create({
      project_id: projectId,
      uploaded_by_id: userId,
      file_name: folderName || `Project_${projectId}_Files`,
      google_drive_url: folderUrl,
      file_type: 'folder',
      is_marked: isMarked === 'true',
      mark_description: markDescription || '',
      is_visible_to_freelancer: true
    });

    // 4. Store file information in the database
    const savedFiles = await Promise.all(
      uploadedFiles.map(file => 
        ProjectFile.create({
          project_id: projectId,
          uploaded_by_id: userId,
          file_name: file.name,
          google_drive_url: file.url,
          file_type: 'file',
          is_marked: isMarked === 'true',
          mark_description: markDescription || '',
          is_visible_to_freelancer: true
        })
      )
    );

    res.status(201).json({
      folder: newFolder,
      files: savedFiles,
      message: 'Folder and files uploaded successfully'
    });

  } catch (error) {
    console.error(error);
    
    if (error.message.includes('invalid_grant') || error.message.includes('TOKEN_EXPIRED')) {
      return res.status(401).json({ 
        message: 'Token has expired, please re-authenticate',
        requiresReauth: true
      });
    }
    
    res.status(500).json({ message: 'Folder upload failed' });
  }
};
