const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // We will create this middleware next

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private route (requires authentication)
router.get('/profile', protect, getUserProfile); // This route uses the 'protect' middleware

module.exports = router;