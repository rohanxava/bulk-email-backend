// --- app.js ---
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authMiddleware = require('./src/middleware/authMiddleware');
const roleMiddleware = require('./src/middleware/roleMiddleware');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const projectRoutes = require('./src/routes/projects');
const emailRoutes = require('./src/routes/emails');
const templateRoutes = require('./src/routes/templates');
const campaignRoutes = require('./src/routes/campaign');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, roleMiddleware('admin'), userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/emails', authMiddleware, emailRoutes);
app.use('/api/campaign', authMiddleware, campaignRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));