// ============================================================
// SERVER.JS – COMPLETE BACKEND (CORS IN ONE PLACE)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');           // 🔴 CORS Import – यहाँ
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Connect to MongoDB
connectDB();

const app = express();

// ============================================================
// 🔴🔴🔴 CORS MIDDLEWARE – यहाँ एक साथ 🔴🔴🔴
// ============================================================
app.use(cors({
    origin: '*',           // Development के लिए – सभी Origins Allow
    // या सिर्फ अपने Frontend को Allow करें:
    // origin: 'https://pixanithingvault-frontend.vercel.app'
    credentials: true,
}));

// ============================================================
// OTHER MIDDLEWARE
// ============================================================
app.use(express.json());   // JSON Body Parse करने के लिए

// ============================================================
// ROUTES
// ============================================================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PixanithingVault Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Authentication Routes (Register, Login, Google)
app.use('/api/auth', authRoutes);

// Products Routes
app.use('/api/products', productRoutes);

// Cart Routes (Protected)
app.use('/api/cart', cartRoutes);

// Orders Routes (Protected)
app.use('/api/orders', orderRoutes);

// ============================================================
// 404 Handler (Optional – अगर कोई Route न मिले)
// ============================================================
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Auth routes: http://localhost:${PORT}/api/auth`);
    console.log(`📦 Products: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Cart: http://localhost:${PORT}/api/cart (protected)`);
    console.log(`📦 Orders: http://localhost:${PORT}/api/orders (protected)`);
});
