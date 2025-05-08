// Import required models and libraries
const Tournament = require("../models/Tournament");
const User = require("../models/User");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

/**
 * Controller to get all tournaments.
 * This function retrieves all tournaments and populates the `createdBy` field with user information.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object used to send the result back to the client.
 */
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate("createdBy", "username");
    res.json(tournaments);
  } catch (err) {
    console.error("Failed to fetch tournaments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controller to create a new tournament.
 * This function creates a tournament and associates it with the user who created it.
 *
 * @param {Object} req - The request object, which includes tournament details in `req.body`.
 * @param {Object} res - The response object used to send the result back to the client.
 */
const createTournament = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { name, type, maxTeams, startDateTime, discordId } = req.body;

    console.log("Extracted values:", { name, type, maxTeams, startDateTime, discordId });

    // 1. Validate that the `discordId` is provided
    if (!discordId) {
      return res.status(400).json({ error: "Missing user information" });
    }

    // 2. Find the user in the database using the `discordId`
    const user = await User.findOne({ discordId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3. Create a new tournament with the provided details
    const newTournament = new Tournament({
      name,
      type,
      maxTeams,
      startDateTime,
      createdBy: user._id,
    });

    // 4. Save the tournament to the database
    await newTournament.save();
    console.log("New Tournament ID:", newTournament._id);

    // 5. Populate the `createdBy` field with user details
    const populatedTournament = await Tournament.findById(newTournament._id).populate(
      "createdBy",
      "username discordId"
    );

    console.log("Created tournament:", populatedTournament);

    // 6. Respond with the created tournament
    res.status(201).json(populatedTournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Controller to delete a tournament.
 * This function deletes a tournament if the user is authorized to do so.
 *
 * @param {Object} req - The request object, which includes `req.params.id` for the tournament ID.
 * @param {Object} res - The response object used to confirm the deletion.
 */
const deleteTournament = async (req, res) => {
  try {
    console.log("Request params:", req.params);
    console.log("Request user:", req.user);

    // 1. Validate that the user is authenticated
    if (!req.user) {
      console.error("No user found on request object!");
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }

    const { id } = req.params;

    // 2. Validate the format of the tournament ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }

    // 3. Find the tournament in the database
    const tournament = await Tournament.findById(id);
    console.log("Tournament to delete:", tournament);

    // 4. Handle the case where the tournament is not found
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // 5. Check if the user is authorized to delete the tournament
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (tournament.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this tournament" });
    }

    // 6. Delete the tournament from the database
    await Tournament.findByIdAndDelete(id);

    // 7. Respond with a success message
    res.json({ message: "Tournament deleted successfully" });
  } catch (err) {
    console.error("Error deleting tournament:", err.message, err.stack);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Export the controllers
module.exports = {
  getAllTournaments,
  createTournament,
  deleteTournament,
};
