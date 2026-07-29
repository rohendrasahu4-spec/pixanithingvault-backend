require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    {
        name: "Golden Elegance Wedding Template",
        category: "video",
        style: "traditional",
        price: 49,
        oldPrice: 79,
        rating: 5,
        reviews: 124,
        badge: "Best Seller",
        image: "https://via.placeholder.com/300x240/6B2D5B/FFFFFF?text=Golden+Wedding",
        description: "A stunning cinematic wedding video template with golden accents.",
        features: ["1080p Full HD", "45 seconds duration", "Premiere Pro & After Effects"],
        tags: ["golden", "wedding", "elegant"],
        inStock: true
    },
    {
        name: "Rustic Love Invitation Pack",
        category: "graphic",
        style: "floral",
        price: 39,
        rating: 5,
        reviews: 98,
        badge: "New",
        image: "https://via.placeholder.com/300x240/8B4A7A/FFFFFF?text=Rustic+Love",
        description: "Beautiful rustic invitation cards with floral elements.",
        features: ["Print ready", "PSD, AI, CDR formats"],
        tags: ["rustic", "invitation", "love"],
        inStock: true
    },
    {
        name: "Boho Chic Wedding Collection",
        category: "video",
        style: "modern",
        price: 59,
        oldPrice: 79,
        rating: 5,
        reviews: 76,
        badge: "Sale",
        image: "https://via.placeholder.com/300x240/D4A54A/FFFFFF?text=Boho+Chic",
        description: "Bohemian style wedding templates with vibrant colors.",
        features: ["Modern design", "Easy to edit", "After Effects project"],
        tags: ["boho", "chic", "wedding"],
        inStock: true
    },
    {
        name: "Royal Heritage Wedding Template",
        category: "video",
        style: "traditional",
        price: 69,
        rating: 5,
        reviews: 52,
        badge: null,
        image: "https://via.placeholder.com/300x240/3D1A34/FFFFFF?text=Royal+Heritage",
        description: "Luxurious wedding template with royal heritage elements.",
        features: ["Cinematic", "Royal style", "Premiere Pro"],
        tags: ["royal", "heritage", "wedding"],
        inStock: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Delete existing products (optional – removes old data)
        await Product.deleteMany({});
        console.log('🗑️ Existing products deleted');

        // Insert new products
        await Product.insertMany(products);
        console.log(`✅ ${products.length} products inserted successfully`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDB();