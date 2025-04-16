const Team = require("../models/Team");
const User = require("../models/User");

exports.createTeam = async (req, res) => {
  try {
    const { name, userId } = req.body;

    const newTeam = new Team({ name, members: [userId] });
    await newTeam.save();

    res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    const { teamId, userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Prevent duplicate members
    if (team.members.includes(userId)) {
      return res.status(400).json({ error: "User already in the team" });
    }

    // Enforce 2-member team rule
    if (team.members.length >= 2) {
      return res.status(400).json({ error: "Team is already full" });
    }

    team.members.push(userId);
    await team.save();

    res.json(team);
  } catch (error) {
    console.error("Error joining team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
