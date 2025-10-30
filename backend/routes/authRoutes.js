import express from 'express';
import { registerUser, authUser, getUserProfile, updateDailyGoal, addGoalPeriod, updateGoalPeriod, deleteGoalPeriod } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/daily-goal', protect, updateDailyGoal);
router.post('/goal-period', protect, addGoalPeriod);
router.put('/goal-period/:id', protect, updateGoalPeriod);
router.delete('/goal-period/:id', protect, deleteGoalPeriod);

export default router;
