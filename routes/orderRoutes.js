const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import auth middleware

// General Orders routes (Admin/Staff only for getting all orders)
router.route('/')
    .post(protect, createOrder) // Any logged-in user can create an order
    .get(protect, authorize('admin', 'staff'), getAllOrders); // Only Admin/Staff can get all orders

// User's specific orders
router.get('/myorders', protect, getMyOrders); // Logged-in user can see their own orders

// Specific Order by ID routes
router.route('/:id')
    .get(protect, getOrderById) // User can get their order, Admin/Staff can get any
    .put(protect, authorize('admin', 'staff'), updateOrderStatus); // Only Admin/Staff can update order status

module.exports = router;