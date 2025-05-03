const User = require("../models/User");
require("dotenv").config();
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const { CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } = process.env;
const JWT_SECRET = process.env.JWT_SECRET;

//Get Discord authentication token
exports.getToken = async (req, res) => {
  try {
    console.log("Received request to get token");

    // 1. Check for required env variables
    if (!CLIENT_ID || !CLIENT_SECRET || !JWT_SECRET) {
      console.error("Missing required environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // 2. Validate code in request body
    if (!req.body.code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // 3. Use a dedicated redirect URI (should match Discord app exactly)
    const redirectUri = req.body.redirect_uri || process.env.DISCORD_REDIRECT_URI;
    if (!redirectUri) {
      return res.status(500).json({ error: "Missing redirect URI" });
    }

    // 4. Exchange code for token
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

    let oauthData = await tokenResponse.json();

    if (!tokenResponse.ok || oauthData.error) {
      console.error("OAuth Error:", oauthData.error_description || oauthData.error);
      return res.status(400).json({ error: oauthData.error_description || oauthData.error });
    }

    // Only fetch user info if token exchange succeeded!
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${oauthData.access_token}` },
    });
    const userData = await userResponse.json();

    // 7. Store or update user in MongoDB
    let user = await User.findOne({ discordId: userData.id });
    if (!user) {
      user = new User({
        discordId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email, // may be undefined
      });
      await user.save();
    }

    // 8. Save user info in session
    req.session.userId = user._id;
    req.session.discordId = user.discordId;
    await req.session.save();

    // 9. Create JWT payload
    const payload = {
      _id: user._id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    };

    // 10. Sign JWT (expires in 1 day)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    // 11. Respond with user info and token
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
    console.error("Error exchanging token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.clearCookie("connect.sid"); // clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
