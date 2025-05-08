// Import mongoose for database schema and model creation
const mongoose = require("mongoose");

// Define the schema for the Team model
const teamSchema = new mongoose.Schema({
  // Name of the team
  name: {
    type: String,
    required: true, // Team name is required
  },
  // Reference to the tournament the team belongs to
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament", // Links to the Tournament model
    required: true, // Tournament reference is required
  },
  // Reference to the user who created the team
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model
    required: true, // Creator reference is required
  },
  // Array of members in the team, each referencing a User
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links to the User model
    },
  ],
  // Timestamp for when the team was created
  createdAt: {
    type: Date,
    default: Date.now, // Defaults to the current date and time
  },
});

/**
 * Middleware to enforce team size limit before saving.
 * This function checks the tournament type and ensures the team does not exceed the maximum allowed size.
 *
 * @param {Function} next - The next middleware function to call.
 */
teamSchema.pre("save", async function (next) {
  try {
    // 1. Find the tournament associated with the team
    const tournament = await mongoose
      .model("Tournament")
      .findById(this.tournament);
    if (!tournament) {
      throw new Error("Tournament not found"); // Throw an error if the tournament does not exist
    }

    // 2. Determine the maximum team size based on the tournament type
    const maxTeamSize = {
      solos: 1,
      duos: 2,
      trios: 3,
    }[tournament.type];

    // 3. Check if the team exceeds the maximum size
    if (this.members.length > maxTeamSize) {
      throw new Error(`Team has reached maximum size of ${maxTeamSize}`);
    }

    // 4. Proceed to save the team if validation passes
    next();
  } catch (error) {
    // 5. Pass any errors to the next middleware
    next(error);
  }
});

// Export the Team model
module.exports = mongoose.model("Team", teamSchema);
