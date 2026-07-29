const router = require('express').Router();
const Product = require('../models/Product');

// GET all products (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, style, minPrice, maxPrice, sort } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (style) filter.style = style;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        let query = Product.find(filter);
        
        if (sort === 'price-low') query = query.sort({ price: 1 });
        else if (sort === 'price-high') query = query.sort({ price: -1 });
        else if (sort === 'popular') query = query.sort({ reviews: -1 });
        else query = query.sort({ createdAt: -1 }); // newest

        const products = await query.exec();
        res.json(products);
    } catch (error) {
        console.error('Products Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Product Detail Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// (Optional) Admin: Create/Update/Delete products can be added later.

module.exports = router;