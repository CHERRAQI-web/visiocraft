import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBriefcase, FaClock, FaCheckCircle, FaEye, FaSpinner } from "react-icons/fa";
import api from "../utils/api";

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/projects');
        
        // Check if response.data is an array, otherwise try different properties
        let projectsData = [];
        if (Array.isArray(response.data)) {
          projectsData = response.data;
        } else if (response.data && Array.isArray(response.data.projects)) {
          projectsData = response.data.projects;
        } else if (response.data && Array.isArray(response.data.results)) {
          projectsData = response.data.results;
        }
        
        setProjects(projectsData);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Unable to load your projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  // Function to get status style class
  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'assigned': 'Assigned',
      'in_progress': 'In Progress',
      'in_review': 'In Review',
      'completed': 'Completed',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mr-3" />
        <p>Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  // Check if projects is an array before using it
  const activeProjects = Array.isArray(projects) ? projects.filter(p => p.status === 'in_progress' || p.status === 'assigned') : [];
  const completedProjects = Array.isArray(projects) ? projects.filter(p => p.status === 'completed') : [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Active projects section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaBriefcase className="mr-2 text-blue-500" />
            Active Projects
          </h2>
          {activeProjects.length > 0 ? (
            <ul className="space-y-3">
              {activeProjects.map(project => (
                <li key={project._id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                  <p className="font-medium text-gray-900">{project.title || project.project_details}</p>
                  <p className="text-sm text-gray-500">Client: {project.client_id?.company_name || 'N/A'}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">You don't have any active projects at the moment.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FaCheckCircle className="mr-2 text-green-500" />
            completed Project 
          </h2>
          {completedProjects.length > 0 ? (
            <ul className="space-y-3">
              {completedProjects.map(project => (
                <li key={project._id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded">
                  <p className="font-medium text-gray-900">{project.title || project.project_details}</p>
                  <p className="text-sm text-gray-500">Client: {project.client_id?.company_name || 'N/A'}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClass(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No projects pending validation.</p>
          )}
        </div>
      </div>

      {/* All projects section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">All Your Projects</h2>
          <Link to="/freelancer/projects" className="text-blue-600 hover:text-blue-800 text-sm">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(projects) && projects.map(project => (
                <tr key={project._id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.title || project.project_details.substring(0, 50) + '...'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {project.client_id?.company_name || 'N/A'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <Link to={`projects/project/${project._id}`} className="text-indigo-600 hover:text-indigo-900">
                      <FaEye className="inline w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!Array.isArray(projects) || projects.length === 0) && (
            <p className="text-center text-gray-500 py-4">You don't have any projects.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;