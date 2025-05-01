const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to enforce team size limit before saving
teamSchema.pre('save', async function(next) {
  try {
    const tournament = await mongoose.model('Tournament').findById(this.tournament);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const maxTeamSize = {
      'solos': 1,
      'duos': 2,
      'trios': 3
    }[tournament.type];

    if (this.members.length > maxTeamSize) {
      throw new Error(`Team has reached maximum size of ${maxTeamSize}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Team", teamSchema);
