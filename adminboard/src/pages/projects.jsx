import { useState, useMemo, useEffect } from "react";
import { Search, UserPlus, Trash2, Calendar, DollarSign, User, Eye, MoreHorizontal, Edit, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import axios from 'axios';
import ConfirmationModal from '../components/confirmation.jsx'

const ProjectManagement = () => {
  // Component states
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const itemsPerPage = 5;

  // States for modal management and project deletion
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [message, setMessage] = useState(""); // For success messages

  // Data fetching logic
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        // Add status filter to API request
        if (filterStatus !== 'all') {
          params.append('status', filterStatus);
        }

        const response = await axios.get(`http://backend-visiocraft-production.up.railway.app/api/projects/all?${params}`, {
          withCredentials: true,
        });

        if (response.data && response.data.projects) {
          setProjects(response.data.projects);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalItems(response.data.pagination?.totalItems || 0);
        } else {
          setProjects(response.data || []);
        }
      } catch (err) {
        console.error("Error fetching projects:", err.response || err);
        if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to load projects. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refreshKey, currentPage, searchTerm, filterStatus]);

  const refreshProjects = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Data manipulation functions
  const handleDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await axios.delete(`http://backend-visiocraft-production.up.railway.app/api/projects/${projectToDelete}`, {
        withCredentials: true,
      });

      setMessage("Project deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setProjectToDelete(null);
      refreshProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project.");
      setTimeout(() => setError(""), 5000);
      setIsModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setProjectToDelete(null);
  };

  // Helper functions
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'pending_assignment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_assignment': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'in_review': return 'Review';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getClientName = (project) => {
    if (!project.client_id) return 'N/A';
    if (typeof project.client_id === 'object') {
      return project.client_id.company_name || 
             (project.client_id.first_name && project.client_id.last_name ? 
               `${project.client_id.first_name} ${project.client_id.last_name}` : 
               'N/A');
    } else {
      return 'N/A';
    }
  };

  // Mobile-friendly card view for projects
  const ProjectCard = ({ project }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base font-semibold text-gray-900 pr-2">
          {project.title || project.project_details}
        </h3>
        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusClass(project.status)}`}>
          {getStatusText(project.status)}
        </span>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <User size={16} className="mr-2 text-gray-400" />
          <span>Client: {getClientName(project)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign size={16} className="mr-2 text-gray-400" />
          <span>Budget: {project.client_initial_budget ? `$${project.client_initial_budget.toLocaleString()}` : 'N/A'}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="mr-2 text-gray-400" />
          <span>Deadline: {formatDate(project.deadline_date)}</span>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Link
          to={`/projects/${project._id}`}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Link>
        <Link
          to={`/projects/${project._id}/edit/`}
          className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this project?"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Project Management</h1>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'card' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
            >
              Card
            </button>
          </div>
          <Link to="/form_project" className="w-full sm:w-auto">
            <button className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors">
              <UserPlus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <section className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Filter size={18} className="text-gray-500 mr-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending_assignment">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Success or error messages */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
          <button onClick={refreshProjects} className="ml-4 underline">Try Again</button>
        </div>
      )}

      {/* Loading and error states display */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      )}

      {/* Projects display - Table for desktop, Cards for mobile */}
      {!loading && !error && (
        <>
          {/* Table view for desktop */}
          {viewMode === 'table' && (
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project / Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <tr key={project._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={project.title || project.project_details}>
                              {project.title || project.project_details}
                            </p>
                            <p className="text-xs text-gray-500">
                              Client: {getClientName(project)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.client_initial_budget ? `$${project.client_initial_budget.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(project.deadline_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">
                            <Link
                              to={`/projects/${project._id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                           
                            <button 
                              onClick={() => handleDeleteProject(project._id)} 
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete Project"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        {searchTerm || filterStatus !== 'all' ? 'No projects found for these criteria.' : 'No projects found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Card view for mobile and as an alternative view */}
          {(viewMode === 'card' || viewMode === 'table') && (
            <div className={`${viewMode === 'table' ? 'md:hidden' : ''}`}>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectCard key={project._id} project={project} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || filterStatus !== 'all' ? 'No projects found for these criteria.' : 'No projects found.'}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} projects
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;