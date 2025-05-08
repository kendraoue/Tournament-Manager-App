// Import the User model for database operations
const User = require("../models/User");

// Load environment variables from .env file
require("dotenv").config();

// Import node-fetch for making HTTP requests
const fetch = require("node-fetch");

// Import jsonwebtoken for creating and verifying JWTs
const jwt = require("jsonwebtoken");

// Destructure required environment variables
const { CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } = process.env;
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Controller to handle Discord OAuth2 token exchange and user authentication.
 * This function exchanges an authorization code for an access token, fetches
 * user information from Discord, and stores or updates the user in the database.
 *
 * @param {Object} req - The request object, which should include the authorization code in `req.body.code`.
 * @param {Object} res - The response object used to send the result back to the client.
 */
exports.getToken = async (req, res) => {
  try {
    console.log("Received request to get token");

    // 1. Validate that required environment variables are present
    if (!CLIENT_ID || !CLIENT_SECRET || !JWT_SECRET) {
      console.error("Missing required environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // 2. Validate the presence of the authorization code in the request body
    if (!req.body.code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // 3. Use a dedicated redirect URI (must match the one configured in the Discord app)
    const redirectUri =
      req.body.redirect_uri || process.env.DISCORD_REDIRECT_URI;
    if (!redirectUri) {
      return res.status(500).json({ error: "Missing redirect URI" });
    }

    // 4. Exchange the authorization code for an access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: req.body.code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Parse the response from Discord
    let oauthData = await tokenResponse.json();

    // 5. Handle errors during the token exchange process
    if (!tokenResponse.ok || oauthData.error) {
      console.error(
        "OAuth Error:",
        oauthData.error_description || oauthData.error
      );
      return res
        .status(400)
        .json({ error: oauthData.error_description || oauthData.error });
    }

    // 6. Fetch user information from Discord using the access token
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${oauthData.access_token}` },
    });
    const userData = await userResponse.json();

    // 7. Store or update the user in the MongoDB database
    let user = await User.findOne({ discordId: userData.id });
    if (!user) {
      // Create a new user if one does not already exist
      user = new User({
        discordId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email, // Email may be undefined if not shared by the user
      });
      await user.save();
    }

    // 8. Save user information in the session for server-side session management
    req.session.userId = user._id;
    req.session.discordId = user.discordId;
    await req.session.save();

    // 9. Create a payload for the JWT
    const payload = {
      _id: user._id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    };

    // 10. Sign the JWT with a 1-day expiration
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // 11. Respond with user information and the signed JWT
    res.json({
      message: "Authentication successful",
      user: {
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        discordId: user.discordId,
      },
      token,
    });
  } catch (error) {
    // 12. Handle unexpected errors during the token exchange process
    console.error("Error exchanging token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Controller to handle user logout.
 * This function destroys the user's session and clears the session cookie.
 *
 * @param {Object} req - The request object, which includes the session to be destroyed.
 * @param {Object} res - The response object used to confirm the logout process.
 */
exports.logout = async (req, res) => {
  try {
    // 1. Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({ error: "Failed to log out" });
      }
      // 2. Clear the session cookie
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    // 3. Handle unexpected errors during logout
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
