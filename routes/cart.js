const router = require('express').Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get current user's cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart) {
            // Return empty cart structure
            return res.json({ items: [], total: 0 });
        }
        // Calculate total
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.json({ items: cart.items, total });
    } catch (error) {
        console.error('Cart GET Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add item to cart
router.post('/', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        // Check if item already exists in cart
        const existingIndex = cart.items.findIndex(
            item => item.productId.toString() === productId
        );

        if (existingIndex > -1) {
            // Update quantity
            cart.items[existingIndex].quantity += quantity;
        } else {
            // Add new item (snapshot price)
            cart.items.push({
                productId: product._id,
                quantity,
                price: product.price
            });
        }

        await cart.save();
        // Populate product details before sending response
        await cart.populate('items.productId');
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.status(201).json({ items: cart.items, total, message: 'Item added to cart' });
    } catch (error) {
        console.error('Cart Add Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update cart item quantity
router.put('/:itemId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.productId');
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.json({ items: cart.items, total, message: 'Cart updated' });
    } catch (error) {
        console.error('Cart Update Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        cart.items.pull(req.params.itemId);
        await cart.save();
        await cart.populate('items.productId');
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        res.json({ items: cart.items, total, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Cart Remove Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Clear entire cart
router.delete('/', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared', items: [], total: 0 });
    } catch (error) {
        console.error('Cart Clear Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;