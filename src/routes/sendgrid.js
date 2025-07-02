const express = require("express");
const {
  addSendGridKey,
  getSendGridKey,
  updateSendGridKey,
  deleteSendGridKey,
} = require("../controllers/sendGridKeyController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all routes using your auth middleware
router.use(authMiddleware);

// Route: POST /api/sendgrid ➝ Add new key
router.post("/", addSendGridKey);

// Route: GET /api/sendgrid/:projectId ➝ Get key for a project
router.get("/:projectId", getSendGridKey);

// Route: PUT /api/sendgrid/:projectId ➝ Update key
router.put("/:projectId", updateSendGridKey);

// Route: DELETE /api/sendgrid/:projectId ➝ Delete key
router.delete("/:projectId", deleteSendGridKey);

module.exports = router;
