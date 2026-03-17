import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (req.user.isSuspended) {
                return res.status(403).json({ message: 'Your account has been suspended' });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.log('JWT Expired: Rejecting request');
            } else {
                console.error('Auth Error:', error.message);
            }
            return res.status(401).json({ message: 'Not authorized, token failed', error: error.name });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
