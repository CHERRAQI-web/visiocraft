import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [assigning, setAssigning] = useState({}); // To track the loading state by freelancer ID

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setError("No project ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://backend-visiocraft-production.up.railway.app/api/projects/${projectId}`,
          {
            withCredentials: true,
          }
        );
        console.log("project details ", response);
        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project details:", err.response || err);
        if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
        } else if (err.response && err.response.status === 403) {
          setError("You do not have permission to view this project.");
        } else if (err.response && err.response.status === 404) {
          setError("Project not found.");
        } else {
          setError("Failed to load project details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleAssignProject = async (freelancerId) => {
    // Disable button and indicate loading
    setAssigning((prev) => ({ ...prev, [freelancerId]: true }));
    setError(null);

    try {
      const response = await axios.put(
        `http://backend-visiocraft-production.up.railway.app/api/projects/${projectId}/assign`,
        { freelancer_id: freelancerId }, // Request body
        { withCredentials: true }
      );

      // Update project state with the returned data from backend
      setProject(response.data.project);
      setMessage(response.data.message); // Show success message

      // Clear the message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error assigning project:", err);
      setError(err.response?.data?.message || "Failed to assign project.");
      setTimeout(() => setError(""), 5000);
    } finally {
      // Re-enable the button
      setAssigning((prev) => ({ ...prev, [freelancerId]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in_progress":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "assigned":
        return <User className="w-5 h-5 text-purple-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "open":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "open":
        return "Open";
      case "assigned":
        return "Assigned";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <strong>Error:</strong> {error}
        </div>
        <div className="mt-4">
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-900 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to project list
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          Project not found.
        </div>
        <div className="mt-4">
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-900 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to project list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
      {/* Success message */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {message}
        </div>
      )}

      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
            Project Details
          </h1>
        </div>
      </div>

      {/* Main information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Project Information
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">
                Project Name:
              </span>
              <span className="text-gray-900">{project.title || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">Status:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                  project.status
                )} flex items-center`}
              >
                {getStatusIcon(project.status)}
                <span className="ml-1">{getStatusText(project.status)}</span>
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">
                Created At:
              </span>
              <span className="text-gray-900">
                {project.createdAt
                  ? new Date(project.createdAt).toLocaleDateString("en-US")
                  : "N/A"}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">
                Last Updated:
              </span>
              <span className="text-gray-900">
                {project.updatedAt
                  ? new Date(project.updatedAt).toLocaleDateString("en-US")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-600" />
            Client Information
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">
                Client Name:
              </span>
              <span className="text-gray-900">
                {project.client_id?.company_name ||
                  (project.client_id?.user_id?.first_name &&
                  project.client_id?.user_id?.last_name
                    ? `${project.client_id.user_id.first_name} ${project.client_id.user_id.last_name}`
                    : "N/A")}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">Email:</span>
              <span className="text-gray-900">
                {project.client_id?.user_id?.email || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial and timing details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
            Financial Information
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">
                Initial Budget:
              </span>
              <span className="text-gray-900">
                {project.client_initial_budget
                  ? `$${project.client_initial_budget.toLocaleString()}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-600" />
            Deadlines
          </h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium text-gray-700 w-1/3">Due Date:</span>
              <span className="text-gray-900">
                {project.deadline_date
                  ? new Date(project.deadline_date).toLocaleDateString("en-US")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project description and notes */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Project Description
        </h2>
        <p className="text-gray-900 whitespace-pre-wrap">
          {project.project_details || "No description available."}
        </p>
      </div>

      {/* Required skills */}
      {project.extracted_skills && project.extracted_skills.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.extracted_skills.map((skill, index) => (
              <span
                key={skill._id || index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill.name || skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      {project.category_id && (
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Category</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            {project.category_id.name || "N/A"}
          </span>
        </div>
      )}

      {/* Assigned Freelancer */}
      {project.freelancer_id && (
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Assigned Freelancer
          </h2>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
              {project.freelancer_id?.user_id?.first_name
                ? project.freelancer_id.user_id.first_name
                    .charAt(0)
                    .toUpperCase()
                : "F"}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {project.freelancer_id?.user_id
                  ? `${project.freelancer_id.user_id.first_name} ${project.freelancer_id.user_id.last_name}`
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                {project.freelancer_id?.user_id?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggested Freelancers - Responsive View */}
      {project.ai_suggested_freelancers &&
        project.ai_suggested_freelancers.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Freelancer Suggestions
            </h2>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {project.ai_suggested_freelancers.map((suggestion, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {suggestion.freelancer_id?.user_id
                          ? `${suggestion.freelancer_id.user_id.first_name} ${suggestion.freelancer_id.user_id.last_name}`
                          : "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">{suggestion.freelancer_id?.user_id?.email || "N/A"}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">
                        {suggestion.score ? (suggestion.score * 100).toFixed(1) + "%" : "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {suggestion.reason || "N/A"}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {suggestion.freelancer_id?._id && (
                      <Link
                        to={`/freelancer/${suggestion.freelancer_id._id}`}
                        className="flex items-center text-blue-600 hover:text-blue-900 text-sm"
                        title="View freelancer details"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Details
                      </Link>
                    )}
                    
                    {suggestion.freelancer_id?._id && (
                      <button
                        onClick={() => handleAssignProject(suggestion.freelancer_id._id)}
                        disabled={
                          project.status === "assigned" ||
                          assigning[suggestion.freelancer_id._id]
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {assigning[suggestion.freelancer_id._id]
                          ? "Assigning..."
                          : "Assign"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {project.ai_suggested_freelancers.map((suggestion, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {suggestion.freelancer_id?.user_id?.email || "N/A"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {suggestion.freelancer_id?.user_id
                          ? `${suggestion.freelancer_id.user_id.first_name} ${suggestion.freelancer_id.user_id.last_name}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {suggestion.score ? (suggestion.score * 100).toFixed(1) + "%" : "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {suggestion.reason || "N/A"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        {suggestion.freelancer_id?._id && (
                          <Link
                            to={`/freelancer/${suggestion.freelancer_id._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="View freelancer details"
                          >
                            Details
                          </Link>
                        )}
                        
                        {suggestion.freelancer_id?._id && (
                          <button
                            onClick={() => handleAssignProject(suggestion.freelancer_id._id)}
                            disabled={
                              project.status === "assigned" ||
                              assigning[suggestion.freelancer_id._id]
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {assigning[suggestion.freelancer_id._id]
                              ? "Assigning..."
                              : "Assign"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default ProjectDetails;