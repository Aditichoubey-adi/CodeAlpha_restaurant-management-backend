const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a menu item name'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: 0, // Price cannot be negative
        },
        category: {
            type: String,
            required: [true, 'Please select a category'],
            enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Breakfast', 'Lunch', 'Dinner'], // Example categories
            default: 'Main Course',
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        imageUrl: {
            type: String,
            default: 'no-photo.jpg', // Placeholder image or empty string
        },
        preparationTime: {
            type: Number,
            min: 0,
            default: 15, // Default prep time in minutes
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps automatically
    }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);