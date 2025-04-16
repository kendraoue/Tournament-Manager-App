import React, { useEffect, useState } from "react";

const UserForm = ({ user, onSave }) => {
  const [discordName, setDiscordName] = useState(user?.discordName || "");
  const [teamName, setteamName] = useState("");
  const [narakaUsername, setNarakaUsername] = useState("");

  useEffect(() => {
    setDiscordName(user?.discordName || "");
  }, [user]);

  const handleSave = () => {
    if (!narakaUsername.trim() || !teamName.trim()) {
      alert("Please enter a valid name.");
      return;
    }

    if (typeof onSave === "function") {
      onSave({ discordName, narakaUsername, teamName });
    } else {
      console.error("onSave is not provided or is not a function.");
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
          Naraka UserName
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
          onChange={(e) => setteamName(e.target.value)}
        />
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition duration-300"
      >
        Save
      </button>
    </div>
  );
};

export default UserForm;
