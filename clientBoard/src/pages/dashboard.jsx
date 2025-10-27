import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { Layers, Loader, Clock, CheckSquare, Filter, Search, Calendar, TrendingUp, User, DollarSign, FileText, ChevronRight, X, Menu, AlertCircle } from 'lucide-react';

// Function to format date more nicely
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to get status styling for LIGHT Mode
const getStatusStyle = (status) => {
    switch (status) {
      // Light mode colors: darker text, very light background, subtle border
      case 'pending_assignment': return 'text-gray-800 bg-gray-100 border-gray-300';
      case 'assigned': return 'text-purple-800 bg-purple-100 border-purple-300';
      case 'in-progress': return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      case 'review': return 'text-blue-800 bg-blue-100 border-blue-300';
      case 'completed': return 'text-green-800 bg-green-100 border-green-300';
      case 'cancelled': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-200 border-gray-400';
    }
};

// --- 1. Helper Component: StatCard ---
const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className={`p-5 rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl ${color} border-gray-300 hover:border-sky-500`}>
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center">
          <span className="text-4xl mr-3">{icon}</span>
          <p className="text-sm font-semibold text-sky-600 uppercase">{title}</p>
        </div>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-medium ${trendValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue > 0 ? '+' : ''}{trendValue}% 
              <TrendingUp className={`inline w-3 h-3 ml-1 ${trendValue > 0 ? '' : 'rotate-180'}`} />
            </span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// --- 2. Helper Component: ProjectCard (Mobile-friendly) ---
