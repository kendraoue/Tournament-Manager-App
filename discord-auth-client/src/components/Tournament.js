import { useEffect, useState } from "react";
import CreateTournamentForm from "../components/CreateTournamentForm";
import CreateTeamForm from './CreateTeamForm';

export default function Tournament() {
  const [tournamentData, setTournamentData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("solos");
  const [maxTeams, setMaxTeams] = useState("");
  const [startDateTime, setStartDateTime] = useState("");

  // Team counts state
  const [teamCounts, setTeamCounts] = useState({});

  // Create team modal state
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  //Fetch current user
  useEffect(() => {
    const token = localStorage.getItem("discord_token");

    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getMe`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Full user data from getMe:", data);
        if (data && data.username) {
          setCurrentUser(data.username);
          setCurrentUserId(data.discordId);
          console.log("Set user data:", {
            username: data.username,
            discordId: data.discordId
          });
        } else {
          setErrors([data.error || "Failed to fetch user"]);
        }
      })
      .catch((err) => {
        setErrors(["Failed to fetch user"]);
        console.error("Failed to fetch user", err);
      });
  }, []);

  //Fetch tournaments
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tournaments`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        console.log("Fetched tournament data:", data);
        setTournamentData(data);
      })
      .catch((error) => {
        setErrors([error.message]); // Store the error message as an array
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  useEffect(() => {
    if (tournamentData) {
      // Fetch team counts for each tournament
      const fetchTeamCounts = async () => {
        try {
          const counts = {};
          for (const tournament of tournamentData) {
            try {
              const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournament._id}/teams/count`
              );
              
              if (!response.ok) {
                console.error(`Failed to fetch team count for tournament ${tournament._id}:`, response.status);
                continue; // Skip this tournament and continue with others
              }
              
              const data = await response.json();
              counts[tournament._id] = data.count;
            } catch (error) {
              console.error(`Error fetching team count for tournament ${tournament._id}:`, error);
              // Set count to 0 if there's an error
              counts[tournament._id] = 0;
            }
          }
          setTeamCounts(counts);
        } catch (error) {
          console.error("Error fetching team counts:", error);
          // Set all counts to 0 if there's a general error
          const defaultCounts = tournamentData.reduce((acc, tournament) => {
            acc[tournament._id] = 0;
            return acc;
          }, {});
          setTeamCounts(defaultCounts);
        }
      };

      fetchTeamCounts();
    }
  }, [tournamentData]);

  const handleDelete = async (tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrors(["User is not authenticated"]);
        return;
      }

      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournamentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        // Try to parse error as JSON, fallback to text
        let errorMsg = "Failed to delete tournament";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          errorMsg = await res.text();
        }
        throw new Error(errorMsg);
      }

      // Only update state if deletion was successful
      setTournamentData((prev) =>
        prev.filter((tournament) => tournament._id !== tournamentId)
      );
    } catch (err) {
      console.error(err);
      setErrors([err.message]);
    }
  };

  const handleCreateTournament = async () => {
    let validationErrors = []; // Array to collect validation errors
    console.log("Raw form values:", {
      name,
      type,
      maxTeams,
      startDateTime,
    });

    const sanitizedName = name.trim().replace(/[<>]/g, ""); // Remove any tag-like chars
    if (!sanitizedName) {
      validationErrors.push(
        "Tournament name cannot be empty or contain invalid characters."
      );
    }

    const allowedTypes = ["solos", "duos", "trios"];
    if (!allowedTypes.includes(type)) {
      validationErrors.push("Invalid tournament type selected.");
    }

    const teams = Number(maxTeams);
    if (isNaN(teams) || teams <= 0) {
      validationErrors.push("Max teams must be a positive number.");
    }

    const selectedDate = new Date(startDateTime);
    const now = new Date();
    if (selectedDate <= now) {
      validationErrors.push("Start date/time must be in the future.");
    }

    if (validationErrors.length > 0) {
      console.log("Validation errors:", validationErrors);
      setErrors(validationErrors);
      return;
    }

    if (!currentUser) {
      console.error("No username available");
      setErrors(["User is not authenticated"]);
      return;
    }

    if (!currentUserId) {
      console.error("No currentUserId available");
      return;
    }

    const newTournament = {
      name: sanitizedName,
      type,
      maxTeams: teams,
      startDateTime: selectedDate.toISOString(),
      discordId: currentUserId,
    };

    // Add this before the fetch call
    console.log("Sending tournament data:", {
      name: sanitizedName,
      type,
      maxTeams: teams,
      startDateTime: selectedDate.toISOString(),
      discordId: currentUserId
    });

    try {
      // Retrieve the Discord token from localStorage
      const token = localStorage.getItem("discord_token");

      if (!token) {
        console.error("No token found in localStorage");
        setErrors(["User is not authenticated"]);
        return;
      }

      // Log the token and current user to ensure correct data
      console.log("Discord Access Token:", token);
      console.log("Current User:", currentUser);
      console.log("Debug data:", {
        token: token ? "exists" : "missing",
        currentUser,
        currentUserId,
        requestBody: newTournament
      });
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/tournaments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTournament),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Full server error response:", errorText);
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Parsed error:", errorJson);
          throw new Error(errorJson.error || errorJson.message || "Failed to create tournament");
        } catch (e) {
          throw new Error(errorText || "Failed to create tournament");
        }
      }

      const created = await response.json();
      console.log("Created Tournament:", created);
      setTournamentData((prev) => [...prev, created]);

      // Reset form
      setName("");
      setType("solos");
      setMaxTeams("");
      setStartDateTime("");
      setErrors([]); // Clear errors after successful submission
    } catch (err) {
      console.error(err);
      console.error("Caught error during fetch:", err);
      setErrors([err.message]);
    }
  };

  const handleCreateTeam = async (tournamentId, tournamentType) => {
    setSelectedTournament({ id: tournamentId, type: tournamentType });
    setIsCreateTeamModalOpen(true);
  };

  const handleTeamFormSubmit = async ({ teamName }) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrors(["User is not authenticated"]);
        return;
      }

      console.log('Submitting team form with:', {
        teamName,
        tournamentId: selectedTournament.id
      });

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${selectedTournament.id}/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teamName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }

      const newTeam = await response.json();
      console.log('Team created:', newTeam);
      
      // Update team count for this tournament
      setTeamCounts(prev => ({
        ...prev,
        [selectedTournament.id]: (prev[selectedTournament.id] || 0) + 1
      }));

      setIsCreateTeamModalOpen(false);
      setSelectedTournament(null);

    } catch (err) {
      console.error('Error creating team:', err);
      setErrors([err.message]);
    }
  };

  if (!tournamentData) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tournaments</h1>

      {/* Only show the error messages if there are errors */}
      {errors.length > 0 && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded border border-red-300">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li> // Display each error message
            ))}
          </ul>
        </div>
      )}

      {/* Create Tournament Form */}

      <CreateTournamentForm
        name={name}
        setName={setName}
        type={type}
        setType={setType}
        maxTeams={maxTeams}
        setMaxTeams={setMaxTeams}
        startDateTime={startDateTime}
        setStartDateTime={setStartDateTime}
        handleCreateTournament={handleCreateTournament}
      />
<h3 className="text-xl font-bold mb-4">Active Tournaments</h3>
      {/* List of Tournaments */}
      <div className="space-y-4">
        {tournamentData.map((t) => (
          <div key={t._id} className="border rounded-lg shadow-sm">
            <div 
              className="flex justify-between items-center p-4 rounded-lg bg-white cursor-pointer hover:bg-gray-50"
              onClick={() => document.getElementById(`tournament-${t._id}`).classList.toggle('hidden')}
            >
              <h2 className="text-xl font-semibold text-gray-800">{t.name}</h2>
              {currentUser &&
                t.createdBy?.username?.trim().toLowerCase() ===
                  currentUser.trim().toLowerCase() && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t._id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xl font-bold focus:outline-none transition-colors duration-200"
                    title="Delete Tournament"
                  >
                    ×
                  </button>
                )}
            </div>
            
            <div id={`tournament-${t._id}`} className="hidden">
              <div className="p-4 bg-gray-50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-500 text-sm">Tournament Type</span>
                    <p className="font-medium capitalize">{t.type}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-gray-500 text-sm">Teams</span>
                    <p className="font-medium">
                      <span className="text-blue-600">{teamCounts[t._id] || 0}</span> / {t.maxTeams}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm col-span-2">
                    <span className="text-gray-500 text-sm">Start Time</span>
                    <p className="font-medium text-blue-600">
                      {new Date(t.startDateTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCreateTeam(t._id, t.type)}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200
                    ${(teamCounts[t._id] || 0) >= t.maxTeams 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  disabled={(teamCounts[t._id] || 0) >= t.maxTeams}
                >
                  {(teamCounts[t._id] || 0) >= t.maxTeams ? 'Tournament Full' : 'Create Team'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateTeamForm
        isOpen={isCreateTeamModalOpen}
        onClose={() => {
          setIsCreateTeamModalOpen(false);
          setSelectedTournament(null);
        }}
        onSubmit={handleTeamFormSubmit}
        tournamentType={selectedTournament?.type}
      />
    </div>
  );
}
