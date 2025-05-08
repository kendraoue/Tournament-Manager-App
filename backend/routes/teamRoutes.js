// Import the Express framework for creating routes
const express = require("express");
const router = express.Router();

// Import the team controller functions
const teamController = require("../controllers/teamController");

// Import the middleware for JWT authentication
const authenticateJWT = require("../middleware/auth");

/**
 * Route to get all teams.
 * This route calls the `getAllTeams` controller to retrieve all teams and their related data.
 *
 * @method GET
 * @access Public
 */
router.get("/teams", teamController.getAllTeams);

/**
 * Route to get teams for a specific tournament.
 * This route calls the `getTournamentTeams` controller to retrieve teams associated with a given tournament ID.
 *
 * @method GET
 * @access Public
 */
router.get(
  "/tournaments/:tournamentId/teams",
  teamController.getTournamentTeams
);

/**
 * Route to get members of a specific team.
 * This route calls the `getTeamMembers` controller to retrieve all members of a given team ID.
 *
 * @method GET
 * @access Public
 */
router.get("/teams/:teamId/members", teamController.getTeamMembers);

/**
 * Route to create a team for a tournament.
 * This route calls the `createTeam` controller to create a new team for a specific tournament.
 *
 * @method POST
 * @access Protected (requires JWT authentication)
 */
router.post(
  "/tournaments/:tournamentId/teams",
  authenticateJWT,
  teamController.createTeam
);

/**
 * Route to join a team.
 * This route calls the `joinTeam` controller to allow a user to join a specific team.
 *
 * @method POST
 * @access Protected (requires JWT authentication)
 */
router.post("/teams/:teamId/join", authenticateJWT, teamController.joinTeam);

/**
 * Route to get the team count for a specific tournament.
 * This route calls the `getTournamentTeamCount` controller to retrieve the number of teams in a tournament.
 *
 * @method GET
 * @access Public
 */
router.get(
  "/tournaments/:tournamentId/teams/count",
  teamController.getTournamentTeamCount
);

/**
 * Route to delete a team.
 * This route calls the `deleteTeam` controller to delete a specific team.
 *
 * @method DELETE
 * @access Protected (requires JWT authentication)
 */
router.delete("/teams/:teamId", authenticateJWT, teamController.deleteTeam);

/**
 * Route to leave a team.
 * This route calls the `leaveTeam` controller to allow a user to leave a specific team.
 *
 * @method POST
 * @access Protected (requires JWT authentication)
 */
router.post("/teams/:teamId/leave", authenticateJWT, teamController.leaveTeam);

/**
 * Route to remove a member from a team.
 * This route calls the `removeMember` controller to allow the team creator to remove a specific member.
 *
 * @method DELETE
 * @access Protected (requires JWT authentication)
 */
router.delete(
  "/teams/:teamId/members/:memberId",
  authenticateJWT,
  teamController.removeMember
);

// Export the router to be used in the main application
module.exports = router;
