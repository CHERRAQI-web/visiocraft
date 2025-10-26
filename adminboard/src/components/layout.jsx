import { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  Avatar,
  Text,
  Group,
  UnstyledButton,
  Loader,
  Alert,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconDashboard,
  IconBook,
  IconAlertCircle,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import "./Sidebar.css";
import { isAuthenticated, logout } from "../utils/auth.jsx";
import { LogOut,Laptop,Briefcase } from "lucide-react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Changed default to true
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, keep sidebar open by default
      // On mobile, keep sidebar closed by default
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await isAuthenticated();
      if (userData) {
        setUser(userData);
        console.log("user id :", userData.user_id);
      } else {
        setUser(null);
        setError("You are not authenticated or your session has expired.");
      }
    } catch (error) {
      console.error("Error while checking authentication:", error);
      setUser(null);
      setError("Error while checking authentication.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    window.addEventListener("userLoggedIn", fetchUser);
    return () => window.removeEventListener("userLoggedIn", fetchUser);
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="max-w-md w-full p-6">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Access Denied"
            color="red"
            radius="md"
          >
            {error ||
              "You are not authenticated. Please log in to access this page."}
          </Alert>
          <div className="mt-4 text-center">
            <button
              onClick={logout}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Go back to login page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getUserRole = () => user.role || user.user_id?.role;
  if (getUserRole() !== "Admin") {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="max-w-md w-full p-6">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Access Denied"
            color="red"
            radius="md"
          >
            You do not have the necessary permissions to access this page.
          </Alert>
          <div className="mt-4 text-center">
            <button
              onClick={logout}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
            >
              Go back to login page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => logout();

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.first_name || user.user_id?.first_name;
    const lastName = user.last_name || user.user_id?.last_name;
    const email = user.email || user.user_id?.email;
    if (firstName && lastName)
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const getUserName = () => {
    if (!user) return "User";
    const firstName = user.first_name || user.user_id?.first_name;
    const lastName = user.last_name || user.user_id?.last_name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return user.email || user.user_id?.email || "User";
  };

  const getUserEmail = () => user?.email || user.user_id.email || "N/A";

  // Cleaned link component that uses the new CSS classes
  const SidebarLink = ({ to, icon: Icon, label, badge }) => (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-4 py-3 my-1 transition-all duration-200 rounded-lg ${
            isActive ? "link-active" : "link-inactive"
          }`
        }
        end={to === "/"}
      >
        <Icon size={20} className="flex-shrink-0" />
        {/* Always show the label when sidebar is open */}
        {isSidebarOpen && <span>{label}</span>}
        {/* Mobile hover tooltip - only show when sidebar is closed on mobile */}
        {isMobile && !isSidebarOpen && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            {label}
          </div>
        )}
      </NavLink>
    </li>
  );

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--main-bg)" }}
    >
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-sky-600 text-slate-300 transition-all duration-300 ease-in-out fixed md:sticky top-0 h-screen z-50 flex flex-col justify-between ${
          isSidebarOpen
            ? isMobile
              ? "w-64 left-0"
              : "w-64 left-0"
            : isMobile
            ? "w-64 -left-64"
            : "w-20 left-0"
        }`}
      >
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center p-4">
            {isSidebarOpen && (
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Visio<span className="text-teal-200">Craft</span>
              </h3>
            )}
            {/* Close button for mobile, toggle button for desktop */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-lg bg-sky-600 text-teal-200 hover:bg-white hover:text-sky-600 transition-all duration-200 transform hover:scale-110"
            >
              {isMobile ? (
                <IconX className="h-6 w-6" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transform transition-transform duration-300 ${
                    isSidebarOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              )}
            </button>
          </div>

            <ul className="px-3 mt-6">
              {" "}
              <SidebarLink
                to="/"
                icon={IconDashboard}
                label="Tableau de Bord"
              />{" "}
              <SidebarLink to="/Freelancer" icon={Laptop} label="Freelancer" />{" "}
              <SidebarLink to="/Client" icon={Briefcase} label="Client" />{" "}
              <SidebarLink to="/Projects" icon={IconBook} label="Projects" />{" "}
            </ul>
         
        </div>

        <div className="flex justify-between p-4 border-t border-sky-700 text-white">
          <UnstyledButton
            className="flex justify-between items-center w-full px-4 py-2 rounded-lg text-red-300 hover:bg-red-600 hover:text-white transition-all duration-200 transform hover:scale-105"
            onClick={handleLogout}
          >
            <div className="flex items-center text-white">
              <LogOut size={18} />
            </div>
            {isSidebarOpen && <Text className="text-white">Logout</Text>}
          </UnstyledButton>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile ? "ml-0" : isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <header className="bg-sky-600 flex items-center justify-between sticky shadow-sm border-b border-slate-200 top-0 z-10 px-6">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-white hover:bg-sky-500 transition-all duration-200 transform hover:scale-110 hover:rotate-12 mr-4"
            >
              <IconMenu2 className="h-6 w-6" />
            </button>
          )}

          <div className="px-9 py-4">
            <h1 className="text-xl font-semibold text-white">
              Hello, {getUserName()}
            </h1>
          </div>

          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <UnstyledButton className="flex items-center space-x-2 sm:space-x-4 hover:bg-sky-500 rounded-lg transition-all duration-300 p-1 transform hover:scale-105">
                <Group className="flex items-center space-x-2 sm:space-x-4">
                  <Avatar
                    radius="xl"
                    style={{ backgroundColor: "#81E6D9", text: "white" }}
                    className="w-10 h-10 flex items-center justify-center font-bold text-white hover:scale-110 transition-transform duration-200"
                  >
                    {getUserInitials()}
                  </Avatar>
                  {!isMobile && (
                    <div>
                      <Text
                        size="xs"
                        style={{ color: "white" }}
                        className="text-teal-200"
                      >
                        {getUserEmail()}
                      </Text>
                    </div>
                  )}
                </Group>
              </UnstyledButton>
            </Menu.Target>
          </Menu>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
