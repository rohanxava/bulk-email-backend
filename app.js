const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const mapRoutes = require('./src/routes/mapRoutes');
const tileRoutes = require('./src/routes/tileRoutes');
const userRoutes = require('./src/routes/userRoutes');


const app = express();

app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static('uploads')); // to serve uploaded files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/tiles', tileRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('LiDAR Dashboard API Running'));

module.exports = app;
