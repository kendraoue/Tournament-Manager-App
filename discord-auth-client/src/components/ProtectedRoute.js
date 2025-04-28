import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("discord_token");
  console.log("ProtectedRoute token:", token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check for token expiration
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("discord_token");
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    localStorage.removeItem("discord_token");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
