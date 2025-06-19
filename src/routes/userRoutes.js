const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const User = require('../models/User');

// ✅ Add this route
router.get('/', getAllUsers); // Now /api/users will work

// Existing protected route
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

// Optional: add this route too if needed
// router.put('/role', updateUserRole);

module.exports = router;
