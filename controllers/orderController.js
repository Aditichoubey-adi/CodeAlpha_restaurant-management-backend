const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem'); // To verify menu items

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customers/Staff can place orders)
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, paymentMethod, deliveryAddress, deliveryFee } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        // Calculate total price and verify menu items
        let total = 0;
        const validatedOrderItems = [];

        for (const item of orderItems) {
            const menuItem = await MenuItem.findById(item.menuItem);

            if (!menuItem) {
                res.status(404);
                throw new Error(`Menu item not found: ${item.name || item.menuItem}`);
            }
            if (!menuItem.isAvailable) {
                res.status(400);
                throw new Error(`${menuItem.name} is currently not available.`);
            }

            // Use the actual price from the MenuItem model to prevent client-side price manipulation
            total += menuItem.price * item.qty;

            validatedOrderItems.push({
                name: menuItem.name,
                qty: item.qty,
                image: menuItem.imageUrl, // Use actual image from menu item
                price: menuItem.price,    // Use actual price from menu item
                menuItem: menuItem._id,
            });
        }

        const order = new Order({
            user: req.user._id, // User ID from auth middleware
            orderItems: validatedOrderItems,
            paymentMethod,
            deliveryAddress: deliveryAddress || {}, // Optional delivery address
            deliveryFee: deliveryFee || 0, // Optional delivery fee
            totalPrice: total + (deliveryFee || 0), // Add delivery fee to total
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (User can get their own order, Admin/Staff can get any order)
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email'); // Populate user details

    if (order) {
        // If the logged-in user is not admin/staff AND is not the owner of the order, forbid access
        if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Only for logged in user)
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
});

// @desc    Update order status (for Staff/Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin & Staff
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const { status, isPaid, isDelivered } = req.body;

    if (order) {
        // Update status if provided and valid
        if (status && Order.schema.path('status').enumValues.includes(status)) {
            order.status = status;
        }

        // Update payment status
        if (typeof isPaid === 'boolean' && order.isPaid !== isPaid) {
            order.isPaid = isPaid;
            if (isPaid) {
                order.paidAt = new Date();
            } else {
                order.paidAt = undefined; // Remove paidAt if status changes to not paid
            }
        }
        
        // Update delivery status
        if (typeof isDelivered === 'boolean' && order.isDelivered !== isDelivered) {
            order.isDelivered = isDelivered;
            if (isDelivered) {
                order.deliveredAt = new Date();
            } else {
                order.deliveredAt = undefined; // Remove deliveredAt if status changes to not delivered
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});


// @desc    Get all orders (for Admin/Staff)
// @route   GET /api/orders
// @access  Private/Admin & Staff
const getAllOrders = asyncHandler(async (req, res) => {
    // Populate user to see who placed the order
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
});

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    getAllOrders,
};