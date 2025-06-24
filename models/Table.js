const mongoose = require('mongoose');

const tableSchema = mongoose.Schema(
    {
        tableNumber: {
            type: Number,
            required: [true, 'Please add a table number'],
            unique: true, // Each table should have a unique number
        },
        capacity: {
            type: Number,
            required: [true, 'Please add table capacity (number of seats)'],
            min: 1, // Minimum 1 seat
        },
        isAvailable: {
            type: Boolean,
            required: true,
            default: true, // By default, a newly created table is available
        },
        location: {
            type: String,
            // Examples: 'Indoor', 'Outdoor', 'Window Side', 'Booth'
            required: false, // Optional: where the table is located
        },
        description: {
            type: String,
            required: false, // Optional: any specific notes about the table
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

module.exports = mongoose.model('Table', tableSchema);