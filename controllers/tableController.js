const asyncHandler = require('express-async-handler');
const Table = require('../models/Table');

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin & Staff
const createTable = asyncHandler(async (req, res) => {
    const { tableNumber, capacity, isAvailable, location, description } = req.body;

    // Basic validation
    if (!tableNumber || !capacity) {
        res.status(400);
        throw new Error('Please enter table number and capacity');
    }

    // Check if table number already exists
    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
        res.status(400);
        throw new Error(`Table number ${tableNumber} already exists`);
    }

    const table = await Table.create({
        tableNumber,
        capacity,
        isAvailable: isAvailable !== undefined ? isAvailable : true, // Default to true if not provided
        location,
        description,
    });

    res.status(201).json(table);
});

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public (Can be viewed by anyone to see availability)
const getTables = asyncHandler(async (req, res) => {
    const tables = await Table.find({});
    res.json(tables);
});

// @desc    Get single table by ID
// @route   GET /api/tables/:id
// @access  Public
const getTableById = asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id);

    if (table) {
        res.json(table);
    } else {
        res.status(404);
        throw new Error('Table not found');
    }
});

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private/Admin & Staff
const updateTable = asyncHandler(async (req, res) => {
    const { tableNumber, capacity, isAvailable, location, description } = req.body;

    const table = await Table.findById(req.params.id);

    if (table) {
        // If tableNumber is updated, ensure it's not a duplicate
        if (tableNumber !== undefined && tableNumber !== table.tableNumber) {
            const tableExists = await Table.findOne({ tableNumber });
            if (tableExists && tableExists._id.toString() !== req.params.id) { // Check if it's another table with the same number
                res.status(400);
                throw new Error(`Table number ${tableNumber} already exists for another table`);
            }
            table.tableNumber = tableNumber;
        }

        table.capacity = capacity !== undefined ? capacity : table.capacity;
        table.isAvailable = isAvailable !== undefined ? isAvailable : table.isAvailable;
        table.location = location !== undefined ? location : table.location;
        table.description = description !== undefined ? description : table.description;

        const updatedTable = await table.save();
        res.json(updatedTable);
    } else {
        res.status(404);
        throw new Error('Table not found');
    }
});

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin & Staff
const deleteTable = asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id);

    if (table) {
        await table.deleteOne(); // Use deleteOne() for Mongoose 6+
        res.json({ message: 'Table removed' });
    } else {
        res.status(404);
        throw new Error('Table not found');
    }
});

module.exports = {
    createTable,
    getTables,
    getTableById,
    updateTable,
    deleteTable,
};