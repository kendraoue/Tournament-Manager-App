import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [authUrl, setAuthUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
    const REDIRECT_URI = process.env.REACT_APP_FRONTEND_URL;
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    const SCOPE = "identify";
    const RESPONSE_TYPE = "code";

    if (!CLIENT_ID || !REDIRECT_URI) {
      console.error("Missing environment variables: CLIENT_ID or REDIRECT_URI");
      return;
    }

    // Generate the Discord OAuth2 authorization URL
    setAuthUrl(
      `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`
    );

    // Check if there's a token in localStorage, if so, navigate to the dashboard
    const token = localStorage.getItem("discord_token");
    if (token) {
      navigate("/dashboard");
    }

    // Check for OAuth code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      console.log("Authorization Code received:", code);
      fetchToken(code, BACKEND_URL);
    }
  }, [navigate]);

  const fetchToken = async (code, BACKEND_URL) => {
    try {
      console.log("Sending code to backend:", code);
      const response = await fetch(`${BACKEND_URL}/auth/getToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("discord_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        console.error("Failed to obtain token:", data);
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Naraka Tournament!
        </h1>
        <p className="text-gray-400 mb-6">
          Please log in with Discord to access the tournament registration form.
        </p>
        <a href={authUrl}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
            Login with Discord
          </button>
        </a>
      </div>
    </div>
  );
};

export default Login;
