const Tournament = require("../models/Tournament");
const User = require("../models/User");
const fetch = require("node-fetch");

// GET all tournaments
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate(
      "createdBy",
      "username"
    );
    res.json(tournaments);
  } catch (err) {
    console.error("Failed to fetch tournaments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST create a tournament
const createTournament = async (req, res) => {
  try {
    const { name, type, maxTeams, startDateTime, discordId } = req.body;

    if (!discordId) {
      return res.status(400).json({ error: "Missing user information" });
    }

    // Find user in MongoDB using discordId
    const user = await User.findOne({ discordId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newTournament = new Tournament({
      name,
      type,
      maxTeams,
      startDateTime,
      createdBy: user._id, // Use MongoDB ObjectId
    });

    await newTournament.save();

    res.status(201).json(newTournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE a tournament (only if owned by user)
const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    if (tournament.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this tournament" });
    }

    await Tournament.findByIdAndDelete(id);
    res.json({ message: "Tournament deleted successfully" });
  } catch (err) {
    console.error("Error deleting tournament:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllTournaments,
  createTournament,
  deleteTournament,
};
