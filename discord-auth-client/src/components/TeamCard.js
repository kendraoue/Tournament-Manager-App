import React from "react";

const TeamCard = ({ team, user, userTeam, onJoin }) => {
  // Prevents crash if `team` is undefined
  if (!team) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-red-500">
          Error: No team data found
        </h2>
      </div>
    );
  }

  const isUserInTeam = userTeam !== null;
  const isTeamFull = team.members?.length >= 2; // Ensures a team can't have more than 2 members
  const isUserAlreadyInTeam = team.members?.includes(user?.discordName);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{team.name}</h2>
      <p className="text-gray-400">Members ({team.members?.length ?? 0}/2):</p>
      <ul className="list-disc list-inside text-gray-300 mb-4">
        {team.members?.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>

      {/* Join Button: Disabled if the team is full or user is already in a team */}
      {!isUserAlreadyInTeam && !isTeamFull && (
        <button
          onClick={() => onJoin && onJoin(team.name)}
          disabled={isUserInTeam}
          className={`w-full font-bold py-2 rounded-lg transition duration-300 flex items-center justify-center ${
            isUserInTeam
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isUserInTeam ? "Already in a Team" : "+ Join Team"}
        </button>
      )}

      {/* User's Own Team Message */}
      {isUserAlreadyInTeam && (
        <p className="text-green-400 text-sm font-bold mt-2">
          This is your team!
        </p>
      )}
    </div>
  );
};

export default TeamCard;
