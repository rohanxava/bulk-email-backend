const express = require('express');
const trackingController = require('../controllers/trackingController');
const router = express.Router();

router.get('/open/:id', trackingController.trackOpen);
router.get('/click/:id', trackingController.trackClick);

module.exports = router;
