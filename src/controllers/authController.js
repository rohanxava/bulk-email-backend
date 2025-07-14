const User = require('../models/User');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { EMAIL_FROM, EMAIL_PASSWORD } = process.env;


exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password, createdBy, canCreateProject } = req.body;

    if (!email || !name || !role || !password) {
      return res
        .status(400)
        .json({ message: "Email, name, password, and role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


const user = new User({
  name,
  email,
  role,
  password: hashedPassword,
  createdBy,
  canCreateProject: canCreateProject || false,
});

    await user.save();

    // ✅ Send Email with credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your XAVA MailFlow Login Credentials",
      text: `Hello ${user.name},\n\nYour MailFlow account has been created.\n\nLogin Email: ${user.email}\nPassword: ${password}\n\nPlease login and change your password.\n\nThanks,\n XAVA MailFlow Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User created and credentials emailed",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        createdBy: user.createdBy,
      },
    });
  } catch (err) {
    console.error("User creation error:", err);
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Save OTP temporarily (in-memory or DB, here using DB)
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    // ✅ Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your OTP for MailFlow Login',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    // ✅ Don't send token yet — only after OTP is verified
    res.status(200).json({
      message: 'OTP sent to email',
      email: user.email,
      userId: user._id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user || user.otp !== otp || Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // ✅ Clear OTP fields
  user.otp = null;
  user.otpExpiresAt = null;

  // ✅ Mark user as verified
  user.hasVerified = true;

  await user.save();

  const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    createdBy: user.createdBy || null, // ✅ add this
    canCreateProject: user.canCreateProject || false, // ✅ optional but recommended
  },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);

  // ✅ Send response with verified user
  res.json({
    message: 'OTP verified',
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasVerified: user.hasVerified  // ✅ now true
    }
  });
};





exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000; 
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Your OTP for MailFlow Login (Resent)',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
