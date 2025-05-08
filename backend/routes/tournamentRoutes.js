// Import the Express framework for creating routes
const express = require("express");
const router = express.Router();

// Import the tournament controller functions
const tournamentController = require("../controllers/tournamentController");

// Import the middleware for JWT authentication
const authenticateJWT = require("../middleware/auth");

/**
 * Route to get all tournaments.
 * This route calls the `getAllTournaments` controller to retrieve all tournaments and their related data.
 *
 * @method GET
 * @access Public
 */
router.get("/tournaments", tournamentController.getAllTournaments);

/**
 * Route to create a new tournament.
 * This route calls the `createTournament` controller to create a new tournament.
 *
 * @method POST
 * @access Protected (requires JWT authentication)
 */
router.post(
  "/tournaments",
  authenticateJWT,
  tournamentController.createTournament
);

/**
 * Route to delete a tournament.
 * This route calls the `deleteTournament` controller to delete a specific tournament by its ID.
 *
 * @method DELETE
 * @access Protected (requires JWT authentication)
 */
router.delete(
  "/tournaments/:id",
  authenticateJWT,
  tournamentController.deleteTournament
);

// Export the router to be used in the main application
module.exports = router;
