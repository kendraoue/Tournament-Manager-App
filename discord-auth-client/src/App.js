import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Tournament from "./components/Tournament";

function App() {
  const [user, setUser] = useState(null);
  const [userTeam, setUserTeam] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("discord_token");
    if (!token) {
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/getMe`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        setUser({
          discordId: userData.discordId,
          discordName: userData.username,
          avatar: userData.avatar,
          email: userData.email,
        });

        return fetch(`${process.env.REACT_APP_BACKEND_URL}/api/teams`);
      })
      .then((res) => res.json())
      .then((teamData) => {
        const foundTeam = teamData.find((team) =>
          team.members.includes(user?.discordName)
        );
        if (foundTeam) setUserTeam(foundTeam);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        // Only remove token if error is 401/invalid token
        // localStorage.removeItem("discord_token");
        // window.location.href = "/login";
      });
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
