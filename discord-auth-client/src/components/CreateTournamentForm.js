import React from "react";
import Select from "react-select";

//Using react-select to create a dropdown for the tournament type so custom styles can be applied
const options = [
  { value: "solos", label: "Solos" },
  { value: "duos", label: "Duos" },
  { value: "trios", label: "Trios" },
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#9E72C3" : "#9E72C3",
    color: state.isFocused ? "#365314" : "#365314", // lime-900
    cursor: "pointer",
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor: "#9E72C3",
    color: "#365314",
    borderColor: "#9E72C3",
    minHeight: "2.5rem",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#365314",
  }),
};

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
    <div className="mb-6 p-4">
      <h2 className="text-xl font-semibold mb-2">Create a Tournament</h2>

      <input
        className="block mb-2 p-2 rounded w-full bg-[#9E72C3] text-lime-900 focus:outline-none  focus:border-green-600 focus:ring-2 focus:ring-green-600"
        placeholder="Tournament Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="mb-2">
        <Select
          options={options}
          value={options.find((o) => o.value === type)}
          onChange={(selected) => setType(selected.value)}
          styles={{
            ...customStyles,
            control: (provided, state) => ({
              ...provided,
              backgroundColor: "#9E72C3",
              color: "#365314",
              borderColor: state.isFocused ? "#22c55e" : "#9E72C3", // #22c55e is Tailwind green-500
              boxShadow: state.isFocused ? "0 0 0 2px #22c55e" : provided.boxShadow,
              minHeight: "2.5rem",
            }),
          }}
          classNamePrefix="react-select"
        />
      </div>

      <input
        className="block mb-2 p-2 rounded w-full bg-[#9E72C3] text-lime-900 focus:outline-none  focus:border-green-600 focus:ring-2 focus:ring-green-600"
        type="number"
        placeholder="Max Teams"
        value={maxTeams}
        onChange={(e) => setMaxTeams(e.target.value)}
      />
      <input
        type="datetime-local"
        className="block mb-2 p-2 rounded w-full bg-[#9E72C3] text-lime-900 focus:outline-none  focus:border-green-600 focus:ring-2 focus:ring-green-600"
        value={startDateTime}
        onChange={(e) => setStartDateTime(e.target.value)}
      />
      <button
        className="bg-[#8CD18E] px-4 py-2 rounded hover:bg-[#3E8241] text-gray-900"
        onClick={handleCreateTournament}
      >
        Create Tournament
      </button>
    </div>
  );
};

export default CreateTournamentForm;
