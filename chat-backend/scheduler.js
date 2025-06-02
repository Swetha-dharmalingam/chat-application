const cron = require('node-cron');
const ScheduledMessage = require('./models/ScheduledMessage');
const Message = require('./models/Message');
const chatController = require('./controllers/chatController'); // Import the whole module

let isSchedulerRunning = false;

async function processScheduledMessages() {
  // Get the initialized io instance
  const io = chatController.getIo();
  if (!io) {
    console.log('[DEBUG] Socket.io not initialized yet. Skipping scheduler run.');
    return;
  }

  try {
    const now = new Date();
    console.log('\n[DEBUG] Scheduler check at:', now.toISOString());

    const messagesToSend = await ScheduledMessage.find({
      scheduledTime: { $lte: now },
      sent: false
    }).populate('sender receiver');

    console.log(`[DEBUG] Found ${messagesToSend.length} messages to send`);

    for (const scheduledMessage of messagesToSend) {
      try {
        console.log('[DEBUG] Processing message:', {
          id: scheduledMessage._id,
          scheduledTime: scheduledMessage.scheduledTime,
          currentTime: now,
          timeDiff: now - scheduledMessage.scheduledTime
        });

        // Create a new message
        const message = new Message({
          sender: scheduledMessage.sender._id,
          receiver: scheduledMessage.receiver._id,
          content: scheduledMessage.content,
          timestamp: scheduledMessage.scheduledTime
        });

        await message.save();
        console.log('[DEBUG] Message saved:', message._id);

        // Mark as sent
        scheduledMessage.sent = true;
        await scheduledMessage.save();
        console.log('[DEBUG] Scheduled message marked as sent');

        // Emit the message to all connected clients
        io.emit('newMessage', message);
        console.log('[DEBUG] Message emitted to all connected clients');

        console.log(`[DEBUG] Scheduled message sent successfully: ${message._id}`);
      } catch (messageError) {
        console.error('[ERROR] Processing scheduled message:', messageError);
        continue;
      }
    }
  } catch (err) {
    console.error('[ERROR] Scheduler error:', err);
  }
}

function startScheduler() {
  if (isSchedulerRunning) {
    console.log('[DEBUG] Scheduler is already running');
    return;
  }

  // Run every 10 seconds
  cron.schedule('*/10 * * * * *', async () => {
    await processScheduledMessages();
  });

  // Also run immediately on startup
  // Note: io might not be available on this first run, which is handled in processScheduledMessages
  processScheduledMessages();

  isSchedulerRunning = true;
  console.log('[DEBUG] Message scheduler started successfully');
}

// Export for testing
module.exports = { 
  startScheduler,
  processScheduledMessages // Exported for testing purposes
};

