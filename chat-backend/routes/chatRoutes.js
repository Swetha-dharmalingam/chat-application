const express = require('express');
const router = express.Router();
const { sendMessage, scheduleMessage, getMessages, getContacts } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/send', authMiddleware, sendMessage);
router.post('/schedule', authMiddleware, scheduleMessage);
router.get('/messages/:userId', authMiddleware, getMessages);
router.get('/contacts', authMiddleware, getContacts);

module.exports = router;
