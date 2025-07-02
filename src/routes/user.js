// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get("/users", userController.getAllUsers);
router.delete("/users/:id", userController.deleteUser);
router.get('/me', userController.getCurrentUser);
router.put("/users/:id", userController.updateUser);

module.exports = router;