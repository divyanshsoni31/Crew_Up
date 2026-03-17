import User from '../models/User.js';
import { sendOTP } from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5173'
);

// @desc    Register a new user (Unverified)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // If user exists and is already verified
            if (user.isVerified) {
                return res.status(400).json({ message: 'User already exists and is verified' });
            }

            // If user exists but NOT verified, update their OTP and resend
            const otp = generateOTP();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
            // Update password if they changed it during re-registration
            user.password = password;
            await user.save();

            // Send Email
            await sendOTP(user.email, otp);

            return res.status(200).json({
                message: 'User re-registered. A new OTP has been sent to your email.'
            });
        }

        // Create new user
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        user = await User.create({
            name,
            email,
            password,
            role: role || 'volunteer',
            otp,
            otpExpires,
            isVerified: false
        });

        // Send OTP Email
        await sendOTP(user.email, otp);

        res.status(201).json({
            message: 'Registration successful. Please check your email for the OTP to verify your account.',
            email: user.email
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        if (user.otp !== String(otp).trim()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Mark as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate Token
        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Email verified successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                hasCompletedProfile: user.hasCompletedProfile
            },
            token
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};


// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            // Optional: Auto-resend OTP here if they try to login while unverified
            return res.status(403).json({
                message: 'Email not verified. Please verify your OTP.',
                requiresOTP: true
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                message: 'Your account has been suspended by an Administrator. Please contact support.'
            });
        }

        if (!user.password) {
            return res.status(401).json({ message: 'Please login using Google, as this account was created with Google OAuth.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                hasCompletedProfile: user.hasCompletedProfile
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Auth user via Google OAuth (Login or Signup)
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { code, role, isLogin } = req.body;

        // Exchange authorization code for tokens
        const { tokens } = await client.getToken(code);

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Look for the user by email
        let user = await User.findOne({ email });

        if (user) {
            // User exists, but is suspended?
            if (user.isSuspended) {
                return res.status(403).json({ message: 'Your account has been suspended.' });
            }

            // Link Google ID if not already linked, and mark as verified
            if (!user.googleId) {
                user.googleId = googleId;
                user.isVerified = true;
                await user.save();
            }
        } else {
            // If they are explicitly trying to login, don't create an account automatically.
            if (isLogin) {
                return res.status(404).json({ message: 'Account not found. Please sign up first.', requiresSignup: true });
            }

            // Create a new user since they don't exist and are explicitly signing up
            user = await User.create({
                name,
                email,
                googleId,
                role: role || 'volunteer',
                isVerified: true // Google accounts have verified emails
            });
        }

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                hasCompletedProfile: user.hasCompletedProfile
            },
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Server error during Google authentication' });
    }
};
