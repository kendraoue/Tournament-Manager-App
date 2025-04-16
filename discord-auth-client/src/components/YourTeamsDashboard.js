import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import axios from "axios";

const YourTeamsDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        const res = await axios.get("/api/teams/my-teams");
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, []);
  async function handleLeaveTeam(teamId) {
    try {
      await axios.post(`/api/teams/${teamId}/leave`);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
    } catch (err) {
      console.error("Failed to leave team:", err);
      alert("Unable to leave team. Please try again.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your Teams</h1>

      {loading ? (
        <div className="py-10">Loading your teams...</div>
      ) : teams.length === 0 ? (
        <div className="py-10 text-muted-foreground">
          You are not part of any teams yet.
        </div>
      ) : (
        teams.map((team) => (
          <Card key={team.id} className="shadow-md">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{team.name}</h2>
                <Badge variant="outline">
                  {team.role === "creator" ? "Creator" : "Member"}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                Tournament:{" "}
                <span className="font-medium">{team.tournament.name}</span> (
                {team.tournament.type})
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {team.members.map((member) => (
                  <Badge key={member.id}>
                    {member.username}
                    {member.id === team.created_by && " (Creator)"}
                  </Badge>
                ))}
              </div>

              {team.role !== "creator" && (
                <button
                  onClick={() => handleLeaveTeam(team.id)}
                  className="mt-4 text-sm text-red-500 hover:underline"
                >
                  Leave Team
                </button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default YourTeamsDashboard;
