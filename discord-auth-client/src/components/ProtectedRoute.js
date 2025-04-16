import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("discord_token");

  useEffect(() => {
    console.log("ProtectedRoute mounted");
    console.log("Token:", token);
  }, [token]);

  if (!token) {
    console.warn("No token found, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  console.log("Token found, rendering children");

  return children;
};

export default ProtectedRoute;
