const bcrypt = require("bcryptjs");
 
const jwt = require("jsonwebtoken");
 
const User = require("../models/User");
 exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
 
    const existingUser = await User.findOne({ email });
 
    if (existingUser) return res.status(400).json({ msg: "Email already in use" });
    const hashedPassword = await bcrypt.hash(password, 10);
 
 
 
    const user = await User.create({ username, email, password: hashedPassword, role });
 
 
 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
 
 
 
    res.status(201).json({
 
      token,
 
      user: {
 
        id: user._id,
 
        username: user.username,
 
        role: user.role,
 
        email: user.email,
 
      },
 
    });
 
  } catch (err) {
 
    // console.error("Registration error:", err);
 
    res.status(500).json({ msg: "Registration failed" });
 
  }
 
};
 
exports.login = async (req, res) => {
  const { email, password } = req.body;
 
  try {
 
    const user = await User.findOne({ email });
 
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
 
 
 
    const isMatch = await bcrypt.compare(password, user.password);
 
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
 
 
 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
 
    res.json({
 
      token,
 
      user: {
 
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      }
 
    });
 
  } catch (err) {
 
    res.status(500).json({ msg: "Login failed" });
 
  }
 
};