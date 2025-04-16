import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import axios from "axios";

const YourTournamentsDashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await axios.get("/api/tournaments/my-tournaments");
        setTournaments(res.data);
      } catch (err) {
        console.error("Failed to fetch tournaments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleLeaveTournament = async (tournamentId) => {
    try {
      await axios.post(`/api/tournaments/${tournamentId}/leave`);
      setTournaments((prev) =>
        prev.filter((entry) => entry.tournament.id !== tournamentId)
      );
    } catch (err) {
      console.error("Failed to leave tournament:", err);
      alert("Unable to leave tournament. Please try again.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your Tournaments</h1>

      {loading ? (
        <div className="py-10">Loading your tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div className="py-10 text-muted-foreground">
          You haven't joined any tournaments yet.
        </div>
      ) : (
        tournaments.map((entry) => (
          <Card key={entry.tournament.id} className="shadow-md">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {entry.tournament.name}
                </h2>
                <Badge variant="secondary">{entry.tournament.type}</Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                Your Team:{" "}
                <span className="font-medium">{entry.team.name}</span>
              </div>

              <div className="text-sm">
                Team Role:{" "}
                <Badge
                  variant={entry.teamRole === "creator" ? "default" : "outline"}
                >
                  {entry.teamRole}
                </Badge>
              </div>

              {entry.teamRole !== "creator" && (
                <button
                  onClick={() => handleLeaveTournament(entry.tournament.id)}
                  className="mt-4 text-sm text-red-500 hover:underline"
                >
                  Leave Tournament
                </button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default YourTournamentsDashboard;
