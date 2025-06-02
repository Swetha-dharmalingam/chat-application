const Message = require('../models/Message');
const ScheduledMessage = require('../models/ScheduledMessage');
const User = require('../models/User');
let io;

exports.initializeSocket = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join', (userId) => {
      if (!userId) {
        console.error('Invalid userId provided to join:', userId);
        return;
      }
      
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
      
      // Send acknowledgment
      socket.emit('joined', { room: userId, status: 'success' });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Global error handling
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
  });

  console.log('Socket.io initialized');
};

// Function to get the initialized io instance
exports.getIo = () => {
  if (!io) {
    console.warn('[WARN] Socket.io instance not yet available.');
  }
  return io;
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });

    await message.save();

    // Populate sender details for the receiver
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    // Emit the message to the receiver
    io.to(receiverId).emit('newMessage', populatedMessage);
    io.to(senderId).emit('newMessage', populatedMessage);

    res.json(populatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.scheduleMessage = async (req, res) => {
  try {
    const { receiverId, content, scheduledTime } = req.body;
    const senderId = req.user.id;

    // Validate scheduled time
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduled time format' });
    }

    // Ensure scheduled time is in the future
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ message: 'Scheduled time must be in the future' });
    }

    const scheduledMessage = new ScheduledMessage({
      sender: senderId,
      receiver: receiverId,
      content,
      scheduledTime: scheduledDate
    });

    await scheduledMessage.save();

    // Populate sender and receiver details for the response
    const populatedMessage = await ScheduledMessage.findById(scheduledMessage._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.json(populatedMessage);
  } catch (err) {
    console.error('Schedule message error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort('timestamp');

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get distinct user IDs from messages
    const sentMessages = await Message.distinct('receiver', { 
      sender: currentUserId 
    });
    
    const receivedMessages = await Message.distinct('sender', { 
      receiver: currentUserId 
    });

    // Combine and remove duplicates
    const allContacts = [...new Set([...sentMessages, ...receivedMessages])];
    
    // Remove current user ID
    const filteredUsers = allContacts.filter(id => 
      id.toString() !== currentUserId.toString()
    );

    // Get user details
    const users = await User.find({
      _id: { $in: filteredUsers }
    }).select('name email');

    res.json(users);
  } catch (err) {
    console.error('Contacts error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

