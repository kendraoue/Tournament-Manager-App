import React, { useState, useEffect } from "react";
import YourTeamsDashboard from "../components/YourTeamsDashboard";
import YourTournamentsDashboard from "../components/YourTournamentsDashboard";

const Dashboard = () => {
  const [discordName, setDiscordName] = useState("Guest");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setDiscordName(userData?.username || "Guest");
      console.log("User logged in:", userData?.username);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#987DE8] text-[#CDE87D] p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Welcome, {discordName}!
      </h1>
      <div className="flex flex-row gap-20">
        <div className="bg-[#7F66C9] p-4 w-full shadow-lg rounded">
          <YourTeamsDashboard />
        </div>
        <div className="bg-[#7F66C9] p-4 w-full shadow-lg rounded">
          <YourTournamentsDashboard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
