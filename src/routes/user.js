// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
router.post('/create', userController.createUser);
router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);

module.exports = router;