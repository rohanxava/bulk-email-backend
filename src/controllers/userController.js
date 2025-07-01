// controllers/userController.js
const UserModel = require('../models/User');

exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  await UserModel.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
};