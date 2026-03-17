import express from 'express';
import { register, verifyOTP, login, googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/google', googleLogin);

export default router;
