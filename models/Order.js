const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // References the User model
        },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true },
                image: { type: String, required: false, default: 'no-photo.jpg' }, // Optional: image URL of the item
                price: { type: Number, required: true },
                menuItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'MenuItem', // References the MenuItem model
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['Cash', 'Card', 'Online Payment'],
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        deliveryAddress: {
            // Optional, for delivery orders
            street: { type: String },
            city: { type: String },
            postalCode: { type: String },
            country: { type: String },
        },
        deliveryFee: {
            type: Number,
            required: false, // Optional delivery fee
            default: 0.0,
        },
        isDelivered: {
            type: Boolean,
            required: true,
            default: false,
        },
        deliveredAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

module.exports = mongoose.model('Order', orderSchema);