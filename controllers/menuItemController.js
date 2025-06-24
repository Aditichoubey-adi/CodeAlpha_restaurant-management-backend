const asyncHandler = require('express-async-handler');
const MenuItem = require('../models/MenuItem');

// @desc    Add a new menu item
// @route   POST /api/menuitems
// @access  Private (Admin Only) - (Auth middleware will be added later)
const createMenuItem = asyncHandler(async (req, res) => {
    const { name, description, price, category, isAvailable, imageUrl, preparationTime } = req.body;

    if (!name || !description || !price || !category) {
        res.status(400);
        throw new Error('Please enter all required fields: name, description, price, category');
    }

    // Check if menu item already exists
    const menuItemExists = await MenuItem.findOne({ name });

    if (menuItemExists) {
        res.status(400);
        throw new Error('Menu item with this name already exists');
    }

    const menuItem = await MenuItem.create({
        name,
        description,
        price,
        category,
        isAvailable,
        imageUrl,
        preparationTime,
    });

    if (menuItem) {
        res.status(201).json({
            _id: menuItem._id,
            name: menuItem.name,
            description: menuItem.description,
            price: menuItem.price,
            category: menuItem.category,
            isAvailable: menuItem.isAvailable,
            imageUrl: menuItem.imageUrl,
            preparationTime: menuItem.preparationTime,
        });
    } else {
        res.status(400);
        throw new Error('Invalid menu item data');
    }
});

// @desc    Get all menu items
// @route   GET /api/menuitems
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({});
    res.json(menuItems);
});

// @desc    Get a single menu item by ID
// @route   GET /api/menuitems/:id
// @access  Public
const getMenuItemById = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404);
        throw new Error('Menu item not found');
    }
});

// @desc    Update a menu item
// @route   PUT /api/menuitems/:id
// @access  Private (Admin Only) - (Auth middleware will be added later)
const updateMenuItem = asyncHandler(async (req, res) => {
    const { name, description, price, category, isAvailable, imageUrl, preparationTime } = req.body;

    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.category = category || menuItem.category;
        menuItem.isAvailable = (isAvailable !== undefined) ? isAvailable : menuItem.isAvailable; // Handle boolean correctly
        menuItem.imageUrl = imageUrl || menuItem.imageUrl;
        menuItem.preparationTime = preparationTime || menuItem.preparationTime;

        const updatedMenuItem = await menuItem.save();
        res.json(updatedMenuItem);
    } else {
        res.status(404);
        throw new Error('Menu item not found');
    }
});

// @desc    Delete a menu item
// @route   DELETE /api/menuitems/:id
// @access  Private (Admin Only) - (Auth middleware will be added later)
const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id);

    if (menuItem) {
        await MenuItem.deleteOne({ _id: req.params.id }); // Use deleteOne or findByIdAndDelete
        res.json({ message: 'Menu item removed' });
    } else {
        res.status(404);
        throw new Error('Menu item not found');
    }
});

module.exports = {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
};