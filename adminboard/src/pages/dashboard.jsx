import DailyCalendar from "../components/calendrie.jsx";
import { useState, useMemo, useEffect } from "react";
import StatCard from '../components/StatCard.jsx';
import axios from 'axios';
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Calendar, DollarSign, Clock, Briefcase, Users, UserCheck } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
  // --- Component States ---
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 3;

  // --- States for Global Statistics ---
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    totalClients: 0,
    totalFreelancers: 0,
    urgentProjects: 0,
    statusCounts: {}
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // --- Logic to Fetch Global Statistics ---
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const response = await axios.get(`https://backend-visiocraft-production.up.railway.app/api/stats`, {
          withCredentials: true,
        });
        setDashboardStats(response.data);
      } catch (err) {
        console.error("Error fetching global statistics:", err);
        setStatsError("Failed to load statistics.");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // --- Logic to Fetch Project Data ---
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

        params.append('status', 'pending_assignment');

        const response = await axios.get(`https://backend-visiocraft-production.up.railway.app/api/projects/all?${params}`, {
          withCredentials: true,
        });

        if (response.data && response.data.projects) {
          setProjects(response.data.projects);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalItems(response.data.pagination?.totalItems || 0);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage, searchTerm]);

  // --- Prepare data for the status chart (UPDATED FOR LINE CHART) ---
  const statusChartData = useMemo(() => {
    const statusCounts = dashboardStats.statusCounts || {};
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const colors = [
        'rgb(251, 146, 60)',  // Orange
        'rgb(59, 130, 246)',   // Blue
        'rgb(34, 197, 94)',    // Green
        'rgb(239, 68, 68)',    // Red
        'rgb(168, 85, 247)',   // Purple
        'rgb(236, 72, 153)',   // Pink
    ];

    return {
        labels: labels.map(status => status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
        datasets: [
            {
                label: 'Number of Projects',
                data: data,
                borderColor: colors.slice(0, data.length),
                backgroundColor: colors.slice(0, data.length).map(color => color.replace('rgb', 'rgba').replace(')', ', 0.2)')),
                borderWidth: 2,
                tension: 0.1,
                fill: true,
            },
        ],
    };
  }, [dashboardStats.statusCounts]);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
     

      {/* --- General Statistics Section --- */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">General Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard title="Projects" value={dashboardStats.totalProjects} icon={<Briefcase className="w-5 h-5 md:w-6 md:h-6" />} color="bg-purple-500" />
            <StatCard title="Clients" value={dashboardStats.totalClients} icon={<Users className="w-5 h-5 md:w-6 md:h-6" />} color="bg-teal-500" />
            <StatCard title="Freelancers" value={dashboardStats.totalFreelancers} icon={<UserCheck className="w-5 h-5 md:w-6 md:h-6" />} color="bg-indigo-500" />
            <StatCard title="Urgent" value={dashboardStats.urgentProjects} icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />} color="bg-red-500" />
        </div>
        {statsError && <p className="text-red-500 text-sm mt-2">{statsError}</p>}
      </section>

      {/* Main Content: Table and Calendar/Chart Sidebar */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section with the table */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-md">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Pending Projects</h2>
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search for a project..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Projects table */}
          {!loading && !error && (
            <>
              {/* Mobile card view */}
              <div className="block md:hidden">
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project._id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900 text-sm truncate pr-2">
                            {project.project_details}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {project.deadline_date ? new Date(project.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          Client: {project.client_id?.company_name || `${project.client_id?.user_id?.first_name} ${project.client_id?.user_id?.last_name}` || 'N/A'}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {project.client_initial_budget ? `${project.client_initial_budget.toLocaleString()} €` : 'N/A'}
                          </span>
                          <Link to={`/projects/${project._id}`} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No projects found for this search.' : 'No projects pending assignment.'}
                  </div>
                )}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project / Client</th>
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
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={project.project_details}>
                                {project.project_details}
                              </p>
                              <p className="text-xs text-gray-500">
                                Client: {project.client_id?.company_name || `${project.client_id?.user_id?.first_name} ${project.client_id?.user_id?.last_name}` || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.client_initial_budget ? `${project.client_initial_budget.toLocaleString()} €` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project.deadline_date ? new Date(project.deadline_date).toLocaleDateString('en-US') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/projects/${project._id}`} className="text-blue-600 hover:text-blue-900" title="View details">Details</Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          {searchTerm ? 'No projects found for this search.' : 'No projects pending assignment.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} projects
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 flex items-center">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">Page {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 flex items-center">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar with Calendar and Chart */}
        <div className="space-y-6">
            {/* <div className="bg-white rounded-xl shadow-xl p-4">
                <DailyCalendar />
            </div> */}
            <div className="bg-white rounded-xl shadow-xl p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Projects by Status</h2>
                {statsLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="h-64">
                        <Line 
                            data={statusChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;