module.exports = (requiredRole) => {
  return (req, res, next) => {
    console.log('🛂 Checking role for user:', {
      id: req.user?._id,
      role: req.user?.role,
      required: requiredRole,
    });

    if (req.user?.role !== requiredRole) {
      console.log('❌ Forbidden: Insufficient role');
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    console.log('✅ Role authorized');
    next();
  };
};
