import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { getUsers, updateUserStatus, updateUser, deleteUser, getDashboardStats, getUserDetails } from '../controllers/adminController.js';
import { getAllEvents, updateEventStatus as updateAdminEventStatus } from '../controllers/adminEventController.js';

const router = express.Router();

// Route all Admin endpoints through the authenticator and the adminRole gatekeeper
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

// Event Management Routes
router.get('/events', getAllEvents);
router.patch('/events/:id/status', updateAdminEventStatus);

// User Management Routes
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/status', updateUserStatus);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
