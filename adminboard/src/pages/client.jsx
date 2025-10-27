import { useState, useMemo, useEffect } from "react";
import { Search, UserPlus, Trash2, Mail, Building, User } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import ConfirmationModal from "../components/confirmation.jsx";

const Client = () => {
  // --- Component States ---
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // States for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [message, setMessage] = useState("");

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://backend-visiocraft-production.up.railway.app/api/clients", {
          withCredentials: true,
        });

        console.log("Clients API Response:", response.data);
        setClients(response.data || []);
      } catch (err) {
        console.error("Error fetching clients:", err.response || err);
        if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to load clients. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // --- Delete Logic with Modal ---
  const handleDeleteClient = (clientId) => {
    setClientToDelete(clientId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await axios.delete(
        `http://backend-visiocraft-production.up.railway.app/api/clients/${clientToDelete}`,
        {
          withCredentials: true,
        }
      );

      // Update local state for immediate UI update
      setClients((prevClients) =>
        prevClients.filter((c) => c._id !== clientToDelete)
      );

      setMessage("Client deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
      setIsModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error("Error during deletion:", error);
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Failed to delete client.");
      }
      setTimeout(() => setError(""), 5000);
      setIsModalOpen(false);
      setClientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setClientToDelete(null);
  };

  // --- Helper Functions ---
  const getClientName = (client) => {
    if (client.user_id) {
      return `${client.user_id.first_name} ${client.user_id.last_name}`;
    }
    return "Unknown";
  };

  const getClientEmail = (client) => {
    return client.user_id?.email || "No email";
  };

  // --- Filtering and Pagination Logic ---
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const name = getClientName(c);
      const email = getClientEmail(c);
      const company = c.company_name || "";

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [clients, searchTerm]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  // --- Component Render ---
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
          Client Management
        </h1>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-md mb-6 transition-opacity duration-300">
          {message}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, email or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3 pe-10 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading clients...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Clients Display */}
      {!loading && !error && (
        <>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {paginatedClients.length > 0 ? (
              paginatedClients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  {/* Card Header with name and actions */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getClientName(client)}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {getClientEmail(client)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteClient(client._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete client"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Company
                    </p>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {client.company_name || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No clients found.
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedClients.length > 0 ? (
                  paginatedClients.map((client) => (
                    <tr key={client._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-sky-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getClientName(client)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getClientEmail(client)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 max-w-xs truncate"
                          title={client.company_name}
                        >
                          {client.company_name || "Not specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClient(client._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No clients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 p-4 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600 mb-4 md:mb-0 font-medium">
                Showing
                <span className="text-gray-900 font-semibold ml-1">
                  {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredClients.length)}
                </span>{" "}
                of{" "}
                <span className="text-sky-600 font-semibold">
                  {filteredClients.length}
                </span>{" "}
                clients
              </span>

              <div className="inline-flex rounded-lg shadow-md overflow-hidden border border-gray-300">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    ></path>
                  </svg>
                  Previous
                </button>

                <span className="px-4 py-2 text-sm font-bold text-white bg-sky-500 border-l border-r border-sky-500 z-10">
                  Page {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                >
                  Next
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Confirmation"
        message="Are you sure you want to delete this client? This action is irreversible."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="error"
      />
    </div>
  );
};

export default Client;
