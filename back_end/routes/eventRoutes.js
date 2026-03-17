import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import {
    createEvent, getOrganizerEvents, getEventDetails,
    getEventApplications, updateApplicationStatus,
    getAllUpcomingEvents, getVolunteerApplications, applyForEvent,
    getAllOrganizerApplications, getOrganizerDashboardStats
} from '../controllers/eventController.js';

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists or gets created
    },
    filename(req, file, cb) {
        // Create unique filenames: fieldname-timestamp.extension
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    }
});

// File validation mapping
const checkFileType = (file, cb) => {
    // Allowed extensions
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (jpg, jpeg, png, webp)'));
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All event routes must be authenticated
router.use(protect);

// @route   GET /api/events
router.get('/', getAllUpcomingEvents);

// @route   POST /api/events
router.post('/', upload.single('photo'), createEvent);

// @route   GET /api/events/organizer
router.get('/organizer', getOrganizerEvents);

// NOTE: Specific pathways must be mapped BEFORE /:id to prevent Express treating them as wildcard IDs
// @route   GET /api/events/organizer/dashboard
router.get('/organizer/dashboard', getOrganizerDashboardStats);

// @route   GET /api/events/organizer/applications
router.get('/organizer/applications', getAllOrganizerApplications);

// @route   GET /api/events/volunteer/applications
router.get('/volunteer/applications', getVolunteerApplications);

// @route   GET /api/events/:id
router.get('/:id', getEventDetails);

// @route   POST /api/events/:id/apply
router.post('/:id/apply', applyForEvent);

// @route   GET /api/events/:id/applications
router.get('/:id/applications', getEventApplications);

// @route   PATCH /api/events/:eventId/applications/:applicationId/status
router.patch('/:eventId/applications/:applicationId/status', updateApplicationStatus);

export default router;