const ProjectCard = ({ project, onDelete, onStatusChange }) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Status indicator bar */}
      <div 
        className={`h-2 ${getStatusStyle(project.status).split(' ')[1]}`}
      ></div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-2">
            {project.title || 'Untitled Project'}
          </h3>
       
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {project.project_details || project.description || 'No description provided.'}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Created: {formatDate(project.createdAt)}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(project.status)}`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>
        
   
      </div>
    </div>
  );
};

// --- 3. Main Component: Dashboard ---

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch projects on mount and when refreshKey changes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Attempting to fetch projects (with HttpOnly cookie)...");

        const response = await axios.get('https://backend-visiocraft-production.up.railway.app/api/projects', {
          withCredentials: true,
        });

        console.log("API response received:", response.data);
        
        // Check if response has the expected structure
        if (response.data && response.data.projects) {
          setProjects(response.data.projects);
          // Use stats from API if available
          if (response.data.stats) {
            setStats(response.data.stats);
          }
        } else {
          // Fallback for older API response format
          setProjects(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Error fetching projects:", err.response || err);

        if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
          window.location.href = "/login";
        } else {
          setError("Failed to fetch projects. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refreshKey]);

  // Refresh projects when needed
  const refreshProjects = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Filter projects based on status and search term
  const filteredProjects = useMemo(() => {
    // Ensure projects is an array before filtering
    if (!Array.isArray(projects)) return [];
    
    return projects.filter(p => {
      const details = p.project_details || ''; 
      const name = p.name || '';
      
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesSearch = details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              name.toLowerCase().includes(searchTerm.toLowerCase());
                              
      return matchesStatus && matchesSearch;
    });
  }, [projects, filterStatus, searchTerm]);

  // Handle status change
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      // Optimistic update
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p._id === projectId ? { ...p, status: newStatus } : p
        )
      );
      
      // Update stats if we have them from API
      setStats(prevStats => {
        const oldStatus = projects.find(p => p._id === projectId)?.status;
        if (!oldStatus) return prevStats;
        
        const newStats = { ...prevStats };
        
        // Decrement old status count
        switch(oldStatus) {
          case 'pending_assignment': newStats.pending = Math.max(0, newStats.pending - 1); break;
          case 'assigned': newStats.assigned = Math.max(0, newStats.assigned - 1); break;
          case 'in-progress': newStats.inProgress = Math.max(0, newStats.inProgress - 1); break;
          case 'review': newStats.review = Math.max(0, newStats.review - 1); break;
          case 'completed': newStats.completed = Math.max(0, newStats.completed - 1); break;
          case 'cancelled': newStats.cancelled = Math.max(0, newStats.cancelled - 1); break;
        }
        
        // Increment new status count
        switch(newStatus) {
          case 'pending_assignment': newStats.pending += 1; break;
          case 'assigned': newStats.assigned += 1; break;
          case 'in-progress': newStats.inProgress += 1; break;
          case 'review': newStats.review += 1; break;
          case 'completed': newStats.completed += 1; break;
          case 'cancelled': newStats.cancelled += 1; break;
        }
        
        return newStats;
      });
      
      await axios.put(`https://backend-visiocraft-production.up.railway.app/api/projects/${projectId}`, { status: newStatus });
    } catch (error) {
      setError("Failed to update project status. Refreshing data...");
      console.error("Update error:", error);
      refreshProjects();
    }
  };

  // Handle project deletion
  // const deleteProject = async (projectId) => {
  //   if (!window.confirm("Are you sure you want to delete this project?")) return;
    
  //   try {
  //     const projectToDelete = projects.find(p => p._id === projectId);
      
  //     setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
      
  //     // Update stats if we have them from API
  //     if (projectToDelete) {
  //       setStats(prevStats => {
  //         const newStats = { ...prevStats };
  //         newStats.total = Math.max(0, newStats.total - 1);
          
  //         // Decrement status count
  //         switch(projectToDelete.status) {
  //           case 'pending_assignment': newStats.pending = Math.max(0, newStats.pending - 1); break;
  //           case 'assigned': newStats.assigned = Math.max(0, newStats.assigned - 1); break;
  //           case 'in-progress': newStats.inProgress = Math.max(0, newStats.inProgress - 1); break;
  //           case 'review': newStats.review = Math.max(0, newStats.review - 1); break;
  //           case 'completed': newStats.completed = Math.max(0, newStats.completed - 1); break;
  //           case 'cancelled': newStats.cancelled = Math.max(0, newStats.cancelled - 1); break;
  //         }
          
  //         return newStats;
  //       });
  //     }
      
  //     await axios.delete(`https://backend-visiocraft-production.up.railway.app/api/projects/${projectId}`);
  //   } catch (error) {
  //     setError("Failed to delete project. Refreshing data...");
  //     console.error("Delete error:", error);
  //     refreshProjects();
  //   }
  // };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-8">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border-red-500 border">
          <div className="text-red-600 text-3xl mb-4 font-bold">Error 😔</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={refreshProjects}
            className="mt-4 px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-colors"
          >
            Retry Fetching Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Updated to include all status types */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard 
            title="Total Projects" 
            value={stats.total} 
            icon={<Layers size={24} color="#0EA5E9" />}
            color="bg-white" 
          /> 
          <StatCard 
            title="Pending" 
            value={stats.pending} 
            icon={<AlertCircle size={24} color="#6B7280" />}
            color="bg-white" 
          />
          <StatCard 
            title="Assigned" 
            value={stats.assigned} 
            icon={<User size={24} color="#8B5CF6" />}
            color="bg-white" 
          />
          <StatCard 
            title="In Progress" 
            value={stats.inProgress} 
            icon={<Loader size={24} color="#F59E0B" />}
            color="bg-white" 
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={<CheckSquare size={24} color="#10B981" />}
            color="bg-white" 
            trend={true}
            trendValue={12}
          />
          <StatCard 
            title="Cancelled" 
            value={stats.cancelled} 
            icon={<X size={24} color="#EF4444" />}
            color="bg-white" 
          />
        </section>

        {/* Search and Filter Section */}
        <section className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
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
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Projects ({filteredProjects.length})
          </h2>
       
        </div>

        {/* Projects List */}
        <section>
          {filteredProjects.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project._id} 
                  project={project}
                  
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Get started by creating a new project'
                }
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1h1a1 1 0 110 2h-1a1 1 0 01-1-1V4a1 1 0 011-1zM10 15a1 1 0 011 1v1h1a1 1 0 110 2h-1a1 1 0 01-1-1v-1a1 1 0 011-1zM12 7a1 1 0 011 1v1h1a1 1 0 110 2h-1a1 1 0 01-1-1V8a1 1 0 011-1zM12 15a1 1 0 011 1v1h1a1 1 0 110 2h-1a1 1 0 01-1-1v-1a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Project
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;