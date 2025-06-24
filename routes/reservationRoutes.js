const express = require('express');
const router = express.Router();
const {
    createReservation,
    getAllReservations,
    getMyReservations,
    getReservationById,
    updateReservationStatus,
    updateReservation,
    deleteReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import auth middleware

// General Reservations routes
router.route('/')
    .post(protect, createReservation) // Logged-in users (customers/staff) can create
    .get(protect, authorize('admin', 'staff'), getAllReservations); // Only Admin/Staff can get all reservations

// User's specific reservations
router.get('/myreservations', protect, getMyReservations); // Logged-in user can see their own reservations

// Specific Reservation by ID routes
router.route('/:id')
    .get(protect, getReservationById) // User can get their own, Admin/Staff can get any
    .put(protect, authorize('admin', 'staff'), updateReservation) // Full update, typically Admin/Staff
    .delete(protect, authorize('admin', 'staff'), deleteReservation); // Only Admin/Staff can delete

// Specific route for status updates (separated for clarity and specific permissions)
router.put('/:id/status', protect, authorize('admin', 'staff'), updateReservationStatus);

module.exports = router;