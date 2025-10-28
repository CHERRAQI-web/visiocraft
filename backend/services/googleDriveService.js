import { google } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global variables
let oauth2Client = null;
let driveService = null;

// Initialize Google Drive service
const initializeDriveService = () => {
  try {
    // Load OAuth 2.0 credentials
    // const credentialsPath = path.join(__dirname, '../config/oauth-credentials.json');
    
    // // Check if the file exists
    // if (!fs.existsSync(credentialsPath)) {
    //   throw new Error(`Credentials file not found: ${credentialsPath}`);
    // }
    
    // const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // // Check for required data
    // if (!credentials.web || !credentials.web.client_id || !credentials.web.client_secret) {
    //   throw new Error('The credentials file does not contain the required information');
    // }
    
    // const { client_id, client_secret, redirect_uris } = credentials.web;
    
    // // Check for redirect_uris
    // if (!redirect_uris || redirect_uris.length === 0) {
    //   throw new Error('No redirect URIs specified in the credentials file');
    // }
    
   const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth credentials in environment variables. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.');
    }

    // Create OAuth 2.0 client
    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    
    console.log('Google Drive service initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Drive service:', error.message);
    return false;
  }
};

// Function to generate the authentication URL
export const getAuthUrl = () => {
  if (!oauth2Client) {
    const initialized = initializeDriveService();
    if (!initialized) {
      throw new Error('Failed to initialize Google Drive service');
    }
  }
  
  // === Main change: Add user info scope ===
  const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

// === Add this new function at the end of the file ===
export const handleGoogleCallbackAndFetchUser = async (code) => {
  try {
    if (!oauth2Client) {
      throw new Error('OAuth client not initialized.');
    }

    // 1. Get tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Successfully received tokens from Google.");

    // 2. Set credentials on the client
    oauth2Client.setCredentials(tokens);
    console.log("Credentials set on OAuth client.");

    // 3. Get user info using the same client
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    console.log("Successfully fetched user info from Google.");
    
    // 4. Return tokens and user info together
    return { tokens, userInfo: data };

  } catch (error) {
    console.error('Error during Google callback handling:', error.message);
    throw error;
  }
};

// Function to get the token using the code
export const getAccessToken = async (code) => {
  if (!oauth2Client) {
    const initialized = initializeDriveService();
    if (!initialized) {
      throw new Error('Failed to initialize Google Drive service');
    }
  }
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
    throw error;
  }
};

// Function to set the token
export const setCredentials = (tokens) => {
  if (!oauth2Client) {
    const initialized = initializeDriveService();
    if (!initialized) {
      throw new Error('Failed to initialize Google Drive service');
    }
  }
  
  try {
    oauth2Client.setCredentials(tokens);
    driveService = google.drive({ version: 'v3', auth: oauth2Client });
    console.log('Credentials set successfully');
  } catch (error) {
    console.error('Failed to set credentials:', error.message);
    throw error;
  }
};

