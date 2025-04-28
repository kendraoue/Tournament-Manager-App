import React from "react";

const CreateTournamentForm = ({
  name,
  setName,
  type,
  setType,
  maxTeams,
  setMaxTeams,
  startDateTime,
  setStartDateTime,
  handleCreateTournament,
}) => {
  return (
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
  );
};

export default CreateTournamentForm;
