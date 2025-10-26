import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaDollarSign,
  FaBriefcase,
  FaPaperclip,
  FaFile,
  FaFolder,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaEdit,
  FaUpload,
  FaTimes,
  FaGoogle,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../utils/api";
import { isAuthenticated, logout } from "../utils/auth.jsx";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [user, setUser] = useState(null);
  
  // États pour l'upload de fichiers
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  
  // États pour l'authentification Google Drive
  const [googleAuthRequired, setGoogleAuthRequired] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  
  // Nouvel état pour la vérification des fichiers avant soumission
  const [isVerifyingFiles, setIsVerifyingFiles] = useState(false);
  const [filesVerified, setFilesVerified] = useState(false);
  
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await isAuthenticated();
      console.log("Raw user data from isAuthenticated:", userData);
      
      if (userData) {
        setUser(userData);
        
        // Handle different possible data structures
        let role = null;
        let userId = null;
        
        // Check if role is directly on userData
        if (userData.role) {
          role = userData.role;
        } 
        // Check if role is nested in a user object
        else if (userData.user && userData.user.role) {
          role = userData.user.role;
        }
        // Check if role is nested in a data object
        else if (userData.data && userData.data.role) {
          role = userData.data.role;
        }
        // Check if role is nested in data.user
        else if (userData.data && userData.data.user && userData.data.user.role) {
          role = userData.data.user.role;
        }
        
        // Similar checks for user ID
        if (userData.user_id) {
          userId = userData.user_id;
        } 
        else if (userData._id) {
          userId = userData._id;
        }
        else if (userData.user && userData.user._id) {
          userId = userData.user._id;
        }
        else if (userData.user && userData.user.user_id) {
          userId = userData.user.user_id;
        }
        else if (userData.data && userData.data._id) {
          userId = userData.data._id;
        }
        else if (userData.data && userData.data.user_id) {
          userId = userData.data.user_id;
        }
        else if (userData.data && userData.data.user && userData.data.user._id) {
          userId = userData.data.user._id;
        }
        else if (userData.data && userData.data.user && userData.data.user.user_id) {
          userId = userData.data.user.user_id;
        }
        
        setUserRole(role);
        setCurrentUserId(userId);
        
        // Vérifier si l'utilisateur a déjà connecté son compte Google
        checkGoogleConnection(userId);
        
        console.log("Extracted role:", role);
        console.log("User ID:", userId);
      } else {
        setUser(null);
        setUserRole(null);
        setCurrentUserId(null);
        setError("You are not authenticated or your session has expired.");
      }
    } catch (error) {
      console.error("Error while checking authentication:", error);
      setUser(null);
      setUserRole(null);
      setCurrentUserId(null);
      setError("Error while checking authentication.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Vérifier si l'utilisateur a déjà connecté son compte Google
  const checkGoogleConnection = async (userId) => {
    try {
      const response = await api.get('/auth/google/status');
      setIsGoogleConnected(response.data.isConnected);
    } catch (error) {
      console.error("Error checking Google connection status:", error);
      setIsGoogleConnected(false);
    }
  };

  // Obtenir l'URL d'authentification Google
  const getGoogleAuthUrl = async () => {
    try {
      const response = await api.get('/auth/google/url');
      setGoogleAuthUrl(response.data.authUrl);
      setGoogleAuthRequired(true);
    } catch (error) {
      console.error("Error getting Google auth URL:", error);
      setError("Failed to get Google authentication URL.");
    }
  };

  // Gérer la connexion à Google Drive
  const handleGoogleConnect = () => {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    } else {
      getGoogleAuthUrl();
    }
  };

  const handleLinkGoogleAccount = async () => {
    setIsAuthenticating(true);
    setValidationError("");
    try {
      // Store current URL for redirect after authentication
      sessionStorage.setItem('redirectAfterAuth', window.location.pathname);
      
      const response = await api.get("/auth/google/auth-url");
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Google authentication error:", error);
      setValidationError("Failed to initialize Google connection. Please try again.");
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    fetchUser();
    window.addEventListener("userLoggedIn", fetchUser);
    return () => window.removeEventListener("userLoggedIn", fetchUser);
  }, [fetchUser]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we're returning from Google authentication
        const urlParams = new URLSearchParams(window.location.search);
        const authSuccess = urlParams.get('auth');
        
        if (authSuccess === 'google') {
          // Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          // Show success message
          setSuccessMessage("Google account connected successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        }

        const projectResponse = await api.get(`/projects/${id}`);
        setProject(projectResponse.data);
        console.log("Project data:", projectResponse.data);

        const filesResponse = await api.get(`/projects/${id}/files`);
        setFiles(filesResponse.data || []);
      } catch (err) {
        console.error("Error loading project details:", err);
        setError(err.response?.data?.message || "Unable to load project details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const handleAcceptProject = async () => {
    if (!window.confirm("Are you sure you want to accept this project? The status will change to 'In Progress'.")) {
      return;
    }
    setIsAccepting(true);
    setError(null);
    try {
      await api.put(`/projects/${id}/accept`);
      setProject(prevProject => ({ ...prevProject, status: 'in_progress' }));
      alert("Project accepted successfully! Good work!");
    } catch (err) {
      console.error("Error accepting project:", err);
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsAccepting(false);
    }
  };

  // Fonction pour gérer la sélection de fichiers
  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setUploadStatus(null);
  };

  // Fonction pour supprimer un fichier de la liste des fichiers sélectionnés
  const removeSelectedFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Fonction pour uploader les fichiers vers Google Drive
  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    // Vérifier si Google Drive est connecté
    if (!isGoogleConnected) {
      getGoogleAuthUrl();
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      // Simulation de la progression (à adapter selon votre API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post(`/projects/${id}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Mettre à jour la liste des fichiers
      if (response.data && response.data.files) {
        setFiles(prevFiles => [...prevFiles, ...response.data.files]);
      } else if (response.data) {
        // Si un seul fichier est retourné
        setFiles(prevFiles => [...prevFiles, response.data]);
      }

      // Réinitialiser les états
      setSelectedFiles([]);
      setUploadStatus('success');
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error("Error uploading files:", err);
      
      // Gérer les erreurs spécifiques à Google Drive
      if (err.response?.data?.requiresGoogleAuth) {
        setGoogleAuthRequired(true);
        if (err.response?.data?.authUrl) {
          setGoogleAuthUrl(err.response.data.authUrl);
        } else {
          getGoogleAuthUrl();
        }
      } else if (err.response?.data?.requiresReauth) {
        setGoogleAuthRequired(true);
        getGoogleAuthUrl();
      } else {
        setUploadStatus('error');
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Fonction pour vérifier si les fichiers sont uploadés sur Google Drive
  const verifyFilesUploaded = async () => {
    setIsVerifyingFiles(true);
    setError(null);
    
    try {
      // Vérifier si le projet a des fichiers
      if (files.length === 0) {
        setFilesVerified(true);
        setIsVerifyingFiles(false);
        return true;
      }
      
      // Vérifier si tous les fichiers sont uploadés sur Google Drive
      const allFilesUploaded = files.every(file => file.google_drive_url);
      
      if (!allFilesUploaded) {
        setError("Some files are not uploaded to Google Drive. Please upload all files before submitting for review.");
        setIsVerifyingFiles(false);
        return false;
      }
      
      setFilesVerified(true);
      setIsVerifyingFiles(false);
      return true;
    } catch (err) {
      console.error("Error verifying files:", err);
      setError("Failed to verify files. Please try again.");
      setIsVerifyingFiles(false);
      return false;
    }
  };

  // Add handlers for the other action buttons
  const handleSubmitForReview = async () => {
    // Vérifier d'abord si les fichiers sont uploadés
    const filesAreVerified = await verifyFilesUploaded();
    
    if (!filesAreVerified) {
      return;
    }
    
    try {
      await api.put(`/projects/${id}/submit`);
      setProject(prevProject => ({ ...prevProject, status: 'in_review' }));
      alert("Project submitted for review!");
    } catch (err) {
      console.error("Error submitting:", err);
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const handleApproveProject = async () => {
    try {
      await api.put(`/projects/${id}/complete`);
      setProject(prevProject => ({ ...prevProject, status: 'completed' }));
      alert("Project approved!");
    } catch (err) {
      console.error("Error approving:", err);
      setError(err.response?.data?.message || "An error occurred.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'pending_assignment': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending_assignment': 'Pending Assignment',
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'in_review': 'In Review',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="container mx-auto p-6">Project not found.</div>;
  }

  // Debug logs to help troubleshoot
  console.log("User role:", currentUserId.role);
  console.log("Current user ID:", currentUserId);
  console.log("Project freelancer ID:", project.freelancer_id);
  console.log("Project status:", project.status);

  const isAssignedFreelancer =  currentUserId.role === 'Freelancer' && 
    project.freelancer_id && 
    currentUserId && 
    project.freelancer_id.toString() === currentUserId.toString();

  // Updated logic for accepting project - now works for both pending_assignment and assigned status
  const canAcceptProject =  currentUserId.role === 'Freelancer' && 
    (project.status === 'pending_assignment' || project.status === 'assigned') && 
    project.freelancer_id && 
    currentUserId && 
    project.freelancer_id.toString() === currentUserId.toString();

  // Debug variables
  const isFreelancer = userRole === 'Freelancer';
  
  console.log("Debug info:");
  console.log("- isFreelancer:", isFreelancer);
  console.log("- isAssignedFreelancer:", isAssignedFreelancer);
  console.log("- canAcceptProject:", canAcceptProject);
  console.log("- project.status === 'in_progress':", project.status === 'in_progress');
  console.log("- project.status === 'in_review':", project.status === 'in_review');

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Success and Error Messages */}
      {successMessage && (
        <div className="text-center text-green-700 bg-green-100 p-3 rounded-xl border border-green-300 font-medium mb-6">
          {successMessage}
        </div>
      )}

      {validationError && (
        <div className="text-center text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 font-medium mb-6">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{project.title}</h1>
            <p className="text-gray-600 whitespace-pre-wrap">{project.project_details}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <FaBriefcase className="mr-2 text-blue-500" />
              Client Information
            </h2>
            <p className="text-gray-800"><span className="font-medium">Name:</span> {project.client_id?.company_name || `${project.client_id?.user_id?.first_name} ${project.client_id?.user_id?.last_name}`}</p>
            <p className="text-gray-800"><span className="font-medium">Email:</span> {project.client_id?.user_id?.email || 'N/A'}</p>
          </div>

          {/* Section des fichiers avec upload */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FaPaperclip className="mr-2 text-teal-500" />
                Project Files ({files.length})
              </div>
              {isAssignedFreelancer && project.status === 'in_progress' && (
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="text-sm bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 transition-colors flex items-center"
                >
                  <FaUpload className="mr-1" /> Add Files
                </button>
              )}
            </h2>
            
            {/* Input pour les fichiers (caché) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Liste des fichiers sélectionnés pour l'upload */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Files to upload:</h3>
                <ul className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate">{file.name}</span>
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
                
                {/* Barre de progression */}
                {isUploading && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Uploading to Google Drive...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Messages de statut */}
                {uploadStatus === 'success' && (
                  <div className="mt-2 text-sm text-green-600">
                    Files uploaded successfully to Google Drive!
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="mt-2 text-sm text-red-600">
                    Error uploading files. Please try again.
                  </div>
                )}
                
                {/* Bouton d'upload */}
                <div className="mt-3 flex justify-end">
                  {!isGoogleConnected ? (
                    <button
                      onClick={handleLinkGoogleAccount}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
                    >
                      <FaGoogle className="mr-2" /> Connect to Google Drive
                    </button>
                  ) : (
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <FaSpinner className="animate-spin inline mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload className="inline mr-2" />
                          Upload to Google Drive
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Notification pour l'authentification Google */}
            {googleAuthRequired && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Google Drive Connection Required</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You need to connect your Google Drive account to upload files.
                    </p>
                    <button
                      onClick={handleGoogleConnect}
                      className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors flex items-center"
                    >
                      <FaGoogle className="mr-1" /> Connect to Google Drive
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Liste des fichiers existants */}
            {files.length > 0 ? (
              <ul className="space-y-3">{files.map((file) => (
                <li key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    {file.file_type === 'folder' ? <FaFolder className="mr-3 text-yellow-500" /> : <FaFile className="mr-3 text-blue-500" />}
                    <span className="text-gray-800 font-medium">{file.file_name}</span>
                    {file.google_drive_url ? (
                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Uploaded to Google Drive</span>
                    ) : (
                      <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Not uploaded</span>
                    )}
                  </div>
                  <a href={file.google_drive_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors" title="Download file">
                    <FaDownload className="mr-1" /> Download
                  </a>
                </li>
              ))}</ul>
            ) : (
              <p className="text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">No files attached to this project.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500 flex items-center"><FaDollarSign className="mr-1" /> Budget:</span><span className="font-medium">${project.client_initial_budget?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 flex items-center"><FaCalendarAlt className="mr-1" /> Deadline:</span><span className="font-medium">{formatDate(project.deadline_date)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 flex items-center"><FaBriefcase className="mr-1" /> Category:</span><span className="font-medium">{project.category_id?.name || 'N/A'}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.extracted_skills?.length > 0 ? (
                project.extracted_skills.map((skill) => (
                  <span key={skill._id} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">{skill.name}</span>
                ))
              ) : (
                <span className="text-gray-500">No skills specified.</span>
              )}
            </div>
          </div>

          {/* Actions section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Actions</h3>
            
            <div className="space-y-3">
              {canAcceptProject && (
                <button onClick={handleAcceptProject} disabled={isAccepting} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                  {isAccepting ? <><FaSpinner className="animate-spin mr-2" /> Accepting...</> : <><FaCheckCircle className="inline mr-2" /> Accept this project</>}
                </button>
              )}

              {isAssignedFreelancer && project.status === 'in_progress' && (
                <button 
                  onClick={handleApproveProject} 
                  disabled={isVerifyingFiles}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isVerifyingFiles ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Verifying files...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="inline mr-2" /> Submit for completed
                    </>
                  )}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;