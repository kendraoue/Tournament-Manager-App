const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const User = require("../models/User");
const Tournament = require("../models/Tournament");

// Create a team for a tournament
exports.createTournamentTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamName } = req.body;
    
    // Get the authenticated user from JWT
    const userId = req.user._id;

    // Find the tournament
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    // Check if tournament is full
    const existingTeamsCount = await Team.countDocuments({ tournament: tournamentId });
    if (existingTeamsCount >= tournament.maxTeams) {
      return res.status(400).json({ error: "Tournament is full" });
    }

    // Check if user is already in a team for this tournament
    const existingTeam = await Team.findOne({
      tournament: tournamentId,
      members: userId
    });
    if (existingTeam) {
      return res.status(400).json({ error: "You are already in a team for this tournament" });
    }

    // Create new team
    const newTeam = new Team({
      name: teamName,
      tournament: tournamentId,
      members: [userId],
      type: tournament.type // solos, duos, or trios
    });

    await newTeam.save();

    // Populate team details
    const populatedTeam = await Team.findById(newTeam._id)
      .populate('members', 'username discordId')
      .populate('tournament', 'name type');

    res.status(201).json(populatedTeam);
  } catch (error) {
    console.error("Error creating tournament team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get teams for a tournament
exports.getTournamentTeams = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const teams = await Team.find({ tournament: tournamentId })
      .populate('members', 'username discordId')
      .populate('tournament', 'name type');

    res.json(teams);
  } catch (error) {
    console.error("Error getting teams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get team count for a tournament
exports.getTournamentTeamCount = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log('Fetching team count for tournament:', tournamentId); // Debug log

    const count = await Team.countDocuments({ tournament: tournamentId });
    console.log('Team count:', count); // Debug log
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting team count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamName } = req.body;
    const userId = req.user._id; // From JWT auth middleware

    console.log('Creating team with:', {
      tournamentId,
      teamName,
      userId
    });

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      console.log('Tournament not found:', tournamentId);
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if user already has a team in this tournament
    const existingTeam = await Team.findOne({
      tournament: tournamentId,
      createdBy: userId
    });

    if (existingTeam) {
      return res.status(400).json({ 
        error: 'You already created a team in this tournament' 
      });
    }

    // Create new team
    const team = new Team({
      name: teamName,
      tournament: tournamentId,
      createdBy: userId
    });

    await team.save();

    // Add creator as first team member
    const teamMember = new TeamMember({
      team: team._id,
      user: userId
    });

    await teamMember.save();

    // Populate team details
    const populatedTeam = await Team.findById(team._id)
      .populate('createdBy', 'username')
      .populate('tournament');

    console.log('Team created successfully:', populatedTeam);
    res.status(201).json(populatedTeam);

  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("members", "discordName");
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.joinTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user._id;

    // Check if team exists
    const team = await Team.findById(teamId).populate('tournament');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Create new team member
    const teamMember = new TeamMember({
      team: teamId,
      user: userId
    });

    await teamMember.save();

    res.status(201).json({ message: 'Successfully joined team' });
  } catch (error) {
    console.error('Error joining team:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await TeamMember.find({ team: teamId })
      .populate('user', 'username')
      .sort('joinedAt');

    res.json(members);
  } catch (error) {
    console.error('Error getting team members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
