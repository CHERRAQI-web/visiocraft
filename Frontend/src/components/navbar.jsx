import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  IconChevronDown,
  IconUser,
  IconLogout,
  IconDashboard,
  IconMenu2,
  IconX,
  IconBook,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  Menu,
  Avatar,
  Text,
  Group,
  UnstyledButton,
  Alert,
} from "@mantine/core";
import { User, Briefcase, PenTool, Laptop, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout as reduxLogout, setAuthenticated } from "../store/authSlice";
import {
  isAuthenticated,
  logout as performLogout,
  redirectToAppWithToken,
} from "../utils/auth.jsx";
import axios from "axios";
const BASE_URL = "https://backend-visiocraft-production.up.railway.app/api";
const AXIOS_CONFIG = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
};
const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated: isReduxAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [authChecked, setAuthChecked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLogout, setShouldLogout] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  // Fonction pour récupérer les données utilisateur avec useCallback
  const fetchUser = useCallback(async () => {
    try {
      setAuthChecked(false);
      const userData = await isAuthenticated();

      if (userData) {
        dispatch(
          setAuthenticated({
            user: userData,
            token: localStorage.getItem("token"),
          })
        );
      } else {
        dispatch(reduxLogout());
      }
    } catch (error) {
      console.error("Erreur de vérification d'auth:", error);
      dispatch(reduxLogout());
    } finally {
      setAuthChecked(true);
    }
  }, [dispatch]);

  // useEffect pour la vérification initiale et l'écouteur d'événement
  useEffect(() => {
    fetchUser();
    window.addEventListener("userLoggedIn", fetchUser);

    return () => {
      window.removeEventListener("userLoggedIn", fetchUser);
    };
  }, [fetchUser]);

  // Synchronisation de la déconnexion sur plusieurs onglets
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "logout") {
        console.log("Déconnexion synchronisée depuis un autre onglet.");
        dispatch(reduxLogout());
        if (window.location.pathname !== "/login") {
          navigate("/login");
        }
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, [dispatch, navigate]);

  // useEffect pour gérer la déconnexion
  useEffect(() => {
    if (shouldLogout) {
      const executeLogout = async () => {
        try {
          setIsOpen(false);
          await performLogout();
          dispatch(reduxLogout());
          navigate("/login");
        } catch (error) {
          console.error("Erreur lors de la déconnexion:", error);
        } finally {
          setShouldLogout(false);
        }
      };

      executeLogout();
    }
  }, [shouldLogout, dispatch, navigate]);

  // Fonction pour déclencher la déconnexion
  const handleLogout = () => {
    setShouldLogout(true);
  };
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
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);


    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    
    if (token) {
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify(user));
          console.log('User data saved to localStorage');
        } catch (e) {
          console.error('Error parsing user data', e);
        }
      }

      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []); 
  // Fonctions utilitaires pour afficher les infos de l'utilisateur
  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.first_name || user.user_id?.first_name;
    const lastName = user.last_name || user.user_id?.last_name;
    const username = user.username || user.user_id?.username;
    const email = user.email || user.user_id?.email;
    if (firstName && lastName)
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (username)
      return username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    if (email) return email.charAt(0).toUpperCase();
    return "U";
  };

  const getUserName = () => {
    if (!user) return "User";
    const firstName = user.first_name || user.user_id?.first_name;
    const lastName = user.last_name || user.user_id?.last_name;
    const username = user.username || user.user_id?.username;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (username) return username;
    return user.email || user.user_id?.email || "User";
  };

  const getUserEmail = () => user?.email || user?.user_id?.email || "N/A";
  const getUserRole = () => {
    if (!user) return null;
    return user.role || user.user_id?.role;
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (!authChecked) {
    return (
      <div className="bg-sky-600 shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-extrabold text-white tracking-wider"
              >
                Visio<span className="text-teal-200">Craft</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-white bg-opacity-20 h-8 w-8 rounded-full"></div>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="bg-sky-600 shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-extrabold text-white tracking-wider"
            >
              Visio<span className="text-teal-200">Craft</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:text-teal-200"
            >
              Home
            </Link>
            {/* <Link to="/services" className="text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:text-teal-200">Services</Link> */}
            <Link
              to="/contact"
              className="text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 hover:text-teal-200"
            >
              Contact
            </Link>

            {isReduxAuthenticated && user ? (
              <Menu position="bottom-end" withArrow shadow="md">
                <Menu.Target>
                  <UnstyledButton className="p-1 rounded-full transition-all duration-200 hover:bg-gray-100">
                    <Group spacing="sm">
                      <Avatar
                        radius="xl"
                        style={{ backgroundColor: "#81E6D9", text: "white" }}
                        className="w-8 h-8 bg-tel-200 flex items-center justify-center font-bold text-white"
                      >
                        {getUserInitials()}
                      </Avatar>
                      <div className="hidden lg:block">
                        <Text
                          size="sm"
                          fw={500}
                          style={{ color: "white" }}
                          className="text-white"
                        >
                          {getUserName()}
                        </Text>
                      </div>
                      <IconChevronDown
                        size={14}
                        stroke={1.5}
                        className="text-white"
                      />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown className="bg-white border border-gray-200 rounded-lg shadow-xl p-1">
                  <Menu.Label className="text-gray-500 border-b border-gray-100 pb-2 mb-1">
                    Logged in as:
                    <Text
                      fw={600}
                      size="sm"
                      className="text-violet-600 truncate"
                    >
                      {getUserEmail()}
                    </Text>
                  </Menu.Label>
                  {getUserRole() === "Admin" && (
                    <Menu.Item
                      onClick={() =>
                        redirectToAppWithToken(
                          "admin-five-pearl.vercel.app",
                          localStorage.getItem("token")
                        )
                      }
                      icon={
                        <IconDashboard size={18} className="text-teal-200" />
                      }
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Admin Dashboard
                    </Menu.Item>
                  )}
                  {getUserRole() === "Freelancer" && (
                    <Menu.Item
                      onClick={() =>
                        redirectToAppWithToken(
                          "https://freelancer-visiocraft.vercel.app/",
                          localStorage.getItem("token")
                        )
                      }
                      icon={
                        <IconDashboard size={18} className="text-teal-200" />
                      }
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Freelancer Dashboard
                    </Menu.Item>
                  )}
                  {getUserRole() === "Client" && (
                    <Menu.Item
                      onClick={() =>
                        redirectToAppWithToken(
                          "https://client-visiocraft.vercel.app/",
                          localStorage.getItem("token")
                        )
                      }
                      icon={
                        <IconDashboard size={18} className="text-violet-500" />
                      }
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Client Dashboard
                    </Menu.Item>
                  )}
                  <Menu.Item
                    onClick={handleLogout}
                    icon={<IconLogout size={18} className="text-red-500" />}
                    className="text-red-600 rounded-md transition-colors duration-200 hover:bg-red-50"
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mr-4 bg-teal-200 text-sky-600 px-4 py-2 rounded-md text-sm font-bold transition-transform transform hover:scale-105 hover:text-sky-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-sky-600 px-4 py-2 rounded-md text-sm font-medium border border-sky-600 transition-transform transform hover:scale-105"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-teal-200 hover:bg-sky-700"
              aria-expanded="false"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <IconX className="block h-6 w-6" />
              ) : (
                <IconMenu2 className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-sky-600 shadow-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex flex-col space-y-2 pb-3 border-b border-sky-500">
              <Link
                to="/"
                className="text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              {/* <Link to="/services" className="text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700" onClick={() => setIsOpen(false)}>Services</Link> */}
              <Link
                to="/contact"
                className="text-white px-3 py-2 rounded-md text-base font-medium hover:bg-sky-700"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>

            {!isReduxAuthenticated && (
              <div className="pt-3 border-t border-sky-500 space-y-2">
                <Link
                  to="/login"
                  className="flex justify-center bg-teal-200 text-sky-600 px-3 py-2 rounded-md text-base font-medium hover:bg-teal-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex justify-center bg-white text-sky-600 px-3 py-2 rounded-md text-base font-medium border border-sky-600 hover:bg-sky-50"
                  onClick={() => setIsOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}

            {isReduxAuthenticated && (
              <div className="pt-3 border-t border-sky-500">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <Avatar
                      radius="xl"
                      style={{ backgroundColor: "#81E6D9", text: "white" }}
                      className="w-10 h-10 flex items-center justify-center font-bold text-white"
                    >
                      {getUserInitials()}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500} className="text-white">
                        {getUserName()}
                      </Text>
                      <Text size="xs" className="text-teal-200">
                        {getUserEmail()}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  {getUserRole() === "Admin" && (
                    <Menu.Item
                      onClick={() =>
                        redirectToAppWithToken(
                          "admin-five-pearl.vercel.app/",
                          localStorage.getItem("token")
                        )
                      }
                      icon={
                        <IconDashboard size={18} className="text-teal-200" />
                      }
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Admin Dashboard
                    </Menu.Item>
                  )}
                  {getUserRole() === "Freelancer" && (
                    <Menu.Item
                      onClick={() =>
                        redirectToAppWithToken(
                          "https://freelancer-visiocraft.vercel.app/",
                          localStorage.getItem("token")
                        )
                      }
                      icon={
                        <IconDashboard size={18} className="text-teal-200" />
                      }
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Freelancer Dashboard
                    </Menu.Item>
                  )}
                  {getUserRole() === "Client" && (
                    <Menu.Item
                      onClick={() =>
                        redirectToAppWithToken(
                          "https://client-visiocraft.vercel.app/",
                          localStorage.getItem("token")
                        )
                      }
                      icon={
                        <IconDashboard size={18} className="text-violet-500" />
                      }
                      className="text-gray-700 rounded-md transition-colors duration-200 hover:bg-violet-50 hover:text-violet-600"
                    >
                      Client Dashboard
                    </Menu.Item>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left text-red-300 px-3 py-2 rounded-md text-base font-medium hover:bg-red-600 hover:text-white flex items-center space-x-2"
                  >
                    <IconLogout size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
