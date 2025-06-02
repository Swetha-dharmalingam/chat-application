require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { initializeSocket } = require('./controllers/chatController');
const { startScheduler } = require('./scheduler');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR] Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[INFO] Connected to MongoDB');
    
    // Start the server only after DB connection
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`[INFO] Server running on port ${PORT}`);
      
      // Initialize Socket.io after server starts
      initializeSocket(server);
      
      // Start message scheduler after socket.io is initialized
      startScheduler();
    });
  })
  .catch(err => {
    console.error('[ERROR] MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[ERROR] Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[ERROR] Unhandled Rejection:', err);
});
