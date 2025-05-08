// Import mongoose for database schema and model creation
const mongoose = require("mongoose");

// Define the schema for the User model
const UserSchema = new mongoose.Schema({
  // Discord ID of the user (unique identifier from Discord)
  discordId: {
    type: String,
    required: true, // Discord ID is required
    unique: true, // Must be unique across all users
  },
  // Username of the user
  username: {
    type: String,
    required: true, // Username is required
  },
  // Avatar URL of the user (optional)
  avatar: {
    type: String,
  },
  // Email address of the user (optional, must be unique if provided)
  email: {
    type: String,
    unique: true, // Must be unique across all users
  },
  // Access token for the user (optional, used for authentication)
  accessToken: {
    type: String,
  },
  // Timestamp for when the user was created
  createdAt: {
    type: Date,
    default: Date.now, // Defaults to the current date and time
  },
});

// Export the User model
module.exports = mongoose.model("User", UserSchema);
