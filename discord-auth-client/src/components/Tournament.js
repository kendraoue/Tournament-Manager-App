import { useEffect, useState } from "react";
import CreateTournamentForm from "../components/CreateTournamentForm";
import CreateTeamForm from "./CreateTeamForm";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Ensure ToastContainer is rendered in the component
<ToastContainer />;

export default function Tournament() {
  // State for tournament data
  const [tournamentData, setTournamentData] = useState(null);

  // State for error messages
  const [errors, setErrors] = useState([]);

  // State for current user information
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Form state for creating tournaments
  const [name, setName] = useState("");
  const [type, setType] = useState("solos");
  const [maxTeams, setMaxTeams] = useState("");
  const [startDateTime, setStartDateTime] = useState("");

  // State for tracking team counts per tournament
  const [teamCounts, setTeamCounts] = useState({});

  // State for managing the create team modal
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  // State for managing teams and their members
  const [teams, setTeams] = useState({});
  const [teamMembers, setTeamMembers] = useState({});

  // State for managing the create tournament modal
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] =
    useState(false);

  // State for managing accordion open/close
  const [openAccordion, setOpenAccordion] = useState(null);

  // Helper function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Helper function to set errors and scroll to the top of the page
  const setErrorsWithScroll = (newErrors) => {
    setErrors(newErrors);
    scrollToTop();
  };

  // Fetch current user information on component mount
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
            discordId: data.discordId,
          });
        } else {
          setErrorsWithScroll([data.error || "Failed to fetch user"]);
        }
      })
      .catch((err) => {
        setErrorsWithScroll(["Failed to fetch user"]);
        console.error("Failed to fetch user", err);
      });
  }, []);

  // Fetch tournaments on component mount
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
        setErrorsWithScroll([error.message]);
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  // Fetch team counts for each tournament when tournament data changes
  useEffect(() => {
    if (tournamentData) {
      const fetchTeamCounts = async () => {
        try {
          const counts = {};
          for (const tournament of tournamentData) {
            try {
              const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournament._id}/teams/count`
              );

              if (!response.ok) {
                console.error(
                  `Failed to fetch team count for tournament ${tournament._id}:`,
                  response.status
                );
                continue; // Skip this tournament and continue with others
              }

              const data = await response.json();
              counts[tournament._id] = data.count;
            } catch (error) {
              console.error(
                `Error fetching team count for tournament ${tournament._id}:`,
                error
              );
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

  // Function to delete a tournament
  const handleDelete = async (tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrorsWithScroll(["User is not authenticated"]);
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
      setErrorsWithScroll([err.message]);
    }
  };

  // Function to create a new tournament
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
      setErrorsWithScroll(validationErrors);
      return;
    }

    if (!currentUser) {
      console.error("No username available");
      setErrorsWithScroll(["User is not authenticated"]);
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
      discordId: currentUserId,
    });

    try {
      // Retrieve the Discord token from localStorage
      const token = localStorage.getItem("discord_token");

      if (!token) {
        console.error("No token found in localStorage");
        setErrorsWithScroll(["User is not authenticated"]);
        return;
      }

      // Log the token and current user to ensure correct data
      console.log("Discord Access Token:", token);
      console.log("Current User:", currentUser);
      console.log("Debug data:", {
        token: token ? "exists" : "missing",
        currentUser,
        currentUserId,
        requestBody: newTournament,
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
          throw new Error(
            errorJson.error ||
              errorJson.message ||
              "Failed to create tournament"
          );
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
      setErrorsWithScroll([]); // Clear errors after successful submission

      // Show success toast
      toast.success("Tournament created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.error(err);
      console.error("Caught error during fetch:", err);
      setErrorsWithScroll([err.message]);

      // Show error toast
      toast.error("Failed to create tournament. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  // Function to handle creating a new team
  const handleCreateTeam = async (tournamentId, tournamentType) => {
    setSelectedTournament({ id: tournamentId, type: tournamentType });
    setIsCreateTeamModalOpen(true);
  };

  // Function to handle team form submission
  const handleTeamFormSubmit = async ({ teamName }) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrorsWithScroll(["User is not authenticated"]);
        return;
      }

      console.log("Submitting team form with:", {
        teamName,
        tournamentId: selectedTournament.id,
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
        throw new Error(errorData.error || "Failed to create team");
      }

      const newTeam = await response.json();
      console.log("Team created:", newTeam);

      // Update team count for this tournament
      setTeamCounts((prev) => ({
        ...prev,
        [selectedTournament.id]: (prev[selectedTournament.id] || 0) + 1,
      }));

      // Fetch updated teams data
      await fetchTeamsAndMembers(selectedTournament.id);

      setIsCreateTeamModalOpen(false);
      setSelectedTournament(null);

      // Show success toast
      toast.success("Team created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.error("Error creating team:", err);
      setErrorsWithScroll([err.message]);
    }
  };

  // Function to fetch teams and their members for a specific tournament
  const fetchTeamsAndMembers = async (tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");

      // Fetch teams with populated members
      const teamsResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournamentId}/teams`
      );

      if (!teamsResponse.ok) throw new Error("Failed to fetch teams");
      const teamsData = await teamsResponse.json();

      console.log("Fetched teams data:", teamsData); // Debug log

      setTeams((prev) => ({
        ...prev,
        [tournamentId]: teamsData,
      }));
    } catch (error) {
      console.error("Error fetching teams:", error);
      setErrorsWithScroll((prev) => [...prev, "Failed to fetch teams"]);
    }
  };

  // Function to handle joining a team
  const handleJoinTeam = async (teamId, tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrorsWithScroll(["User is not authenticated"]);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join team");
      }

      // Refresh teams data
      await fetchTeamsAndMembers(tournamentId);
      // Show success toast
      toast.success("Team joined successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (err) {
      console.error("Error joining team:", err);
      setErrorsWithScroll([err.message]);
    }
  };

  // Helper function to get the maximum team size based on tournament type
  const getMaxTeamSize = (type) => {
    const sizes = {
      solos: 1,
      duos: 2,
      trios: 3,
    };
    return sizes[type] || 1;
  };

  // Function to handle accordion toggle for tournament details
  const handleAccordionToggle = async (tournamentId) => {
    if (openAccordion === tournamentId) {
      // Close the accordion
      setOpenAccordion(null);
    } else {
      // Open the accordion and fetch data
      await fetchTeamsAndMembers(tournamentId);
      setOpenAccordion(tournamentId);
    }
  };

  // Helper function to check if the current user is in a team
  const isUserInTeam = (team, userId) => {
    return team.members.some(
      (member) => member._id === userId || member.discordId === userId
    );
  };

  // Function to handle deleting a team
  const handleDeleteTeam = async (teamId, tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrorsWithScroll(["User is not authenticated"]);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete team");
      }

      // Show success toast
      toast.success("Team deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      // Update team count immediately
      setTeamCounts((prev) => ({
        ...prev,
        [tournamentId]: Math.max(0, (prev[tournamentId] || 0) - 1),
      }));

      // Refresh teams data
      await fetchTeamsAndMembers(tournamentId);
    } catch (err) {
      console.error("Error deleting team:", err);
      setErrorsWithScroll([err.message]);
    }
  };

  // Function to handle leaving a team
  const handleLeaveTeam = async (teamId, tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrorsWithScroll(["User is not authenticated"]);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to leave team");
      }
      // Show success toast
      toast.success("Left team successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      // Refresh teams data
      await fetchTeamsAndMembers(tournamentId);
    } catch (err) {
      console.error("Error leaving team:", err);
      setErrorsWithScroll([err.message]);
    }
  };

  // Function to handle removing a member from a team
  const handleRemoveMember = async (teamId, memberId, tournamentId) => {
    try {
      const token = localStorage.getItem("discord_token");
      if (!token) {
        setErrorsWithScroll(["User is not authenticated"]);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/teams/${teamId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove team member");
      }
      // Show success toast
      toast.success("Member removed successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      // Refresh teams data
      await fetchTeamsAndMembers(tournamentId);
    } catch (err) {
      console.error("Error removing team member:", err);
      setErrorsWithScroll([err.message]);
    }
  };

  // Show loading message while tournament data is being fetched
  if (!tournamentData) return <div>Loading...</div>;

  return (
    <main className="p-4">
      {/* Toast container to display notifications */}
      <ToastContainer />

      <h1 className="text-2xl font-bold mb-4 text-[#BCE345]">Tournaments</h1>

      <button
        onClick={() => setIsCreateTournamentModalOpen(true)}
        className="mb-4 px-4 py-2 bg-[#6C45E3] text-white rounded hover:bg-[#cabdf5] font-semibold"
      >
        Create Tournament
      </button>

      {/* Only show the error messages if there are errors */}
      {errors.length > 0 && (
        <section
          className="mb-4 text-red-600 bg-red-100 p-2 rounded border border-red-300"
          role="alert"
        >
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Modal for Create Tournament */}
      {isCreateTournamentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#6C45E3] rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setIsCreateTournamentModalOpen(false)}
              className="absolute top-2 right-2 text-lime-500 hover:text-lime-700 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            <CreateTournamentForm
              name={name}
              setName={setName}
              type={type}
              setType={setType}
              maxTeams={maxTeams}
              setMaxTeams={setMaxTeams}
              startDateTime={startDateTime}
              setStartDateTime={setStartDateTime}
              handleCreateTournament={async () => {
                await handleCreateTournament();
                setIsCreateTournamentModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* List of Tournaments */}
      <section className="space-y-4" aria-label="Tournaments">
        {tournamentData.map((t) => (
          <article
            key={t._id}
            className="border border-[#e7f5bd] rounded-lg shadow-sm"
          >
            <div
              className={`flex justify-between items-center p-4 bg-[#6C45E3] cursor-pointer hover:bg-[#cabdf5] ${
                openAccordion === t._id ? "rounded-t-lg" : "rounded-lg"
              }`}
              onClick={() => handleAccordionToggle(t._id)}
            >
              <h2 className="text-xl font-semibold text-[#BCE345]">{t.name}</h2>
              <div className="p-1">
                <span className="text-sm text-[#c7e864]">Tournament Type</span>
                <p className="font-medium capitalize text-[#BCE345]">
                  {t.type}
                </p>
              </div>
              <div className="p-3">
                <span className="text-[#c7e864] text-sm">Start Time</span>
                <p className="font-medium text-[#BCE345]">
                  {new Date(t.startDateTime).toLocaleString([], {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                </p>
              </div>
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

            {openAccordion === t._id && (
              <div className="p-4 bg-[#ede9fc] border border-[#e7f5bd] rounded-bl-lg rounded-br-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3">
                    <span className="text-[##7b9b17] text-sm">Teams</span>
                    <p className="font-medium">
                      <span className="text-[##7b9b17]">
                        {teamCounts[t._id] || 0}
                      </span>{" "}
                      / {t.maxTeams}
                    </p>
                  </div>
                </div>

                {/* Teams Section */}
                <section className="space-y-4" aria-label="Teams">
                  <h4 className="text-lg font-semibold">Teams</h4>

                  {teams[t._id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teams[t._id].map((team) => (
                        <article
                          key={team._id}
                          className="bg-white p-4 rounded-lg shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h5 className="font-semibold text-lg">
                              {team.name}
                            </h5>
                            {/* Add debug log */}
                            {console.log("Creator check:", {
                              teamCreator: team.createdBy,
                              teamCreatorId: team.createdBy._id,
                              currentUserId: currentUserId,
                              currentUser: currentUser,
                              isCreator:
                                team.createdBy.username?.toLowerCase() ===
                                currentUser?.toLowerCase(),
                            })}
                            {team.createdBy.username?.toLowerCase() ===
                              currentUser?.toLowerCase() && (
                              <button
                                onClick={() =>
                                  handleDeleteTeam(team._id, t._id)
                                }
                                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded-md hover:bg-red-50"
                                title="Delete Team"
                              >
                                Delete Team
                              </button>
                            )}
                          </div>

                          {/* Team Members */}
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">Members:</p>
                            <ul className="list-none space-y-2">
                              {team.members.map((member) => (
                                <li
                                  key={member._id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                >
                                  <div className="flex items-center">
                                    <span className="text-sm">
                                      {member.username}
                                    </span>
                                    {member.discordId === currentUserId && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        You
                                      </span>
                                    )}
                                    {member._id === team.createdBy._id && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                        Creator
                                      </span>
                                    )}
                                  </div>

                                  {/* Controls */}
                                  <div className="flex items-center space-x-2">
                                    {/* Remove Member Button - Only shown to team creator and not for themselves */}
                                    {team.createdBy._id === currentUserId &&
                                      member._id !== team.createdBy._id && (
                                        <button
                                          onClick={() =>
                                            handleRemoveMember(
                                              team._id,
                                              member._id,
                                              t._id
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded-md hover:bg-red-50"
                                          title="Remove Member"
                                        >
                                          Remove
                                        </button>
                                      )}

                                    {/* Leave Team Button - Only shown to the member themselves if they're not the creator */}
                                    {member.discordId === currentUserId &&
                                      member._id !== team.createdBy._id && (
                                        <button
                                          onClick={() =>
                                            handleLeaveTeam(team._id, t._id)
                                          }
                                          className="text-yellow-600 hover:text-yellow-700 text-sm px-2 py-1 rounded-md hover:bg-yellow-50"
                                        >
                                          Leave
                                        </button>
                                      )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Team Controls Section */}
                          <div className="mt-4 space-y-2">
                            {/* Delete Team Button - Only shown to creator */}
                            {team.createdBy._id === currentUserId && (
                              <button
                                onClick={() =>
                                  handleDeleteTeam(team._id, t._id)
                                }
                                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                              >
                                Delete Team
                              </button>
                            )}

                            {/* Join Team Button */}
                            {!isUserInTeam(team, currentUserId) &&
                              team.members.length < getMaxTeamSize(t.type) && (
                                <button
                                  onClick={() =>
                                    handleJoinTeam(team._id, t._id)
                                  }
                                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  Join Team
                                </button>
                              )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No teams yet</p>
                  )}

                  {/* Create Team Button */}
                  {(teamCounts[t._id] || 0) < t.maxTeams && (
                    <button
                      onClick={() => handleCreateTeam(t._id, t.type)}
                      className="w-full py-2 px-4 rounded-md font-medium bg-[#b7e138] hover:bg-[#b7e138] text-[#6C45E3] transition-colors duration-200"
                    >
                      Create Team
                    </button>
                  )}
                </section>
              </div>
            )}
          </article>
        ))}
      </section>
      <section className="">
        <CreateTeamForm
          isOpen={isCreateTeamModalOpen}
          onClose={() => {
            setIsCreateTeamModalOpen(false);
            setSelectedTournament(null);
          }}
          onSubmit={handleTeamFormSubmit}
          tournamentType={selectedTournament?.type}
        />
      </section>
    </main>
  );
}
