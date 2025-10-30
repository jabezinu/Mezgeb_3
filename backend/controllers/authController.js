import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ phoneNumber });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      phoneNumber,
      password, // Password will be hashed in the pre-save hook
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        dailyGoal: user.dailyGoal,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user daily goal
// @route   PUT /api/auth/daily-goal
// @access  Private
export const updateDailyGoal = async (req, res) => {
  try {
    const { dailyGoal } = req.body;

    if (typeof dailyGoal !== 'number' || dailyGoal < 1 || dailyGoal > 50) {
      return res.status(400).json({ message: 'Daily goal must be a number between 1 and 50' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { dailyGoal },
      { new: true }
    );

    if (user) {
      res.json({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        dailyGoal: user.dailyGoal,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
