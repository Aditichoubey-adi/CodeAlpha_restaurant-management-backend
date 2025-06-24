const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');

// @desc    Add a new inventory item
// @route   POST /api/inventory
// @access  Private/Admin & Staff
const createInventoryItem = asyncHandler(async (req, res) => {
    const { itemName, quantity, unit, lowStockThreshold, supplier, lastRestockDate } = req.body;

    // Basic validation
    if (!itemName || quantity === undefined || !unit) { // quantity can be 0, so check for undefined
        res.status(400);
        throw new Error('Please enter item name, quantity, and unit of measure');
    }

    // Check if item name already exists
    const itemExists = await Inventory.findOne({ itemName });
    if (itemExists) {
        res.status(400);
        throw new Error(`Inventory item "${itemName}" already exists`);
    }

    const inventoryItem = await Inventory.create({
        itemName,
        quantity,
        unit,
        lowStockThreshold,
        supplier,
        lastRestockDate,
    });

    res.status(201).json(inventoryItem);
});

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin & Staff
const getAllInventoryItems = asyncHandler(async (req, res) => {
    const inventoryItems = await Inventory.find({});
    res.json(inventoryItems);
});

// @desc    Get single inventory item by ID
// @route   GET /api/inventory/:id
// @access  Private/Admin & Staff
const getInventoryItemById = asyncHandler(async (req, res) => {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (inventoryItem) {
        res.json(inventoryItem);
    } else {
        res.status(404);
        throw new Error('Inventory item not found');
    }
});

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin & Staff
const updateInventoryItem = asyncHandler(async (req, res) => {
    const { itemName, quantity, unit, lowStockThreshold, supplier, lastRestockDate } = req.body;

    const inventoryItem = await Inventory.findById(req.params.id);

    if (inventoryItem) {
        // If itemName is updated, ensure it's not a duplicate
        if (itemName !== undefined && itemName !== inventoryItem.itemName) {
            const itemExists = await Inventory.findOne({ itemName });
            if (itemExists && itemExists._id.toString() !== req.params.id) { // Check if it's another item with the same name
                res.status(400);
                throw new Error(`Inventory item "${itemName}" already exists`);
            }
            inventoryItem.itemName = itemName;
        }

        // Update fields if provided in request, otherwise keep existing
        inventoryItem.quantity = quantity !== undefined ? quantity : inventoryItem.quantity;
        inventoryItem.unit = unit !== undefined ? unit : inventoryItem.unit;
        inventoryItem.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : inventoryItem.lowStockThreshold;
        inventoryItem.supplier = supplier !== undefined ? supplier : inventoryItem.supplier;
        inventoryItem.lastRestockDate = lastRestockDate !== undefined ? lastRestockDate : inventoryItem.lastRestockDate;


        const updatedItem = await inventoryItem.save();
        res.json(updatedItem);
    } else {
        res.status(404);
        throw new Error('Inventory item not found');
    }
});

// @desc    Delete an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin & Staff
const deleteInventoryItem = asyncHandler(async (req, res) => {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (inventoryItem) {
        await inventoryItem.deleteOne(); // Use deleteOne() for Mongoose 6+
        res.json({ message: 'Inventory item removed' });
    } else {
        res.status(404);
        throw new Error('Inventory item not found');
    }
});

module.exports = {
    createInventoryItem,
    getAllInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
};