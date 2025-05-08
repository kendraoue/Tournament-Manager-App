import React, { useState } from 'react';

export default function CreateTeamForm({ isOpen, onClose, onSubmit, tournamentType }) {
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    onSubmit({ teamName });
    setTeamName('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#6C45E3] rounded-lg p-4 w-full max-w-md text-[#BCE345]">
        <div className="flex items-center justify-between w-full mb-4">
          <h2 className="text-xl font-bold text-gray-800">Create New Team</h2>
          <button
        onClick={onClose}
        className="text-lime-500 hover:text-lime-700 text-2xl leading-none"
        aria-label="Close"
      >
        &times;
      </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter team name"
            />
          </div>

          <div className="text-sm text-gray-600">
            Tournament Type: <span className="font-medium capitalize">{tournamentType}</span>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="submit"
              className="px-4 py-2 text-black bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 