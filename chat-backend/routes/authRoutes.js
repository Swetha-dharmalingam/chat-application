const express = require('express');
const router = express.Router();
const { register, login, getUser, searchUsers } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/user', authMiddleware, getUser);
router.get('/search', authMiddleware, searchUsers);

module.exports = router;