// Function to upload a file to Google Drive
export const uploadFileToDrive = async (fileBuffer, fileName, mimeType, folderId) => {
  try {
    if (!driveService) {
      throw new Error('Drive service not initialized. Please set credentials first.');
    }

    // Set up file metadata
    const fileMetaData = {
      name: fileName,
      parents: folderId ? [folderId] : [],
    };

    // Set up media for the file
    const media = {
      mimeType: mimeType,
      body: Readable.from(fileBuffer),
    };

    // Upload the file
    const response = await driveService.files.create({
      resource: fileMetaData,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;
    console.log(`File ${fileName} uploaded successfully with ID: ${fileId}`);

    // Make the file public
    await driveService.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the public link for the file
    return `https://drive.google.com/uc?id=${fileId}`;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};


export const createFolderInDrive = async (folderName, parentFolderId) => {
  try {
    if (!driveService) {
      throw new Error('Drive service not initialized. Please set credentials first.');
    }

    const fileMetaData = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : [],
    };

    const response = await driveService.files.create({
      resource: fileMetaData,
      fields: 'id',
    });

    const folderId = response.data.id;
    console.log(`Folder ${folderName} created successfully with ID: ${folderId}`);

    // Make the folder public
    await driveService.permissions.create({
      fileId: folderId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Return the public link for the folder
    return `https://drive.google.com/drive/folders/${folderId}`;
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error);
    throw error;
  }
};

export const deleteFileFromDrive = async (fileUrl) => {
  try {
    if (!driveService) {
      throw new Error('Drive service not initialized. Please set credentials first.');
    }

    let fileId;
    
    // Handle different Google Drive URL formats
    if (fileUrl.includes('/folders/')) {
      // Folder link: https://drive.google.com/drive/folders/FILE_ID
      fileId = fileUrl.split('/folders/')[1].split('?')[0];
    } else if (fileUrl.includes('/file/d/')) {
      // File link: https://drive.google.com/file/d/FILE_ID/view
      fileId = fileUrl.split('/file/d/')[1].split('/')[0];
    } else if (fileUrl.includes('/uc?id=')) {
      // Download link: https://drive.google.com/uc?id=FILE_ID
      const urlParts = new URL(fileUrl);
      fileId = urlParts.searchParams.get('id');
    } else {
      throw new Error('Could not extract file ID from the URL.');
    }

    if (!fileId) {
      throw new Error('Could not extract file ID from the URL.');
    }

    await driveService.files.delete({ fileId: fileId });
    console.log(`File with ID ${fileId} deleted successfully from Google Drive.`);
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
};

// ... (rest of the code remains as is) ...

// Function to upload multiple files to a specific folder (optimized)
export const uploadMultipleFilesToDrive = async (files, folderUrl) => {
  try {
    if (!driveService) {
      throw new Error('Drive service not initialized. Please set credentials first.');
    }

    // Extract folder ID from the URL
    let folderId = null;
    if (folderUrl) {
      if (folderUrl.includes('/folders/')) {
        folderId = folderUrl.split('/folders/')[1].split('?')[0];
      } else if (folderUrl.includes('/uc?id=')) {
        const urlParts = new URL(folderUrl);
        folderId = urlParts.searchParams.get('id');
      }
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileMetaData = {
        name: file.originalname,
        parents: folderId ? [folderId] : [],
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const response = await driveService.files.create({
        resource: fileMetaData,
        media: media,
        fields: 'id',
      });

      const fileId = response.data.id;
      console.log(`File ${file.originalname} uploaded successfully with ID: ${fileId}`);

      // Make the file public
      await driveService.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      uploadedFiles.push({
        name: file.originalname,
        url: `https://drive.google.com/uc?id=${fileId}`
      });
    }

    return uploadedFiles;
  } catch (error) {
    console.error('Error uploading multiple files to Google Drive:', error);
    throw error;
  }
};

// NOTE: The following functions seem to be controller logic and might be better placed in a controller file.
// They are translated here as requested.

const setDriveCredentials = async (userId) => {
  // Find the user, fetching the tokens
  const user = await User.findById(userId).select('+googleTokens');
  
  if (!user) {
    // This error will be caught by the catch block
    throw new Error('User not found');
  }
  
  if (!user.googleTokens) {
    // === This is the error we expect ===
    // We throw a custom error that we can identify later
    throw new Error('GOOGLE_AUTH_REQUIRED'); 
  }
  
  // If everything is correct, we set the credentials
  setCredentials(user.googleTokens);
  return true;
};

export const uploadProjectFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was sent' });
  }

  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // This function might throw an error, so we wrap it in a try block
    await setDriveCredentials(userId);

    // ... (rest of the successful upload code) ...
    const fileUrl = await uploadFileToDrive(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    const newFile = await ProjetFile.create({
      project_id: projectId,
      uploaded_by_id: userId,
      file_name: req.file.originalname,
      google_drive_url: fileUrl,
    });

    res.status(201).json(newFile);

  } catch (error) {
    console.error('An error occurred during file upload:', error.message);
    
    // === Error Handling ===
    // We check the error type to send the appropriate response
    if (error.message === 'GOOGLE_AUTH_REQUIRED') {
      // Send a 401 response with a custom message for the frontend
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
    
    // For any other error, send a generic server response
    res.status(500).json({ message: 'File upload failed' });
  }
};

export const getUserInfo = async () => {
  try {
    if (!oauth2Client) {
      throw new Error('OAuth client not initialized. Please authenticate first.');
    }
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    
    console.log("Successfully fetched user info from Google.");
    return data;
  } catch (error) {
    console.error('Error fetching user info from Google:', error.message);
    throw error;
  }
};

// Initialize the service when the module is loaded
initializeDriveService();