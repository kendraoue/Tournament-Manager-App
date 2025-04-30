const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique user per team
teamMemberSchema.index({ team: 1, user: 1 }, { unique: true });

// Middleware to prevent joining multiple teams in same tournament
teamMemberSchema.pre('save', async function(next) {
    try {
        // Get the team's tournament
        const team = await mongoose.model('Team').findById(this.team).populate('tournament');
        if (!team) {
            throw new Error('Team not found');
        }

        // Check if user is already in another team in this tournament
        const existingMembership = await mongoose.model('TeamMember')
            .findOne({
                user: this.user,
                team: { $ne: this.team }
            })
            .populate({
                path: 'team',
                match: { tournament: team.tournament }
            });

        if (existingMembership && existingMembership.team) {
            throw new Error('User is already in another team in this tournament');
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('TeamMember', teamMemberSchema); 