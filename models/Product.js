const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['video', 'plugin', 'typography', 'graphic'],
        required: true
    },
    style: {
        type: String,
        enum: ['modern', 'traditional', 'floral', 'minimalist'],
        default: 'modern'
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    oldPrice: {
        type: Number,
        min: 0,
        default: null
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    badge: {
        type: String,
        enum: ['Best Seller', 'New', 'Sale', null],
        default: null
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    features: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    inStock: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', ProductSchema);