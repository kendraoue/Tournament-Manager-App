const Tournament = require("../models/Tournament");
const User = require("../models/User");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

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
    console.log("Received request body:", req.body);
    const { name, type, maxTeams, startDateTime, discordId } = req.body;
    
    console.log("Extracted values:", {
      name,
      type,
      maxTeams,
      startDateTime,
      discordId
    });

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
      createdBy: user._id,
    });

    await newTournament.save();
    console.log("New Tournament ID:", newTournament._id);
    const populatedTournament = await Tournament.findById(newTournament._id)
      .populate("createdBy", "username discordId");
    
    console.log("Created tournament:", populatedTournament);
    res.status(201).json(populatedTournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// DELETE a tournament (only if owned by user)
const deleteTournament = async (req, res) => {
  try {
    console.log("Request params:", req.params);
    console.log("Request user:", req.user);

    if (!req.user) {
      console.error("No user found on request object!");
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }

    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }

    // Find the tournament
    const tournament = await Tournament.findById(id);
    console.log(`Tournament to delete:`, tournament);

    // If not found, return 404
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check if the user is authorized to delete
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (tournament.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this tournament" });
    }

    // Delete the tournament
    await Tournament.findByIdAndDelete(id);
    res.json({ message: "Tournament deleted successfully" });
  } catch (err) {
    console.error("Error deleting tournament:", err.message, err.stack);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports = {
  getAllTournaments,
  createTournament,
  deleteTournament,
};
