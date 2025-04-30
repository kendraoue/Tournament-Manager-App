const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authenticateJWT = require('../middleware/auth');

// Create a team
router.post('/tournaments/:tournamentId/teams', authenticateJWT, teamController.createTeam);

// Join a team
router.post('/teams/:teamId/join', authenticateJWT, teamController.joinTeam);

// Get team members
router.get('/teams/:teamId/members', teamController.getTeamMembers);

// Get team count for a tournament
router.get('/tournaments/:tournamentId/teams/count', teamController.getTournamentTeamCount);

module.exports = router;
