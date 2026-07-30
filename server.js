require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// ROUTES
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PixanithingVault Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Authentication
app.use('/api/auth', authRoutes);

// Products
app.use('/api/products', productRoutes);

// Cart (protected)
app.use('/api/cart', cartRoutes);

// Orders (protected)
app.use('/api/orders', orderRoutes);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Auth routes: http://localhost:${PORT}/api/auth`);
    console.log(`📦 Products: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Cart: http://localhost:${PORT}/api/cart (protected)`);
    console.log(`📦 Orders: http://localhost:${PORT}/api/orders (protected)`);
});
