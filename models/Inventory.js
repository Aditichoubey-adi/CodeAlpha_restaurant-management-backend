const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema(
    {
        itemName: {
            type: String,
            required: [true, 'Please add an item name'],
            unique: true, // Item names should be unique
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Please add current quantity'],
            min: 0, // Quantity cannot be negative
            default: 0,
        },
        unit: {
            type: String,
            required: [true, 'Please add a unit of measure (e.g., kg, lbs, pcs, litres)'],
            trim: true,
        },
        lowStockThreshold: {
            type: Number,
            default: 10, // Default threshold to trigger low stock alerts
            min: 0,
        },
        supplier: {
            type: String,
            required: false, // Optional: who supplies this item
            trim: true,
        },
        lastRestockDate: {
            type: Date,
            required: false, // Optional: when it was last restocked
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt timestamps
    }
);

// Optional: Add an index for faster lookups by itemName
inventorySchema.index({ itemName: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);