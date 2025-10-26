import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaDollarSign,
  FaCalendarAlt,
  FaCodeBranch,
  FaList,
  FaArrowLeft,
  FaPaperclip,
  FaFolder,
  FaFile,
  FaGoogle,
  FaCheckCircle,
  FaSpinner,
  FaInfoCircle,
  FaEdit,
} from "react-icons/fa";
import axios from "axios";
import api from "../utils/api";

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

const SummaryItem = ({ label, value, children }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-start transition duration-300 shadow-sm hover:shadow-md">
    <p className="text-sm font-bold text-teal-600 mb-1 sm:mb-0 uppercase tracking-wider">
      {label}
    </p>
    <div className="text-gray-900 font-medium text-right sm:max-w-[70%]">
      {value && <p className="text-gray-800">{value}</p>}
      {children}
    </div>
  </div>
);

const StepsBar = ({ currentStep }) => {
  const steps = [
    { id: 1, name: "Details" },
    { id: 2, name: "Confirm" },
  ];
  const activeColor = "teal";

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, index) => (
          <li
            key={step.name}
            className={`flex-1 flex flex-col items-center ${
              index !== steps.length - 1 ? "pr-8" : ""
            }`}
          >
            <div className={`flex items-center relative mb-2`}>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition duration-300 shadow-lg
                  ${
                    currentStep > step.id
                      ? `bg-${activeColor}-500 text-white`
                      : currentStep === step.id
                      ? `border-2 border-${activeColor}-400 bg-white text-${activeColor}-600 shadow-xl`
                      : `bg-gray-100 text-gray-500`
                  }`}
              >
                {currentStep > step.id ? (
                  <FaCheckCircle className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </span>

              {index !== steps.length - 1 && (
                <div
                  className={`absolute left-full w-full h-1 ml-8 top-1/2 transform -translate-y-1/2 rounded-full 
                    ${
                      currentStep > step.id
                        ? `bg-${activeColor}-500`
                        : `bg-gray-300`
                    }
                  `}
                />
              )}
            </div>

            <p
              className={`text-sm font-medium ${
                currentStep >= step.id
                  ? `text-${activeColor}-600`
                  : `text-gray-500`
              }`}
            >
              {step.name}
            </p>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const BASE_URL = "http://localhost:8080/api";
const AXIOS_CONFIG = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};

const FormBar = () => {
  // --- States ---
  const [projectDetails, setProjectDetails] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [initialBudget, setInitialBudget] = useState("");
  const [uploadType, setUploadType] = useState("file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [isMarked, setIsMarked] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showGoogleConnectButton, setShowGoogleConnectButton] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [showEditProjectOption, setShowEditProjectOption] = useState(false);
  const [title, setTitle] = useState("");

  // --- Effects & Handlers ---

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const userResponse = await axios.get(
          `${BASE_URL}/auth/me`,
          AXIOS_CONFIG
        );
        setCurrentUser(userResponse.data);
        try {
          const statusResponse = await axios.get(
            `${BASE_URL}/auth/me/google-status`,
            AXIOS_CONFIG
          );
          setIsGoogleConnected(statusResponse.data.isConnected);
        } catch (statusError) {
          setIsGoogleConnected(!!userResponse.data.googleTokens);
        }
        const categoriesResponse = await axios.get(
          `${BASE_URL}/categories`,
          AXIOS_CONFIG
        );
        setCategories(categoriesResponse.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const checkAuthStatus = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get("auth");

      if (authStatus === "success") {
        const fetchUserData = async () => {
          try {
            const response = await axios.get(
              `${BASE_URL}/auth/me`,
              AXIOS_CONFIG
            );
            setCurrentUser(response.data);
            setIsGoogleConnected(response.data.googleTokens ? true : false);
            setShowGoogleConnectButton(false);
            
            // If there's a previously created project and the user is now connected to Google
            if (createdProjectId) {
              setShowEditProjectOption(true);
            }
            
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          } catch (error) {
            console.error("Error reloading user data after auth:", error);
          }
        };
        fetchUserData();
      } else if (authStatus === "error") {
        setValidationError(
          "Authentication with Google failed. Please try again."
        );
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };
    checkAuthStatus();
  }, [createdProjectId]);

  const handleLinkGoogleAccount = async () => {
    setIsAuthenticating(true);
    setValidationError("");
    try {
      const response = await axios.get(
        `${BASE_URL}/auth/google/auth-url`,
        AXIOS_CONFIG
      );
      const { authUrl } = response.data;
      window.location.href = authUrl;
    } catch (error) {
      setValidationError(
        "Failed to initiate the Google account linking process. Please try again."
      );
      setIsAuthenticating(false);
    }
  };

  const handleFileChange = (event) => {
    if (uploadType === "file") {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleValidate = (event) => {
    event.preventDefault();
    setValidationError("");

    if (!title || !projectDetails || !categoryId || !deadlineDate || !initialBudget) {
      setValidationError("Please fill in all fields.");
      return;
    }
    if (initialBudget <= 0) {
      setValidationError("Budget must be a positive number.");
      return;
    }
    if (uploadType === "folder" && !folderName.trim()) {
      setValidationError("Please provide a name for the folder.");
      return;
    }

    setStep(2);
  };

  const getFreshUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw new Error("Authentication failed. Please log in again.");
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setValidationError("");

    try {
      const freshUserData = await getFreshUserData();
      const clientId = freshUserData._id || freshUserData.id;

      const formData = {
        title: title,
        project_details: projectDetails,
        category_id: categoryId,
        deadline_date: deadlineDate.toISOString(),
        client_initial_budget: initialBudget,
        client_id: clientId,
      };

      // Create the project first
      const projectResponse = await axios.post(
        `${BASE_URL}/projects`,
        formData,
        AXIOS_CONFIG
      );

      if (!projectResponse.data) {
        throw new Error("Failed to create project");
      }

      const newProjectId = projectResponse.data._id;
      setCreatedProjectId(newProjectId);

      // --- File upload logic ---
      const hasFiles =
        (uploadType === "file" && selectedFile) ||
        (uploadType === "folder" && selectedFiles.length > 0);

      if (hasFiles) {
        if (!isGoogleConnected) {
          // If there are files but the user is not connected to Google
          // The project is created without files and a message is displayed with a connect button
          setValidationError(
            "Project created successfully! However, to upload files, you must connect your Google account first."
          );
          setShowGoogleConnectButton(true);
          setIsSubmitting(false);
          return;
        }

        try {
          if (uploadType === "file") {
            // Upload single file
            const fileFormData = new FormData();
            fileFormData.append("file", selectedFile);
            
            await api.post(
              `/projects/${newProjectId}/files`,
              fileFormData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
          } else {
            // Upload folder
            const folderFormData = new FormData();
            selectedFiles.forEach((file) =>
              folderFormData.append("files", file)
            );
            folderFormData.append("folderName", folderName);
            folderFormData.append("isMarked", isMarked);
            
            await api.post(
              `/projects/${newProjectId}/folder`,
              folderFormData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
          }

          alert(
            `Success: Project created and ${uploadType} uploaded!`
          );
          resetForm();
        } catch (fileError) {
          let fileErrorMessage = `The project was created, but the upload failed.`;

          if (
            fileError.response?.status === 401 &&
            fileError.response?.data?.requiresGoogleAuth
          ) {
            fileErrorMessage =
              "The project was created! However, to upload files, you must link your Google account first. Please use the button below.";
            setShowGoogleConnectButton(true);
          } else if (
            fileError.response?.status === 401 &&
            fileError.response?.data?.requiresReauth
          ) {
            fileErrorMessage = "Google session expired. Please re-authenticate.";
            setShowGoogleConnectButton(true);
          } else if (fileError.response?.data?.message) {
            fileErrorMessage += `: ${fileError.response.data.message}`;
          }

          setValidationError(fileErrorMessage);
        }
      } else {
        // No files, just create the project
        alert(`Success: Project created successfully!`);
        resetForm();
      }
    } catch (error) {
      setValidationError(
        error.message || "An unexpected error occurred while creating the project."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
     setTitle("");
    setProjectDetails("");
    setCategoryId("");
    setDeadlineDate(null);
    setInitialBudget("");
    setSelectedFile(null);
    setSelectedFiles([]);
    setFolderName("");
    setIsMarked(false);
    setUploadType("file");
    setStep(1);
    setValidationError("");
    setShowGoogleConnectButton(false);
    setCreatedProjectId(null);
    setShowEditProjectOption(false);
  };

  const getCategoryName = () => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "Category not found";
  };

  const handleEditProject = () => {
    // Redirect user to project edit page
    window.location.href = `/projects/${createdProjectId}/edit`;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin h-8 w-8 text-teal-600 mr-3" />{" "}
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-red-600 p-8 text-lg font-medium">
          Error loading data: {error.message}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen sm:p-4 p-2">
      <div className="mt-6 mx-auto p-6 sm:p-10 rounded-3xl shadow-2xl transition duration-500 ease-in-out max-w-4xl">
        <StepsBar currentStep={step} />

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-gray-800 text-center">
          {step === 1 ? "Project Intake Form" : "Final Submission"}
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 text-center">
          {step === 1
            ? "Enter details, budget, and attachments."
            : "Review details before submitting."}
        </p>

        {step === 1 && (
          <form onSubmit={handleValidate} className="text-left space-y-6">
            {validationError && (
              <div className="text-center text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 font-medium mb-6">
                {validationError}
              </div>
            )}

            {isAuthenticating && (
              <div className="bg-sky-100 border-l-4 border-sky-500 p-4 mb-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <FaSpinner className="animate-spin h-5 w-5 text-sky-500 flex-shrink-0" />
                  <p className="ml-3 text-sm font-medium text-sky-800">
                    Connecting to Google account...
                  </p>
                </div>
              </div>
            )}

            {!isAuthenticating && isGoogleConnected === false && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 mb-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <p className="text-sm font-medium text-yellow-800 flex items-center">
                    <FaGoogle className="h-5 w-5 text-yellow-500 mr-2" />
                    Connect Google Drive to enable file uploads.
                  </p>
                  <button
                    type="button"
                    onClick={handleLinkGoogleAccount}
                    className="bg-yellow-600 rounded-xl shadow-lg py-2 px-4 text-sm font-semibold text-white hover:bg-yellow-700 transition duration-300"
                  >
                    Connect <FaGoogle className="inline ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {isGoogleConnected === true && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 mb-6 rounded-xl shadow-md">
                <p className="text-sm font-medium text-green-800 flex items-center">
                  <FaCheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  Google Drive is connected.
                </p>
              </div>
            )}
            
            <div className="col-span-2 lg:col-span-3 relative">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Project Title
              </label>
              <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                <FaList className="w-5 h-5" />
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1 lg:col-span-3 relative">
                <label>Project Details</label>
                <textarea
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder=" "
                  className={`${INPUT_CLASSES_SOFT} resize-none h-28 pt-4`}
                />
              </div>

              <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                  <FaCodeBranch className="w-5 h-5" />
                </div>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${INPUT_CLASSES_SOFT} cursor-pointer pl-10`}
                >
                  <option value="" disabled>
                    -- Select a category --
                  </option>
                  {categories.map((categorie) => (
                    <option key={categorie._id} value={categorie._id}>
                      {categorie.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative col-span-1 sm:col-span-1 lg:col-span-1">
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Initial Budget
                </label>
                <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                  <FaDollarSign className="w-5 h-5" />
                </div>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  value={initialBudget}
                  onChange={(e) => setInitialBudget(e.target.value)}
                  placeholder="Enter budget amount..."
                  className={`${INPUT_CLASSES_SOFT} pl-10`}
                />
              </div>

              <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deadline Date
                </label>
                <div className="flex items-center absolute left-3 top-[36px] text-teal-500">
                  <FaCalendarAlt className="w-5 h-5" />
                </div>
                <DatePicker
                  id="deadline"
                  selected={deadlineDate}
                  onChange={(date) => setDeadlineDate(date)}
                  placeholderText="Select a date..."
                  className={`${INPUT_CLASSES_SOFT} cursor-pointer pl-10`}
                  isClearable
                  dateFormat="yyyy/MM/dd"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FaPaperclip className={`mr-2 ${ICON_COLOR}`} />
                Project Attachments (Optional)
              </h3>

              <div className="space-y-4 border border-sky-100 p-4 rounded-2xl bg-sky-50 shadow-md">
                <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
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
                  <SoftInputField
                    label="Select File"
                    id="file-upload"
                    icon={FaPaperclip}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                      className={`${INPUT_CLASSES_SOFT.replace(
                        "pl-10",
                        "pl-4"
                      )} cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50 border-dashed border-2`}
                    >
                      <span className="truncate pr-4 text-gray-600">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to select a file..."}
                      </span>
                      <FaPaperclip className="w-4 h-4 text-teal-500" />
                    </div>
                  </SoftInputField>
                ) : (
                  <>
                    <SoftInputField
                      label="Folder Name"
                      id="folder-name"
                      icon={FaFolder}
                    >
                      <input
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        placeholder=" "
                        className={INPUT_CLASSES_SOFT}
                      />
                    </SoftInputField>
                    <SoftInputField
                      label="Select Folder"
                      id="folder-upload"
                      icon={FaFolder}
                    >
                      <input
                        type="file"
                        id="folder-upload"
                        webkitdirectory="true"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div
                        onClick={() =>
                          document.getElementById("folder-upload").click()
                        }
                        className={`${INPUT_CLASSES_SOFT.replace(
                          "pl-10",
                          "pl-4"
                        )} cursor-pointer flex items-center justify-between bg-white hover:bg-gray-50 border-dashed border-2`}
                      >
                        <span className="truncate pr-4 text-gray-600">
                          {selectedFiles.length > 0
                            ? `${selectedFiles.length} files selected`
                            : "Click to select a folder..."}
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
                      <label
                        htmlFor="is-marked"
                        className="text-sm text-gray-700"
                      >
                        Mark this folder as important
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base sm:text-lg font-bold text-white 
                           bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 
                           focus:outline-none focus:ring-4 focus:ring-teal-300 transition duration-300 ease-in-out transform hover:scale-[1.01]"
              >
                Next Step: Review & Submit
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4 p-4 rounded-xl bg-gray-50 shadow-inner">
              <SummaryItem label="Project Details">
                <p className="text-gray-800 break-words whitespace-pre-wrap">
                  {projectDetails}
                </p>
              </SummaryItem>
              <SummaryItem label="Category" value={getCategoryName()} />
              <SummaryItem
                label="Deadline"
                value={deadlineDate.toLocaleDateString()}
              />
              <SummaryItem label="Initial Budget" value={`$${initialBudget}`} />
            </div>

            <h3 className="text-lg font-semibold text-gray-700 pt-4 flex items-center">
              <FaPaperclip className={`mr-2 ${ICON_COLOR}`} /> Attachment
              Summary
            </h3>

            {(uploadType === "file" && selectedFile) ||
            (uploadType === "folder" && selectedFiles.length > 0) ? (
              <div className="space-y-4 p-4 rounded-xl bg-gray-50 shadow-inner">
                {uploadType === "file" && selectedFile && (
                  <SummaryItem label="Attached File">
                    <p className="text-gray-800 flex items-center">
                      <FaFile className="mr-2 text-teal-500" />{" "}
                      {selectedFile.name}
                    </p>
                  </SummaryItem>
                )}
                {uploadType === "folder" && selectedFiles.length > 0 && (
                  <SummaryItem label="Attached Folder">
                    <p className="text-gray-800 font-medium flex items-center">
                      <FaFolder className="mr-2 text-teal-500" />{" "}
                      {folderName || "No Name Provided"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Contains {selectedFiles.length} file(s)
                    </p>
                    {isMarked && (
                      <p className="text-sm text-orange-600 flex items-center mt-1">
                        <FaInfoCircle className="mr-1 h-3 w-3" /> Marked as
                        important
                      </p>
                    )}
                  </SummaryItem>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white">
                No attachments selected.
              </div>
            )}

            {validationError && (
              <div className="text-center text-red-700 bg-red-100 p-3 rounded-xl border border-red-300 font-medium">
                {validationError}
              </div>
            )}

            {showGoogleConnectButton && (
              <button
                type="button"
                onClick={handleLinkGoogleAccount}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base sm:text-lg font-bold text-white 
                               bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-300 mt-4"
              >
                Connect Google Account <FaGoogle className="ml-2" />
              </button>
            )}

            {showEditProjectOption && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <p className="text-sm font-medium text-green-800 flex items-center">
                    <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Google Drive is now connected. You can edit your project to add files.
                  </p>
                  <button
                    type="button"
                    onClick={handleEditProject}
                    className="bg-green-600 rounded-xl shadow-lg py-2 px-4 text-sm font-semibold text-white hover:bg-green-700 transition duration-300"
                  >
                    Edit Project <FaEdit className="inline ml-1 h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setValidationError("");
                  setShowGoogleConnectButton(false);
                }}
                className="flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-md text-base sm:text-lg font-semibold text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-300 transition duration-300 flex-1"
              >
                <FaArrowLeft className="mr-2" /> Back to Edit
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base sm:text-lg font-bold text-white 
                           bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600
                           focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-300 ease-in-out transform hover:scale-[1.01] 
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Creating...
                  </>
                ) : (
                  "Confirm & Create"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBar;