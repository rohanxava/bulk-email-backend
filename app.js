// --- app.js ---
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authMiddleware = require('./src/middleware/authMiddleware');
const roleMiddleware = require('./src/middleware/roleMiddleware');
const path = require('path')
// Load environment variables
dotenv.config();
 
// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/user');
const projectRoutes = require('./src/routes/projects');
const emailRoutes = require('./src/routes/emails');
const templateRoutes = require('./src/routes/templates');
const campaignRoutes = require('./src/routes/campaign');
const meRoutes = require('./src/routes/me');
const subscriberRoutes = require('./src/routes/subscriber');
const analyticRoutes = require('./src/routes/analytics');
const trackingRoutes = require('./src/routes/tracking');
const generatetemplateroutes = require('./src/routes/generatetemplate')
const contactListRoutes = require('./src/routes/list')



// const pinguserroutes = require('./src/routes/userping')
 
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

 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, roleMiddleware('super_admin'), userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/emails', authMiddleware, emailRoutes);
app.use('/api/campaign', authMiddleware, campaignRoutes);
app.use('/api/templates', authMiddleware, templateRoutes);
app.use('/api/me', authMiddleware, meRoutes);
app.use('/api/subscriber', authMiddleware, subscriberRoutes);
app.use('/api/analytics', authMiddleware, analyticRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api',generatetemplateroutes);
app.use('/api/lists', contactListRoutes)

 
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
require('./src/cron/scheduler');
