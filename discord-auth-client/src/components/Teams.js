import React, { useEffect, useState } from "react";

const UserForm = ({ user, onSave }) => {
  const [discordName, setDiscordName] = useState(user?.discordName || "");
  const [teamName, setTeamName] = useState("");
  const [narakaUsername, setNarakaUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDiscordName(user?.discordName || "");
  }, [user]);

  const handleSave = async () => {
    // Validate the inputs
    if (!narakaUsername.trim() || !teamName.trim()) {
      alert("Please enter a valid Naraka Username and Team Name.");
      return;
    }

    // Build the payload for the API call
    const payload = {
      name: teamName,
      userId: user?._id || user?.id, // Adjust based on your user object structure
      narakaUsername, // Optional: Include only if your API supports it
      discordName, // Optional: Include only if your API supports it
    };

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        // If the response is not ok, try to extract the error message
        const errorData = await response.json();
        console.error("Error creating team:", errorData);
        alert(`Error creating team: ${errorData.error || "Unknown error"}`);
        return;
      }

      const data = await response.json();
      console.log("Team created successfully:", data);

      // Optionally call the onSave callback to let the parent component know a team was created
      if (typeof onSave === "function") {
        onSave(data);
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("An error occurred while creating the team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Enter Team Name</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Discord Name
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded bg-gray-700 text-gray-200"
          value={discordName}
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Naraka Username
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded bg-gray-700 text-gray-200"
          value={narakaUsername}
          onChange={(e) => setNarakaUsername(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">
          Team Name
        </label>
        <input
          type="text"
          className="w-full p-2 border rounded bg-gray-700 text-gray-200"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default UserForm;
