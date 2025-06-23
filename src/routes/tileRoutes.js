// src/routes/tileRoutes.js

const express = require("express");
const router = express.Router();
const { assignTile, completeTile } = require("../controllers/tileController");
// const {protect} = require("../middleware/authMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/assign", authMiddleware, assignTile);
router.post("/complete/:tileId", authMiddleware, completeTile);

module.exports = router;
