// Import the Express framework for creating routes
const express = require("express");

// Import the authentication controller functions
const { getToken } = require("../controllers/authController");
const { logout } = require("../controllers/authController");

// Create a new router instance
const router = express.Router();

/**
 * Route to handle Discord OAuth2 token exchange and user authentication.
 * This route calls the `getToken` controller to exchange an authorization code for an access token.
 *
 * @method POST
 * @access Public
 */
router.post("/getToken", getToken);

/**
 * Route to handle user logout.
 * This route calls the `logout` controller to destroy the user's session and clear the session cookie.
 *
 * @method POST
 * @access Public
 */
router.post("/logout", logout);

// Export the router to be used in the main application
module.exports = router;
