import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables are initialized via import 'dotenv/config' above

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';

// Middleware
app.use(cors());
app.use(express.json());

// Main App Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteer', volunteerRoutes);

// Static file serving for Multer Photo Uploads
const uploadDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Uploads directory created');
}
app.use('/uploads', express.static(uploadDir));

// Database Connection
const connectDB = async () => {
    try {
        // Fallback to local MongoDB if URI is not provided in .env
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crewup';
        await mongoose.connect(uri);
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'CrewUp API is running' });
});

// Start Server
app.listen(PORT, async () => {
    await connectDB();
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
