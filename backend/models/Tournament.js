const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["solos", "duos", "trios"],
    required: true,
  },
  maxTeamSize: { type: Number },
  maxTeams: { type: Number },
  startDateTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

tournamentSchema.pre("save", function (next) {
  const typeToSize = {
    solos: 1,
    duos: 2,
    trios: 3,
  };
  this.maxTeamSize = typeToSize[this.type];
  next();
});
module.exports = mongoose.model("Tournament", tournamentSchema);
