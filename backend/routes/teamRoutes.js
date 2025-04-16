const express = require("express");
const {
  createTeam,
  getTeams,
  joinTeam,
} = require("../controllers/teamController");

const router = express.Router();

router.post("/create", createTeam);
router.post("/join", joinTeam);
router.get("/", getTeams);

module.exports = router;
