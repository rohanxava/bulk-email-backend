const express = require("express");
const router = express.Router();
const { getUserAnnotations, getLeaderboard } = require("../controllers/userController");

router.get("/leaderboard", getLeaderboard);
router.get("/:id/annotations", getUserAnnotations);

module.exports = router;
  