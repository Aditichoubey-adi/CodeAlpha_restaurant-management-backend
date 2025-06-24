const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Import the User model

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"
            console.log('Protect Middleware: Token received:', token); // DEBUG LOG

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Protect Middleware: Decoded JWT:', decoded); // DEBUG LOG

            // Attach user from token to req object (without password)
            req.user = await User.findById(decoded.id).select('-password');
            req.user.role = decoded.role; // Also attach role from token

            console.log('Protect Middleware: req.user object attached:', req.user); // DEBUG LOG
            console.log('Protect Middleware: req.user.role is:', req.user.role); // CRITICAL DEBUG LOG

            next(); // Move to the next middleware/controller
        } catch (error) {
            console.error('Auth Middleware Error:', error.message); // DEBUG LOG
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// Middleware for role-based access control
const authorize = (...roles) => { // Example: authorize('admin', 'staff')
    return (req, res, next) => {
        console.log('Authorize Middleware: Expected roles (allowed):', roles); // DEBUG LOG
        console.log('Authorize Middleware: User role from req.user:', req.user ? req.user.role : 'User object not found!'); // CRITICAL DEBUG LOG

        if (!req.user) {
            // This case should ideally be caught by 'protect' middleware
            res.status(401);
            throw new Error('Not authorized, user data missing from token');
        }

        if (!roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorize };