const express = require("express");
 
const router = express.Router();
 
const { getUserAnnotations, getLeaderboard } = require("../controllers/userController");
 
const authMiddleware = require('../middleware/authMiddleware');
 
 
 
router.get("/leaderboard", authMiddleware, getLeaderboard);
 
router.get("/:id/annotations", getUserAnnotations);
module.exports = router;
