const User = require("../models/User");
require("dotenv").config();
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

const { CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } = process.env;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Set this in your .env!

exports.getToken = async (req, res) => {
  try {
    console.log("Received request to get token");

    if (!req.body.code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // Use redirect_uri from frontend if provided, else fallback to env
    const redirectUri = req.body.redirect_uri || FRONTEND_URL;

    // Exchange code for token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: req.body.code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        scope: "identify email",
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const oauthData = await tokenResponse.json();

    if (oauthData.error) {
      console.error("OAuth Error:", oauthData.error_description);
      return res.status(400).json({ error: oauthData.error_description });
    }

    // Fetch user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${oauthData.access_token}` },
    });

    const userData = await userResponse.json();

    console.log("User Data:", userData);

    // Store or update user in MongoDB
    let user = await User.findOne({ discordId: userData.id });

    if (!user) {
      user = new User({
        discordId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
      });
      await user.save();
    }

    // ✅ Save the user's id inside the session
    req.session.userId = user._id;
    req.session.discordId = user.discordId; // optional, if you want it
    await req.session.save(); // ensure session is saved

    // Create JWT payload
    const payload = {
      _id: user._id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
    };

    // Sign JWT (expires in 1 day)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Authentication successful",
      user: {
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        discordId: user.discordId,
      },
      token, // <-- JWT here
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
