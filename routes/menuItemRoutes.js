const express = require('express');
const router = express.Router();
const {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuItemController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import the auth middleware

// Public routes (Anyone can view menu items)
router.route('/')
    .get(getMenuItems); // Get all menu items

router.route('/:id')
    .get(getMenuItemById); // Get single menu item by ID

// Private routes (Only Admin/Staff can create, update, delete menu items)
// The order matters: protect comes first to authenticate, then authorize checks the role
router.route('/')
    .post(protect, authorize('admin', 'staff'), createMenuItem); // Add a new menu item

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateMenuItem)  // Update a menu item
    .delete(protect, authorize('admin', 'staff'), deleteMenuItem); // Delete a menu item

module.exports = router;