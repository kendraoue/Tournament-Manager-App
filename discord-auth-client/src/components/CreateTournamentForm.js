import React from "react";
import Select from "react-select";

// Define the options for the tournament type dropdown
const options = [
  { value: "solos", label: "Solos" },
  { value: "duos", label: "Duos" },
  { value: "trios", label: "Trios" },
];

// Define custom styles for the react-select dropdown
const customStyles = {
  // Style for individual options in the dropdown
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#9E72C3" : "#9E72C3", // Purple background
    color: state.isFocused ? "#365314" : "#365314", // Lime-900 text color
    cursor: "pointer",
  }),
  // Style for the dropdown control (input area)
  control: (provided) => ({
    ...provided,
    backgroundColor: "#9E72C3", // Purple background
    color: "#BCE345", // Lime text color
    borderColor: "#9E72C3", // Purple border
    minHeight: "2.5rem", // Minimum height for the control
  }),
  // Style for the selected value in the dropdown
  singleValue: (provided) => ({
    ...provided,
    color: "#BCE345", // Lime text color
  }),
};

/**
 * Component to render the Create Tournament form.
 * This form allows users to input tournament details such as name, type, max teams, and start date/time.
 *
 * @param {string} name - The name of the tournament.
 * @param {Function} setName - Function to update the tournament name.
 * @param {string} type - The type of the tournament (solos, duos, trios).
 * @param {Function} setType - Function to update the tournament type.
 * @param {number} maxTeams - The maximum number of teams allowed in the tournament.
 * @param {Function} setMaxTeams - Function to update the max teams.
 * @param {string} startDateTime - The start date and time of the tournament.
 * @param {Function} setStartDateTime - Function to update the start date and time.
 * @param {Function} handleCreateTournament - Function to handle the creation of the tournament.
 */
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
    <div className="mb-6 p-4 text-[#BCE345]">
      {/* Form title */}
      <h2 className="text-xl font-semibold mb-2">Create a Tournament</h2>

      {/* Input for tournament name */}
      <input
        className="block mb-2 p-2 rounded w-full bg-[#9E72C3] focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
        placeholder="Tournament Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Dropdown for tournament type */}
      <div className="mb-2">
        <Select
          options={options}
          value={options.find((o) => o.value === type)}
          onChange={(selected) => setType(selected.value)}
          styles={{
            ...customStyles,
            control: (provided, state) => ({
              ...provided,
              backgroundColor: "#9E72C3", // Purple background
              color: "#BCE345", // Lime text color
              borderColor: state.isFocused ? "#22c55e" : "#9E72C3", // Green border on focus
              boxShadow: state.isFocused
                ? "0 0 0 2px #22c55e"
                : provided.boxShadow, // Green outline on focus
              minHeight: "2.5rem",
            }),
          }}
          classNamePrefix="react-select"
        />
      </div>

      {/* Input for maximum number of teams */}
      <input
        className="block mb-2 p-2 rounded w-full bg-[#9E72C3] focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
        type="number"
        placeholder="Max Teams"
        value={maxTeams}
        onChange={(e) => setMaxTeams(e.target.value)}
      />

      {/* Input for start date and time */}
      <input
        type="datetime-local"
        className="block mb-2 p-2 rounded w-full bg-[#9E72C3] focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
        value={startDateTime}
        onChange={(e) => setStartDateTime(e.target.value)}
      />

      {/* Button to create the tournament */}
      <button
        className="bg-[#8CD18E] px-4 py-2 text-black rounded hover:bg-[#3E8241]"
        onClick={handleCreateTournament}
      >
        Create Tournament
      </button>
    </div>
  );
};

// Export the CreateTournamentForm component
export default CreateTournamentForm;
