import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Paper,
  Title,
  Text,
  Anchor,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconMail,
  IconLock,
  IconLogin,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import axios from "axios";
import { setAuthenticated } from "../store/authSlice.js";
import { useDispatch } from "react-redux";
import { FaGoogle } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    if (!email || !password) {
      setMessage("Please fill in all the fields.");
      setMessageType("error");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      console.log("Data sent:", { email, password }); // Log the data being sent

      const response = await axios.post(
        "https://backend-visiocraft-production.up.railway.app/api/auth/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem('token', token); // Ensure to store the token
      dispatch(setAuthenticated({ token, user }));
      window.dispatchEvent(new Event("userLoggedIn"));
      
      setMessage("Login successful! Redirecting...");
      setMessageType("success");

      setTimeout(() => {
        if (user.role === "Client") {
          window.location.href = "https://client-visiocraft.vercel.app/";
        } else if(user.role === "Admin") {
            window.location.href = "https://admin-five-pearl.vercel.app/";
        }else if(user.role === "Freelancer"){
            window.location.href = "https://freelancer-two-tau.vercel.app/";

        }else{
          navigate("/");
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      setMessageType("error");
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const response = await axios.get("https://backend-visiocraft-production.up.railway.app/api/auth/google/auth-url");
      window.location.href = response.data.authUrl; // Redirige vers l'URL d'authentification Google
    } catch (err) {
      setError("Failed to connect to Google. Please try again.");
      setIsAuthenticating(false);
    }
  };
  // The rest of your JSX component remains the same...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <Paper
        className="w-full max-w-md p-8 sm:p-12 shadow-2xl rounded-xl bg-white border border-gray-100 relative"
        withBorder
        shadow="xl"
      >
        <LoadingOverlay visible={loading} overlayBlur={2} />

        <Title
          order={2}
          className="text-center font-extrabold tracking-tight text-gray-900 mb-2"
        >
          Log in to <span className="text-cyan-600">VisioCraft</span>
        </Title>
        <Text color="dimmed" size="sm" align="center" mt={5} mb={30}>
          New to the platform?{" "}
          <Anchor
            component={Link}
            to="/register"
            size="sm"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Create an account
          </Anchor>
        </Text>

        {message && (
          <Alert
            icon={
              messageType === "error" ? (
                <IconAlertCircle size={16} />
              ) : (
                <IconCheck size={16} />
              )
            }
            color={messageType === "error" ? "red" : "green"}
            mb={20}
          >
            {message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email Address"
            placeholder="your.email@example.com"
            required
            type="email"
            icon={<IconMail size={16} />}
            className="mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            styles={(theme) => ({
              input: { borderColor: theme.colors.gray[3] },
            })}
          />

          <PasswordInput
            label="Password"
            placeholder="Your secret password"
            required
            icon={<IconLock size={16} />}
            className="mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            styles={(theme) => ({
              input: { borderColor: theme.colors.gray[3] },
            })}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-300/50"
            leftSection={<IconLogin size={20} />}
          >
            Log in
          </Button>
           {/* Google Login button */}
              <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Or</p>
        </div>
   
        </form>
             {isAuthenticating ? (
          <div className="flex justify-center">
            <FaGoogle className="animate-spin h-6 w-6 text-teal-500" />
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="w-full p-3 bg-yellow-600 text-white rounded-md flex items-center justify-center"
          >
            <FaGoogle className="mr-2" />
            Sign in with Google
          </button>
        )}

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </Paper>
    </div>
  );
};

export default LoginPage;
