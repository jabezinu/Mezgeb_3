import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDB Connected...');

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: '0911355288' });
    
    if (existingUser) {
      console.log('User already exists. Exiting...');
      process.exit(0);
    }

    // Create new user
    const user = await User.create({
      phoneNumber: '0911355288',
      password: 'yabjab', // This will be hashed by the pre-save hook
    });

    console.log('User created successfully:', user);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
};

seedUser();
