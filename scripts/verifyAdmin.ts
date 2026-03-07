import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/userModel';

dotenv.config();

const verifyAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const email = 'admin@suruchi.com';
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    const result = await User.findOneAndUpdate(
      { email },
      { is_verified: true, password: hashedPassword },
      { new: true, runValidators: false }
    );
    
    if (result) {
      console.log('Admin user updated and password reset successfully:', email);
    } else {
      console.log('Admin user not found.');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error verifying admin:', error);
    process.exit(1);
  }
};

verifyAdmin();
