const router = require('express').Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Place order (from current cart)
router.post('/', auth, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Prepare order items
        const items = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.price
        }));

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        const order = new Order({
            userId: req.user.id,
            items,
            total,
            shippingAddress: shippingAddress || '',
            paymentMethod: paymentMethod || ''
        });

        await order.save();

        // Clear cart after order placement
        cart.items = [];
        await cart.save();

        // Populate product details for response
        await order.populate('items.productId');

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Order Create Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all orders for current user
router.get('/', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.productId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Orders GET Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('items.productId');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Order Detail Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;