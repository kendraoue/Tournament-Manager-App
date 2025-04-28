import { useEffect, useState } from "react";
import CreateTournamentForm from "../components/CreateTournamentForm";

export default function Tournament() {
  const [tournamentData, setTournamentData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("solos");
  const [maxTeams, setMaxTeams] = useState("");
  const [startDateTime, setStartDateTime] = useState("");

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
      if (data && data.username) {
        setCurrentUser(data.username);
      } else {
        setCurrentUser(undefined);
        setErrors([data.error || "Failed to fetch user"]);
      }
    })
    .catch((err) => {
      setCurrentUser(undefined);
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

    const newTournament = {
      name: sanitizedName,
      type,
      maxTeams: teams,
      startDateTime: selectedDate.toISOString(),
      discordId: currentUser,
    };

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
        console.error("Server responded with error:", errorText);
        throw new Error("Failed to create tournament");
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

      {/* List of Tournaments */}
      <ul>
        {tournamentData.map((t) => (
          <li
            key={t._id}
            className="relative mb-2 p-4 border rounded shadow bg-white"
          >
            {console.log("Tournament Data:", t)}
            {console.log(
              "Username from tournament:",
              `"${t.createdBy?.username}"`
            )}
            {console.log("Username from current user:", `"${currentUser}"`)}
            {currentUser &&
              t.createdBy?.username?.trim().toLowerCase() ==
                currentUser.trim().toLowerCase() && (
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              )}
            <h2 className="text-xl font-semibold">{t.name}</h2>
            <p>Type: {t.type}</p>
            <p>Max Teams: {t.maxTeams}</p>
            <p>Start Time: {new Date(t.startDateTime).toLocaleString()}</p>
            <p>Created by: {t.createdBy?.username || "Unknown Creator"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
