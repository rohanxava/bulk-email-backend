// src/routes/tileRoutes.js

const express = require("express");
const router = express.Router();
const { assignTile, completeTile ,skipTile } = require("../controllers/tileController");
  const authMiddleware = require("../middleware/authMiddleware");

router.post("/assign", authMiddleware, assignTile);
router.post("/complete/:tileId", authMiddleware, completeTile);
router.post("/skip/:tileId", authMiddleware, skipTile);


module.exports = router;
