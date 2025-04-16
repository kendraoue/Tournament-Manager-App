import { useEffect, useState } from "react";

export default function Tournament() {
  const [tournamentData, setTournamentData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

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
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Current user data:", data);
        setCurrentUserId(data.discordId);
      })
      .catch((err) => console.error("Failed to fetch user", err));
  }, []);

  //Fetch tournaments
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tournaments`)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => setTournamentData(data))
      .catch((error) => {
        setErrors([error.message]); // Store the error message as an array
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  const handleDelete = async (tournamentId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/tournaments/${tournamentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to delete tournament");

      // Remove it from state
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

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      console.error("No currentUser found in localStorage");
      setErrors(["User is not authenticated"]);
      return;
    }

    const newTournament = {
      name: sanitizedName,
      type,
      maxTeams: teams,
      startDateTime: selectedDate.toISOString(),
      discordId: currentUser.discordId,
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
      <div className="mb-6 p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-2">Create a Tournament</h2>

        <input
          className="block mb-2 p-2 border rounded w-full"
          placeholder="Tournament Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="block mb-2 p-2 border rounded w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="solos">Solos</option>
          <option value="duos">Duos</option>
          <option value="trios">Trios</option>
        </select>
        <input
          className="block mb-2 p-2 border rounded w-full"
          type="number"
          placeholder="Max Teams"
          value={maxTeams}
          onChange={(e) => setMaxTeams(e.target.value)}
        />
        <input
          type="datetime-local"
          className="block mb-2 p-2 border rounded w-full"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
        />
        <button
          className="bg-[#6C45E3] text-white px-4 py-2 rounded hover:bg-[#5a37c6]"
          onClick={handleCreateTournament}
        >
          Create Tournament
        </button>
      </div>

      {/* List of Tournaments */}
      <ul>
        {tournamentData.map((t) => (
          <li
            key={t._id}
            className="relative mb-2 p-4 border rounded shadow bg-white"
          >
            {currentUserId === t.createdBy && (
              <button
                onClick={() => handleDelete(t._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                ✖
              </button>
            )}
            <h2 className="text-xl font-semibold">{t.name}</h2>
            <p>Type: {t.type}</p>
            <p>Max Teams: {t.maxTeams}</p>
            <p>Start Time: {new Date(t.startDateTime).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
