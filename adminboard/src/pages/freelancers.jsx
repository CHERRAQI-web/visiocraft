import { useState, useEffect } from "react";
import { Search, UserPlus, Trash2, Mail, Globe, Briefcase, User, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import axios from 'axios';
import ConfirmationModal from "../components/confirmation.jsx";

const Freelancer = () => {
  // Component states
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const itemsPerPage = 2;
  
  // States for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [freelancerToDelete, setFreelancerToDelete] = useState(null);
  const [message, setMessage] = useState("");

  // Data fetching logic
  const fetchFreelancers = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page,
        limit: itemsPerPage,
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await axios.get(`https://backend-visiocraft-production.up.railway.app/api/freelancers?${params.toString()}`, {
        withCredentials: true,
      });

      console.log("API response:", response.data);

      if (response.data && response.data.freelancers && response.data.pagination) {
        setFreelancers(response.data.freelancers || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        throw new Error("Unexpected API response format.");
      }

    } catch (err) {
      console.error("Error fetching freelancers:", err.response || err);
      setError("Failed to load freelancers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers(currentPage, searchTerm);
  }, [currentPage]);

  // Debounced search effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchFreelancers(1, searchTerm);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Delete logic with Modal
  const handleDelete = (freelancerId) => {
    setFreelancerToDelete(freelancerId);
    setIsModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!freelancerToDelete) return;

    try {
      console.log("ID of freelancer to delete:", freelancerToDelete);
      await axios.delete(`https://backend-visiocraft-production.up.railway.app/api/freelancers/${freelancerToDelete}`, {
        withCredentials: true,
      });
      
      // If we're on the last page and there's only one item, go to previous page
      if (freelancers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchFreelancers(currentPage, searchTerm);
      }

      setMessage("Freelancer deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setFreelancerToDelete(null);
    } catch (error) {
      console.error("Error during deletion:", error);
      setError("Failed to delete freelancer.");
      setTimeout(() => setError(""), 5000);
      setIsModalOpen(false);
      setFreelancerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setFreelancerToDelete(null);
  };

  // Pagination/search manipulation functions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Helper function to extract skill names
  const getSkillNames = (skills) => {
    if (!skills || skills.length === 0) return [];
    
    // If skills are objects with a 'name' property
    if (typeof skills[0] === 'object' && skills[0].name) {
      return skills.map(skill => skill.name);
    }
    
    // If skills are already strings
    return skills;
  };

  // Helper function to get freelancer name
const getFreelancerName = (freelancer) => {
  // The name is stored in the 'username' field
  return freelancer.username || "Unknown";
};

  // Helper function to get freelancer email
 const getFreelancerEmail = (freelancer) => {
  // Try different possible paths to the email
  if (freelancer.email) {
    return freelancer.email;
  }
  if (freelancer.user_id?.email) {
    return freelancer.user_id.email;
  }
  return "No email";
};
const getPortfolioUrl = (freelancer) => {
  // The portfolio URL is in the 'portfolio' field
  return freelancer.portfolio || null;
};
  // Component rendering
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Confirmation"
        message="Are you sure you want to delete this freelancer? This action is irreversible."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
          Freelancer Management
        </h1>
        <Link to="/form_freelancer" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Freelancer
        </Link>
      </div>

      {/* Success/error message */}
      {message && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-md mb-6 transition-opacity duration-300">
          {message}
        </div>
      )}

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, email or skills..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3 pe-10 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
        </div>
      </div>

      {/* Loading and error states */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading freelancers...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Freelancers display */}
      {!loading && !error && (
        <>
          {/* Cards for mobile */}
          <div className="block md:hidden space-y-4">
            {freelancers.length > 0 ? (
              freelancers.map((freelancer) => (
                <div key={freelancer._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  {/* Card header with name and actions */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getFreelancerName(freelancer)}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {getFreelancerEmail(freelancer)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/freelancer/${freelancer._id}`} className="text-blue-600 hover:text-blue-800" title="View details">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(freelancer._id)} className="text-red-600 hover:text-red-800" title="Delete freelancer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Portfolio */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Portfolio</p>
                    {freelancer.portfolio_url ? (
                      <a href={getPortfolioUrl(freelancer)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        View portfolio
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Not specified</span>
                    )}
                  </div>
                  
                  {/* Skills */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {getSkillNames(freelancer.skills).map((skillName, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{skillName}</span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bio</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{freelancer.bio || "No bio available"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No freelancers found.</div>
            )}
          </div>

          {/* Table for desktop */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {freelancers.length > 0 ? (
                  freelancers.map((freelancer) => (
                    <tr key={freelancer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-sky-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{getFreelancerName(freelancer)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getFreelancerEmail(freelancer)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {freelancer.portfolio ? (
                          <a href={freelancer.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View portfolio</a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {getSkillNames(freelancer.skills).map((skillName, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{skillName}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={freelancer.bio}>{freelancer.bio}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-1">   <Link to={`/freelancer/${freelancer._id}`} className="text-blue-600 hover:text-blue-800 mr-3" title="View details">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(freelancer._id)} className="text-red-600 hover:text-red-900" title="Delete freelancer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No freelancers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Styled Design */}
          {freelancers.length > 0 && totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600 mb-4 md:mb-0 font-medium">
                Showing 
                <span className="text-gray-900 font-semibold ml-1">{((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}</span>
                {' '}of <span className="text-sky-600 font-semibold">{totalItems}</span> freelancers
              </span>
              
              <div className="inline-flex rounded-lg shadow-md overflow-hidden border border-gray-300">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1} 
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                  aria-label="Previous page"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg> 
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm font-bold text-white bg-sky-500 border-l border-r border-sky-500 z-10">
                  Page {currentPage} / {totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages} 
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                  aria-label="Next page"
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Freelancer;