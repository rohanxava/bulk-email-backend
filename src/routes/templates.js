

// routes/templates.js
const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.post('/', templateController.createTemplate);
router.get('/:userId', templateController.getTemplatesByUser);

module.exports = router;