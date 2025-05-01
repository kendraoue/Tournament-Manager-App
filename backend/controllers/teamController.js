const Team = require("../models/Team");
const TeamMember = require("../models/TeamMember");
const Tournament = require("../models/Tournament");
const User = require("../models/User");

// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('createdBy', 'username')
            .populate('members', 'username')
            .populate('tournament', 'name type');
        res.json(teams);
    } catch (error) {
        console.error('Error getting all teams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get teams for a specific tournament
exports.getTournamentTeams = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const teams = await Team.find({ tournament: tournamentId })
            .populate('createdBy', 'username')
            .populate('members', 'username')
            .populate('tournament', 'name type');
        res.json(teams);
    } catch (error) {
        console.error('Error getting tournament teams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get team members
exports.getTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId)
            .populate('members', 'username discordId');
        
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        
        res.json(team.members);
    } catch (error) {
        console.error('Error getting team members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create a team
exports.createTeam = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const { teamName } = req.body;
        const userId = req.user._id;

        // Find tournament
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        // Check if user already has a team in this tournament
        const existingTeam = await Team.findOne({
            tournament: tournamentId,
            members: userId
        });

        if (existingTeam) {
            return res.status(400).json({ 
                error: 'You already have a team in this tournament' 
            });
        }

        // Create new team
        const team = new Team({
            name: teamName,
            tournament: tournamentId,
            createdBy: userId,
            members: [userId]
        });

        await team.save();

        // Create team member record for creator
        await TeamMember.create({
            team: team._id,
            user: userId
        });

        // Return populated team
        const populatedTeam = await Team.findById(team._id)
            .populate('members', 'username')
            .populate('createdBy', 'username')
            .populate('tournament', 'name type');

        res.status(201).json(populatedTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: error.message });
    }
};

// Join a team
exports.joinTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        // Check if user is already a member of this team
        const existingMembership = await TeamMember.findOne({
            team: teamId,
            user: userId
        });

        if (existingMembership) {
            return res.status(400).json({ 
                error: 'You are already a member of this team' 
            });
        }

        // Find the team and its tournament
        const team = await Team.findById(teamId).populate('tournament');
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check team size limit
        const maxTeamSize = {
            'solos': 1,
            'duos': 2,
            'trios': 3
        }[team.tournament.type];

        if (team.members.length >= maxTeamSize) {
            return res.status(400).json({ error: 'Team is full' });
        }

        // Add user to team members array
        if (!team.members.includes(userId)) {
            team.members.push(userId);
            await team.save();
        }

        // Create team member record
        await TeamMember.create({
            team: teamId,
            user: userId
        });

        // Return updated team with populated fields
        const updatedTeam = await Team.findById(teamId)
            .populate('members', 'username discordId')
            .populate('createdBy', 'username')
            .populate('tournament', 'name type');

        res.json(updatedTeam);
    } catch (error) {
        console.error('Error joining team:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get team count for a tournament
exports.getTournamentTeamCount = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const count = await Team.countDocuments({ tournament: tournamentId });
        res.json({ count });
    } catch (error) {
        console.error('Error getting team count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a team
exports.deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        // Find the team
        const team = await Team.findById(teamId)
            .populate('createdBy')
            .populate('tournament');

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if the user is the team creator
        if (team.createdBy._id.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only team creator can delete the team' });
        }

        // Delete all team members
        await TeamMember.deleteMany({ team: teamId });

        // Delete the team
        await Team.findByIdAndDelete(teamId);

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).json({ error: error.message });
    }
};

// Leave a team
exports.leaveTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is the team creator
        if (team.createdBy.toString() === userId.toString()) {
            return res.status(400).json({ error: 'Team creator cannot leave. Please delete the team instead.' });
        }

        // Remove user from team members
        team.members = team.members.filter(memberId => 
            memberId.toString() !== userId.toString()
        );
        await team.save();

        // Remove TeamMember record
        await TeamMember.deleteOne({ team: teamId, user: userId });

        res.json({ message: 'Successfully left team' });
    } catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const userId = req.user._id;

        // Find the team
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if the requester is the team creator
        if (team.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Only team creator can remove members' });
        }

        // Check if trying to remove the creator
        if (memberId === team.createdBy.toString()) {
            return res.status(400).json({ error: 'Cannot remove team creator' });
        }

        // Remove member from team
        team.members = team.members.filter(id => id.toString() !== memberId);
        await team.save();

        // Remove TeamMember record
        await TeamMember.deleteOne({ team: teamId, user: memberId });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ error: error.message });
    }
};
