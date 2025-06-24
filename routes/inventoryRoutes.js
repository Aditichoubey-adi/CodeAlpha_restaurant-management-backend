const express = require('express');
const router = express.Router();
const {
    createInventoryItem,
    getAllInventoryItems,
    getInventoryItemById,
    updateInventoryItem,
    deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import auth middleware

// All inventory routes are private and restricted to Admin/Staff
router.route('/')
    .post(protect, authorize('admin', 'staff'), createInventoryItem)  // Create new item
    .get(protect, authorize('admin', 'staff'), getAllInventoryItems); // Get all items

router.route('/:id')
    .get(protect, authorize('admin', 'staff'), getInventoryItemById) // Get item by ID
    .put(protect, authorize('admin', 'staff'), updateInventoryItem)   // Update item
    .delete(protect, authorize('admin', 'staff'), deleteInventoryItem); // Delete item

module.exports = router;