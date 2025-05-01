const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authenticateJWT = require('../middleware/auth');

// Get all teams
router.get('/teams', teamController.getAllTeams);

// Get teams for a specific tournament
router.get('/tournaments/:tournamentId/teams', teamController.getTournamentTeams);

// Get team members
router.get('/teams/:teamId/members', teamController.getTeamMembers);

// Create a team for a tournament
router.post('/tournaments/:tournamentId/teams', authenticateJWT, teamController.createTeam);

// Join a team
router.post('/teams/:teamId/join', authenticateJWT, teamController.joinTeam);

// Get team count for a tournament
router.get('/tournaments/:tournamentId/teams/count', teamController.getTournamentTeamCount);

// Delete a team
router.delete('/teams/:teamId', authenticateJWT, teamController.deleteTeam);

// Leave a team
router.post('/teams/:teamId/leave', authenticateJWT, teamController.leaveTeam);

// Remove a member from a team
router.delete('/teams/:teamId/members/:memberId', authenticateJWT, teamController.removeMember);

module.exports = router;
