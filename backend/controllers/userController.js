// Import the User model to interact with the database
const User = require("../models/User");

/**
 * Controller to fetch the currently authenticated user's information.
 * This function retrieves the user's details based on the JWT payload (_id).
 *
 * @param {Object} req - The request object, which should include the authenticated user's data in `req.user`.
 * @param {Object} res - The response object used to send the result back to the client.
 */
exports.getMe = async (req, res) => {
  try {
    // 1. Validate that the request contains a valid user object with an _id
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized - No valid token" });
    }

    // 2. Find the user in the database using the _id from the JWT payload
    const user = await User.findById(req.user._id);

    // 3. Handle the case where the user is not found in the database
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Respond with the user's information
    res.json({
      discordId: user.discordId, // Discord ID of the user
      username: user.username, // Username of the user
      avatar: user.avatar, // Avatar URL of the user
      email: user.email, // Email of the user (may be undefined if not shared)
    });
  } catch (error) {
    // 5. Handle unexpected errors during the process
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
