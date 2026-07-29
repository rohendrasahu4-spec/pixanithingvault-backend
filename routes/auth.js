<<<<<<< HEAD
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================
// 1. REGISTER (Email/Password)
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ============================================
// 2. LOGIN (Email/Password)
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password (only if user has password, i.e., not Google-only user)
        if (!user.password) {
            return res.status(400).json({ 
                error: 'This account uses Google Sign-In. Please log in with Google.' 
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ============================================
// 3. GOOGLE OAUTH SIGN-IN
// ============================================
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token is required' });
        }

        // Verify Google ID Token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists with this email
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // User exists – update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.picture = picture || user.picture;
                await user.save();
            }
        } else {
            // Create new user (no password needed)
            user = new User({
                name: name || 'Google User',
                email: email.toLowerCase(),
                googleId: googleId,
                picture: picture || ''
            });
            await user.save();
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Google authentication failed. Please try again.' });
    }
});

// ============================================
// 4. GET CURRENT USER (Protected Route)
// ============================================
// Note: We'll add the auth middleware later.
// For now, this is a placeholder.

=======
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================
// 1. REGISTER (Email/Password)
// ============================================
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ============================================
// 2. LOGIN (Email/Password)
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password (only if user has password, i.e., not Google-only user)
        if (!user.password) {
            return res.status(400).json({ 
                error: 'This account uses Google Sign-In. Please log in with Google.' 
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// ============================================
// 3. GOOGLE OAUTH SIGN-IN
// ============================================
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token is required' });
        }

        // Verify Google ID Token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists with this email
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // User exists – update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.picture = picture || user.picture;
                await user.save();
            }
        } else {
            // Create new user (no password needed)
            user = new User({
                name: name || 'Google User',
                email: email.toLowerCase(),
                googleId: googleId,
                picture: picture || ''
            });
            await user.save();
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Google authentication failed. Please try again.' });
    }
});

// ============================================
// 4. GET CURRENT USER (Protected Route)
// ============================================
// Note: We'll add the auth middleware later.
// For now, this is a placeholder.

>>>>>>> 3bb45b2ec6a72e64068a3e472868fba21c668722
module.exports = router;