const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");
const authenticateJWT = require("../middleware/auth");

router.get("/tournaments", tournamentController.getAllTournaments);
router.post("/tournaments", authenticateJWT, tournamentController.createTournament);
router.delete("/tournaments/:id", authenticateJWT, tournamentController.deleteTournament);

module.exports = router;
