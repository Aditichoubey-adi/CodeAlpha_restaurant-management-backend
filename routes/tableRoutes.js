const express = require('express');
const router = express.Router();
const {
    createTable,
    getTables,
    getTableById,
    updateTable,
    deleteTable,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import auth middleware

// Public routes (anyone can view tables)
router.route('/')
    .get(getTables); // Get all tables

router.route('/:id')
    .get(getTableById); // Get single table by ID

// Private routes (Only Admin/Staff can create, update, delete tables)
router.route('/')
    .post(protect, authorize('admin', 'staff'), createTable); // Add a new table

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updateTable)   // Update a table
    .delete(protect, authorize('admin', 'staff'), deleteTable); // Delete a table

module.exports = router;