const User = require("../models/User");
require("dotenv").config();

const { CLIENT_ID, CLIENT_SECRET, FRONTEND_URL } = process.env;
const fetch = require("node-fetch");

exports.getToken = async (req, res) => {
  try {
    console.log("Received request to get token");
    if (!req.body.code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    // Process the token exchange
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: req.body.code,
        grant_type: "authorization_code",
        redirect_uri: FRONTEND_URL,
        scope: "identify email",
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const oauthData = await tokenResponse.json();
    if (oauthData.error) {
      console.error("OAuth Error:", oauthData.error_description);
      return res.status(400).json({ error: oauthData.error_description });
    }

    // Fetch user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${oauthData.access_token}` },
    });

    const userData = await userResponse.json();

    console.log("User Data:", userData); // Log user data

    // Store user in MongoDB
    let user = await User.findOne({ discordId: userData.id });

    if (!user) {
      user = new User({
        discordId: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        email: userData.email,
        accessToken: oauthData.access_token,
      });
      await user.save();
    }

    res.json({ token: oauthData.access_token, user });
  } catch (error) {
    console.error("Error exchanging token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];

    // Revoke the Discord OAuth token
    const revokeResponse = await fetch(
      "https://discord.com/api/oauth2/token/revoke",
      {
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          token: token, // The token to revoke
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!revokeResponse.ok) {
      return res.status(400).json({ error: "Failed to revoke token" });
    }

    // Destroy session if necessary
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
