const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JSON Web Tokens

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6, // Minimum password length
            select: false, // Don't return password in queries by default
        },
        role: {
            type: String,
            enum: ['customer', 'staff', 'admin'], // Define possible roles
            default: 'customer',
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

// Encrypt password using bcrypt before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Only hash if password field is modified or new
        next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d', // Token expires in 30 days by default
    });
};

module.exports = mongoose.model('User', userSchema);