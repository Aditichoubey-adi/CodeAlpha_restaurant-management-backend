const asyncHandler = require('express-async-handler');
const User = require('../models/User'); // Import the User model

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please enter all required fields: name, email, password');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password, // Password will be hashed by pre-save hook in model
        role: role || 'customer', // Default role if not provided
    });

    if (user) {
        // Since `password` has `select: false`, it won't be returned by default.
        // We also need to get the token.
        const token = user.getSignedJwtToken();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
        res.status(400);
        throw new Error('Please enter email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password to compare

    if (!user) {
        res.status(401); // Unauthorized
        throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401); // Unauthorized
        throw new Error('Invalid credentials');
    }

    // If login successful, get token
    const token = user.getSignedJwtToken();

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
    });
});


// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private (Needs auth middleware)
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user will be available from auth middleware
    const user = await User.findById(req.user.id).select('-password'); // Don't return password

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
};