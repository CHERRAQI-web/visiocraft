import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaDollarSign,
  FaCalendarAlt,
  FaCodeBranch,
  FaArrowLeft,
  FaPaperclip,
  FaFolder,
  FaFile,
  FaGoogle,
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
  FaTrash,
} from "react-icons/fa";
import api from "../utils/api";
import axios from 'axios';

// Reusing the same CSS styles as the creation file
const INPUT_CLASSES_SOFT =
  "peer block w-full pt-3 pb-2 px-4 pl-10 text-base text-gray-800 bg-sky-50 border border-sky-200 rounded-xl appearance-none shadow-inner transition duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";
const ICON_COLOR = "text-teal-500";

const SoftInputField = ({ label, id, icon: Icon, children }) => (
  <div className="relative z-0 w-full mb-6 group">
    {Icon && (
      <div
        className={`flex items-center absolute left-3 top-3 ${ICON_COLOR} pointer-events-none`}
      >
        <Icon className="w-5 h-5" />
      </div>
    )}
    {children}
    <label
      htmlFor={id}
      className="absolute left-10 top-3 -z-10 origin-[0] transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-10 peer-focus:-translate-y-8 peer-focus:scale-75 peer-focus:text-teal-600 font-medium"
    >
      {label}
    </label>
  </div>
);

const EditProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- States ---
  const [projectData, setProjectData] = useState(null);
  const [existingFiles, setExistingFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Form states
  const [title, setTitle] = useState(""); // Added title field
  const [projectDetails, setProjectDetails] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [initialBudget, setInitialBudget] = useState("");

  // States for uploading new files
  const [uploadType, setUploadType] = useState("file");
  const [newSelectedFile, setNewSelectedFile] = useState(null);
  const [newSelectedFiles, setNewSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [isMarked, setIsMarked] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
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
        
        // Fetch project data
        const projectResponse = await api.get(`/projects/${id}`);
        const project = projectResponse.data;
        setProjectData(project);
        
        // Fill fields with current data
        setTitle(project.title || ""); // Added title
        setProjectDetails(project.project_details || "");
        setCategoryId(project.category_id?._id || "");
        setDeadlineDate(project.deadline_date ? new Date(project.deadline_date) : null);
        setInitialBudget(project.client_initial_budget || "");

        // Fetch files associated with the project
        const filesResponse = await api.get(`/projects/${id}/files`);
        setExistingFiles(filesResponse.data);

        // Fetch categories
        const categoriesResponse = await api.get("/categories");
        setCategories(categoriesResponse.data);

        // Check Google connection
        try {
          const statusResponse = await api.get("/auth/me/google-status");
          setIsGoogleConnected(statusResponse.data.isConnected);
        } catch (statusError) {
          console.error("Unable to check Google status:", statusError);
          setIsGoogleConnected(false);
        }

      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(err.response?.data?.message || "Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  // --- Handlers ---
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

  const handleFileChange = (event) => {
    if (uploadType === "file") {
      setNewSelectedFile(event.target.files[0]);
    } else {
      setNewSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await api.delete(`/files/${fileId}`);
      // Update file list after deletion
      setExistingFiles(existingFiles.filter(file => file._id !== fileId));
      setSuccessMessage("File deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setValidationError(error.response?.data?.message || "Failed to delete file.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setValidationError("");
    setSuccessMessage("");

    try {
      // 1. Update basic project data
      const updatedData = {
        title, // Added title
        project_details: projectDetails,
        category_id: categoryId,
        client_initial_budget: initialBudget,
      };

      if (deadlineDate) {
        updatedData.deadline_date = deadlineDate.toISOString();
      }

      await api.put(`/projects/${id}`, updatedData);

      // 2. Upload new files (if any)
      const hasNewFiles = (uploadType === "file" && newSelectedFile) || (uploadType === "folder" && newSelectedFiles.length > 0);

      if (hasNewFiles) {
        if (!isGoogleConnected) {
          setValidationError("Please connect your Google account to upload files.");
          setIsSubmitting(false);
          return;
        }

        try {
          let uploadData;
          
          if (uploadType === "file") {
            uploadData = new FormData();
            uploadData.append("files", newSelectedFile);
          } else {
            uploadData = new FormData();
            newSelectedFiles.forEach((file) => uploadData.append("files", file));
            uploadData.append("folderName", folderName);
            uploadData.append("isMarked", isMarked);
          }
          
          // Use unified endpoint for files and folders
          await api.post(`/projects/${id}/files`, uploadData);
          
          // Update file list after successful upload
          const filesResponse = await api.get(`/projects/${id}/files`);
          setExistingFiles(filesResponse.data);

        } catch (fileError) {
          console.error("File upload error:", fileError);
          
          if (fileError.response?.data?.requiresGoogleAuth) {
            setIsGoogleConnected(false);
            setValidationError("Google authentication failed. Please reconnect your account.");
            setTimeout(() => handleLinkGoogleAccount(), 2000);
          } else {
            setValidationError(fileError.response?.data?.message || "Failed to upload new files.");
          }
          setIsSubmitting(false);
          return;
        }
      }

      setSuccessMessage("Project updated successfully!");
      // Reset file fields
      setNewSelectedFile(null);
      setNewSelectedFiles([]);
      setFolderName("");
      setIsMarked(false);

    } catch (error) {
      console.error("Error updating project:", error);
      setValidationError(error.response?.data?.message || "An unexpected error occurred while updating the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check if we're returning from Google authentication
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    
    if (authSuccess === 'google') {
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Update Google connection state
      const checkGoogleStatus = async () => {
        try {
          const statusResponse = await api.get("/auth/me/google-status");
          setIsGoogleConnected(statusResponse.data.isConnected);
          
          if (statusResponse.data.isConnected) {
            setSuccessMessage("Google account connected successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          }
        } catch (error) {
          console.error("Error checking Google status:", error);
        }
      };
      
      checkGoogleStatus();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin h-8 w-8 text-teal-600 mr-3" />
        <p className="text-lg text-gray-700">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-red-600 p-8 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:p-4 md:p-8">
      <div className="mt-8 sm:mt-12 mx-auto p-6 sm:p-10 rounded-3xl shadow-2xl transition duration-500 ease-in-out max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition self-start sm:self-auto"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-800 text-center">Edit Project</h2>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {validationError && (
          <div className="text-center text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 font-medium mb-6">
            {validationError}
          </div>
        )}

        {successMessage && (
          <div className="text-center text-green-700 bg-green-100 p-3 rounded-xl border border-green-300 font-medium mb-6">
            {successMessage}
          </div>
        )}

        {/* Google connection status */}
        {!isAuthenticating && isGoogleConnected === false && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm font-medium text-yellow-800 flex items-center">
                <FaGoogle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                Connect Google Drive to manage files.
              </p>
              <button
                type="button"
                onClick={handleLinkGoogleAccount}
                className="bg-yellow-600 rounded-xl shadow-lg py-2 px-4 text-sm font-semibold text-white hover:bg-yellow-700 transition duration-300 w-full sm:w-auto"
              >
                Connect <FaGoogle className="inline ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        {isGoogleConnected === true && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-xl shadow-md">
            <p className="text-sm font-medium text-green-800 flex items-center">
              <FaCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
              Google Drive is connected.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-left space-y-6">
          {/* Project detail fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Added title field */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 relative">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                <FaCodeBranch className="w-5 h-5" />
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title..."
                className={`${INPUT_CLASSES_SOFT} pl-10`}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 relative">
              <label>Project Details</label>
              <textarea
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                className={`${INPUT_CLASSES_SOFT} resize-none h-28 pt-4`}
              />
            </div>

            <div className="relative col-span-1 md:col-span-1 lg:col-span-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                <FaCodeBranch className="w-5 h-5" />
              </div>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`${INPUT_CLASSES_SOFT} cursor-pointer pl-10`}
              >
                <option value="" disabled>-- Select a category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="relative col-span-1 md:col-span-1 lg:col-span-1">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Initial Budget</label>
              <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                <FaDollarSign className="w-5 h-5" />
              </div>
              <input
                id="budget"
                type="number"
                min="0"
                value={initialBudget}
                onChange={(e) => setInitialBudget(e.target.value)}
                className={`${INPUT_CLASSES_SOFT} pl-10`}
              />
            </div>

            <div className="relative col-span-1 md:col-span-1 lg:col-span-1">
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                <FaCalendarAlt className="w-5 h-5" />
              </div>
              <DatePicker
                id="deadline"
                selected={deadlineDate}
                onChange={(date) => setDeadlineDate(date)}
                className={`${INPUT_CLASSES_SOFT} cursor-pointer pl-10`}
                isClearable
                dateFormat="yyyy/MM/dd"
              />
            </div>
          </div>

          {/* Existing files section */}
          <div className="border-t border-gray-200 pt-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaPaperclip className={`mr-2 ${ICON_COLOR}`} />
              Existing Project Files
            </h3>
            {existingFiles.length > 0 ? (
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center">
                      {file.file_type === 'folder' ? <FaFolder className="mr-2 text-teal-500" /> : <FaFile className="mr-2 text-teal-500" />}
                      <span className="text-gray-800 truncate">{file.file_name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file._id)}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Delete file"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center p-4 border border-dashed border-gray-300 rounded-xl bg-white">
                No files are attached to this project yet.
              </p>
            )}
          </div>

          {/* Section for adding new files */}
          <div className="border-t border-gray-200 pt-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaPaperclip className={`mr-2 ${ICON_COLOR}`} />
              Add New Attachments
            </h3>

            <div className="space-y-4 border border-sky-100 p-4 rounded-2xl bg-sky-50 shadow-md">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
                <label className="flex items-center text-gray-700 cursor-pointer font-medium">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadType === "file"}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="mr-2 h-5 w-5 text-teal-600 border-sky-300 focus:ring-teal-500"
                  />
                  <FaFile className="mr-1 text-teal-500" /> Single File
                </label>
                <label className="flex items-center text-gray-700 cursor-pointer font-medium">
                  <input
                    type="radio"
                    value="folder"
                    checked={uploadType === "folder"}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="mr-2 h-5 w-5 text-teal-600 border-sky-300 focus:ring-teal-500"
                  />
                  <FaFolder className="mr-1 text-teal-500" /> Folder
                </label>
              </div>

              {uploadType === "file" ? (
                <SoftInputField label="Select a new file" id="new-file-upload">
                  <input type="file" id="new-file-upload" onChange={handleFileChange} className="hidden" />
                  <div
                    onClick={() => document.getElementById("new-file-upload").click()}
                    className={`${INPUT_CLASSES_SOFT.replace("pl-10", "pl-4")} cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50 border-dashed border-2`}
                  >
                    <span className="truncate pr-4 text-gray-600">
                      {newSelectedFile ? newSelectedFile.name : "Click to select a file..."}
                    </span>
                    <FaPaperclip className="w-4 h-4 text-teal-500" />
                  </div>
                </SoftInputField>
              ) : (
                <>
                  <SoftInputField label="New folder name" id="new-folder-name" icon={FaFolder}>
                    <input
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      placeholder=" "
                      className={INPUT_CLASSES_SOFT}
                    />
                  </SoftInputField>
                  <SoftInputField label="Select a new folder" id="new-folder-upload" icon={FaFolder}>
                    <input type="file" id="new-folder-upload" webkitdirectory="true" onChange={handleFileChange} className="hidden" />
                    <div
                      onClick={() => document.getElementById("new-folder-upload").click()}
                      className={`${INPUT_CLASSES_SOFT.replace("pl-10", "pl-4")} cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50 border-dashed border-2`}
                    >
                      <span className="truncate pr-4 text-gray-600">
                        {newSelectedFiles.length > 0 ? `${newSelectedFiles.length} files selected` : "Click to select a folder..."}
                      </span>
                      <FaFolder className="w-4 h-4 text-teal-500" />
                    </div>
                  </SoftInputField>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="is-marked"
                      checked={isMarked}
                      onChange={(e) => setIsMarked(e.target.checked)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mr-2"
                    />
                    <label htmlFor="is-marked" className="text-sm text-gray-700">Mark this folder as important</label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white 
                         bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600
                         focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 ease-in-out transform hover:scale-[1.01] 
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Updating...
                </>
              ) : (
                "Update Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectForm;