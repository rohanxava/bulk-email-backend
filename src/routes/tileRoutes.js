const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getAssignedTile, submitTile } = require('../controllers/tileController');

router.get('/assigned', protect, getAssignedTile);
router.post('/submit', protect, submitTile);

module.exports = router;