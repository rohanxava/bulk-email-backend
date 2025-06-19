const express = require('express');
const { uploadMap, getMaps } = require('../controllers/mapController');
const protect = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware')('admin');

const router = express.Router();
router.post('/upload', protect, isAdmin, uploadMap);
router.get('/', protect, isAdmin, getMaps);

module.exports = router;
