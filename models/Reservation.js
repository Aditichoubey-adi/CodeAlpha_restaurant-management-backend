const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // References the User model (who made the reservation)
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Table', // References the Table model (which table is reserved)
        },
        startTime: {
            type: Date,
            required: [true, 'Please specify the reservation start time'],
        },
        endTime: {
            type: Date,
            required: [true, 'Please specify the reservation end time'],
        },
        numberOfGuests: {
            type: Number,
            required: [true, 'Please specify the number of guests'],
            min: 1,
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-Show'],
            default: 'Pending',
        },
        notes: {
            type: String,
            required: false, // Optional notes for the reservation (e.g., "birthday party")
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

// Optional: Add a pre-save hook to ensure logical time (start < end)
reservationSchema.pre('save', function (next) {
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        next(new Error('End time must be after start time.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Reservation', reservationSchema);