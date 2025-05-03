import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Tournament from "./components/Tournament";

function App() {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('cached_user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [userTeam, setUserTeam] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("discord_token");
    if (!token) return;

    // Only fetch if we don't have cached data
    if (!user) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getMe`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((userData) => {
          const userInfo = {
            discordId: userData.discordId,
            discordName: userData.username,
            avatar: userData.avatar,
            email: userData.email,
          };
          setUser(userInfo);
          // Cache the user data
          localStorage.setItem('cached_user', JSON.stringify(userInfo));
        });
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("discord_token");
    if (!token) {
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams`);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Route for login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Route for dashboard and nested routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <AppShell
                user={user}
                userTeam={userTeam}
                setUserTeam={setUserTeam}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard user={user} />} />
          <Route path="profile" element={<Profile user={user} />} />
          <Route path="tournament" element={<Tournament />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
