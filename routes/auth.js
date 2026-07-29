const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');

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
            password: hashedPassword,
            createdAt: new Date() // Will be set automatically by default, but we include explicitly
        });

        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user object with all fields needed for frontend
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture || '',
                googleId: user.googleId || null,
                createdAt: user.createdAt,
                phone: user.phone || '',
                country: user.country || ''
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

        // Return user object with all fields
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture || '',
                googleId: user.googleId || null,
                createdAt: user.createdAt,
                phone: user.phone || '',
                country: user.country || ''
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
            // User exists – update googleId and picture if not set
            if (!user.googleId) {
                user.googleId = googleId;
            }
            if (!user.picture && picture) {
                user.picture = picture;
            }
            // If user doesn't have a password (i.e., they registered via Google previously), it's fine.
            await user.save();
        } else {
            // Create new user (no password needed)
            user = new User({
                name: name || 'Google User',
                email: email.toLowerCase(),
                googleId: googleId,
                picture: picture || '',
                createdAt: new Date()
            });
            await user.save();
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user object
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture || '',
                googleId: user.googleId || null,
                createdAt: user.createdAt,
                phone: user.phone || '',
                country: user.country || ''
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ error: 'Google authentication failed. Please try again.' });
    }
});

// ============================================
// 4. GET CURRENT USER (Protected)
// ============================================
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user object
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture || '',
            googleId: user.googleId || null,
            createdAt: user.createdAt,
            phone: user.phone || '',
            country: user.country || ''
        });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// 5. UPDATE USER PROFILE (Protected)
// ============================================
router.put('/me', auth, async (req, res) => {
    try {
        const { name, email, phone, country, password } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (phone !== undefined) user.phone = phone;
        if (country !== undefined) user.country = country;
        if (password) {
            // Only update if password is provided and length >= 6
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        // Return updated user
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture || '',
            googleId: user.googleId || null,
            createdAt: user.createdAt,
            phone: user.phone || '',
            country: user.country || ''
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// 6. LOGOUT (Optional – just invalidate token on client)
// ============================================
router.post('/logout', auth, async (req, res) => {
    // Since we use stateless JWT, we don't need to do anything server-side.
    // The client simply removes the token. But we can send a success response.
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;