// Import mongoose for database schema and model creation
const mongoose = require("mongoose");

// Define the schema for the TeamMember model
const teamMemberSchema = new mongoose.Schema({
  // Reference to the team the member belongs to
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team", // Links to the Team model
    required: true, // Team reference is required
  },
  // Reference to the user who is a member of the team
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the User model
    required: true, // User reference is required
  },
  // Timestamp for when the user joined the team
  joinedAt: {
    type: Date,
    default: Date.now, // Defaults to the current date and time
  },
});

// Compound index to ensure a user can only join a team once
teamMemberSchema.index({ team: 1, user: 1 }, { unique: true });

// Export the TeamMember model
module.exports = mongoose.model("TeamMember", teamMemberSchema);
