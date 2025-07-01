// routes/projects.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/', projectController.createProject);
router.get('/:userId', projectController.getProjectsByUser);

module.exports = router;