import express from 'express';
import { registerUser, authUser, getUserProfile, updateDailyGoal } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/daily-goal', protect, updateDailyGoal);

export default router;
