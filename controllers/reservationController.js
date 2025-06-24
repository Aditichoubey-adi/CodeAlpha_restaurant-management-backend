const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table'); // To check table capacity and availability
const moment = require('moment'); // For easier date/time handling (install if not already: npm install moment)

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Customers/Staff can make reservations)
const createReservation = asyncHandler(async (req, res) => {
    const { table, startTime, endTime, numberOfGuests, notes } = req.body;

    // 1. Basic Validation
    if (!table || !startTime || !endTime || !numberOfGuests) {
        res.status(400);
        throw new Error('Please include table, start time, end time, and number of guests');
    }

    // Convert times to Date objects
    const start = moment(startTime);
    const end = moment(endTime);

    // Validate time logic
    if (start.isSameOrAfter(end)) {
        res.status(400);
        throw new Error('End time must be after start time.');
    }
    if (start.isBefore(moment())) { // Cannot reserve in the past
        res.status(400);
        throw new Error('Reservation start time cannot be in the past.');
    }

    // 2. Check Table Existence and Capacity
    const selectedTable = await Table.findById(table);

    if (!selectedTable) {
        res.status(404);
        throw new Error('Table not found.');
    }

    if (numberOfGuests > selectedTable.capacity) {
        res.status(400);
        throw new Error(`Table ${selectedTable.tableNumber} (Capacity: ${selectedTable.capacity}) cannot accommodate ${numberOfGuests} guests.`);
    }

    // 3. Check Table Availability for the given time slot
    // Find existing reservations for this table that overlap with the new reservation's time slot
    const overlappingReservations = await Reservation.find({
        table: selectedTable._id,
        $or: [
            {
                // New reservation starts during existing reservation
                startTime: { $lt: end.toDate() }, // new start < existing end
                endTime: { $gt: start.toDate() }   // new end > existing start
            }
        ],
        // Exclude Cancelled and No-Show reservations from availability check
        status: { $in: ['Pending', 'Confirmed', 'Completed'] }
    });

    if (overlappingReservations.length > 0) {
        res.status(409); // Conflict
        throw new Error(`Table ${selectedTable.tableNumber} is already booked during this time slot.`);
    }

    // 4. Create Reservation
    const reservation = new Reservation({
        user: req.user._id, // User ID from auth middleware
        table: selectedTable._id,
        startTime: start.toDate(),
        endTime: end.toDate(),
        numberOfGuests,
        notes,
        status: 'Pending', // Default status
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
});

// @desc    Get all reservations (for Admin/Staff)
// @route   GET /api/reservations
// @access  Private/Admin & Staff
const getAllReservations = asyncHandler(async (req, res) => {
    // Populate user and table details for more context
    const reservations = await Reservation.find({})
        .populate('user', 'id name email')
        .populate('table', 'tableNumber capacity')
        .sort({ startTime: 1 }); // Sort by start time

    res.json(reservations);
});

// @desc    Get logged in user's reservations
// @route   GET /api/reservations/myreservations
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
    const reservations = await Reservation.find({ user: req.user._id })
        .populate('table', 'tableNumber capacity')
        .sort({ startTime: 1 }); // Sort by start time

    res.json(reservations);
});

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private (User can get their own, Admin/Staff can get any)
const getReservationById = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id)
        .populate('user', 'name email')
        .populate('table', 'tableNumber capacity');

    if (reservation) {
        // If the logged-in user is not admin/staff AND is not the owner of the reservation, forbid access
        if (req.user.role === 'customer' && reservation.user._id.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this reservation');
        }
        res.json(reservation);
    } else {
        res.status(404);
        throw new Error('Reservation not found');
    }
});

// @desc    Update reservation status (for Admin/Staff)
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin & Staff
const updateReservationStatus = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    const { status } = req.body;

    if (reservation) {
        if (status && Reservation.schema.path('status').enumValues.includes(status)) {
            reservation.status = status;
        } else {
            res.status(400);
            throw new Error('Invalid status provided');
        }
        const updatedReservation = await reservation.save();
        res.json(updatedReservation);
    } else {
        res.status(404);
        throw new Error('Reservation not found');
    }
});


// @desc    Update reservation details (for Admin/Staff - full update)
// @route   PUT /api/reservations/:id
// @access  Private/Admin & Staff
const updateReservation = asyncHandler(async (req, res) => {
    const { table, startTime, endTime, numberOfGuests, status, notes } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
        // Convert times to Date objects if provided
        const start = startTime ? moment(startTime) : moment(reservation.startTime);
        const end = endTime ? moment(endTime) : moment(reservation.endTime);

        // Validate time logic if changed
        if (startTime || endTime) {
            if (start.isSameOrAfter(end)) {
                res.status(400);
                throw new Error('End time must be after start time.');
            }
            if (start.isBefore(moment()) && reservation.status === 'Pending') { // Cannot update to past time if still pending
                res.status(400);
                throw new Error('Reservation start time cannot be in the past when updating pending reservation.');
            }
        }

        // Check if table or guests changed and re-validate capacity/availability if needed
        if (table || numberOfGuests) {
            const newTableId = table || reservation.table;
            const newNumGuests = numberOfGuests || reservation.numberOfGuests;

            const selectedTable = await Table.findById(newTableId);
            if (!selectedTable) {
                res.status(404);
                throw new Error('New table not found.');
            }
            if (newNumGuests > selectedTable.capacity) {
                res.status(400);
                throw new Error(`Table ${selectedTable.tableNumber} (Capacity: ${selectedTable.capacity}) cannot accommodate ${newNumGuests} guests.`);
            }

            // Check availability if time, table, or status changes to an active state
            if (
                newTableId.toString() !== reservation.table.toString() ||
                (startTime || endTime) ||
                (status && ['Pending', 'Confirmed'].includes(status) && !['Pending', 'Confirmed'].includes(reservation.status))
            ) {
                 const overlappingReservations = await Reservation.find({
                    table: newTableId,
                    _id: { $ne: reservation._id }, // Exclude current reservation itself
                    $or: [
                        {
                            startTime: { $lt: end.toDate() },
                            endTime: { $gt: start.toDate() }
                        }
                    ],
                    status: { $in: ['Pending', 'Confirmed', 'Completed'] }
                });

                if (overlappingReservations.length > 0) {
                    res.status(409);
                    throw new Error(`Table ${selectedTable.tableNumber} is already booked during this updated time slot.`);
                }
            }
        }

        reservation.table = table || reservation.table;
        reservation.startTime = start.toDate();
        reservation.endTime = end.toDate();
        reservation.numberOfGuests = numberOfGuests || reservation.numberOfGuests;
        reservation.status = (status && Reservation.schema.path('status').enumValues.includes(status)) ? status : reservation.status;
        reservation.notes = notes !== undefined ? notes : reservation.notes; // Allow setting notes to empty string

        const updatedReservation = await reservation.save();
        res.json(updatedReservation);

    } else {
        res.status(404);
        throw new Error('Reservation not found');
    }
});


// @desc    Delete a reservation (for Admin/Staff)
// @route   DELETE /api/reservations/:id
// @access  Private/Admin & Staff
const deleteReservation = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);

    if (reservation) {
        await reservation.deleteOne(); // Use deleteOne() for Mongoose 6+
        res.json({ message: 'Reservation removed' });
    } else {
        res.status(404);
        throw new Error('Reservation not found');
    }
});

module.exports = {
    createReservation,
    getAllReservations,
    getMyReservations,
    getReservationById,
    updateReservationStatus,
    updateReservation,
    deleteReservation,
};