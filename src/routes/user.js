const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware')
// No redundant /users prefix, as it's already mounted at /api/users
router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getUserById);
router.post('/ping', userController.pingUser);

module.exports = router;