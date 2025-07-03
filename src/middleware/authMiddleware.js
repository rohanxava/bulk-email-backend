const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log('🔐 Incoming Auth Token:', token); 

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('📥 Decoded JWT Payload:', decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('🚫 User not found in DB');
      return res.status(403).json({ message: 'Unauthorized or unverified' });
    }

    if (!user.hasVerified) {
      console.log('⚠️ User found but not verified');
      return res.status(403).json({ message: 'Unauthorized or unverified' });
    }

    user.lastActive = new Date();
    user.isOnline = true;   
    await user.save();
    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Invalid token or error verifying JWT:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
