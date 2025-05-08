// Import mongoose for database schema and model creation
const mongoose = require("mongoose");

// Define the schema for the Tournament model
const tournamentSchema = new mongoose.Schema({
  // Name of the tournament
  name: {
    type: String,
    required: true, // Tournament name is required
  },
  // Type of the tournament (solos, duos, or trios)
  type: {
    type: String,
    enum: ["solos", "duos", "trios"], // Allowed values for tournament type
    required: true, // Tournament type is required
  },
  // Maximum size of a team (calculated based on the tournament type)
  maxTeamSize: {
    type: Number,
  },
  // Maximum number of teams allowed in the tournament
  maxTeams: {
    type: Number,
    required: true, // Maximum number of teams is required
  },
  // Start date and time of the tournament
  startDateTime: {
    type: Date,
    required: true, // Start date and time are required
  },
  // Timestamp for when the tournament was created
  createdAt: {
    type: Date,
    default: Date.now, // Defaults to the current date and time
  },
  // Reference to the user who created the tournament
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model
    required: true, // Creator reference is required
  },
});

/**
 * Middleware to set the maximum team size before saving.
 * This function calculates the `maxTeamSize` based on the tournament type.
 *
 * @param {Function} next - The next middleware function to call.
 */
tournamentSchema.pre("save", function (next) {
  // Map tournament types to their corresponding maximum team sizes
  const typeToSize = {
    solos: 1,
    duos: 2,
    trios: 3,
  };

  // Set the `maxTeamSize` field based on the tournament type
  this.maxTeamSize = typeToSize[this.type];

  // Proceed to save the tournament
  next();
});

// Export the Tournament model
module.exports = mongoose.model("Tournament", tournamentSchema);
