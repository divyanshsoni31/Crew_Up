import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/volunteerController.js';

const router = express.Router();

// Multer Storage Configuration for Profile Photos
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Protect all routes
router.use(protect);

router.route('/profile')
    .get(getProfile)
    .post(upload.single('profilePhoto'), updateProfile);

export default router;
