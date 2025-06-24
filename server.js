const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const menuItemRoutes = require('./routes/menuItemRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes'); // Import inventory routes // ADD THIS LINE

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Restaurant Management API is running...');
});

// Use Routes
app.use('/api/menuitems', menuItemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes); // Inventory routes // ADD THIS LINE

// Error Handling Middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
