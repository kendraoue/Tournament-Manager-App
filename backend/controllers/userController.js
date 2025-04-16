const User = require("../models/User");
const fetch = require("node-fetch"); // Static Import (you can keep dynamic import if necessary)

exports.getMe = async (req, res) => {
  try {
    // Ensure the token is present in the Authorization header
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Fetch user info from Discord API
    const meResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${token}` },
    });

    if (!meResponse.ok) {
      return res.status(403).json({ error: "Invalid Discord token" });
    }

    const userData = await meResponse.json();

    // Check if user exists in MongoDB
    let user = await User.findOne({ discordId: userData.id });

    if (!user) {
      // Save new user in MongoDB if not found
      user = new User({
        discordId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email || null,
        accessToken: token, // You can choose to store accessToken securely, if necessary
      });
      await user.save();
    }

    // Return user data without the accessToken
    res.json({
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
