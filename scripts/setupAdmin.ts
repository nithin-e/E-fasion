import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/userModel';

dotenv.config();

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const email = 'admin@suruchi.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'System Admin',
      email: email,
      mobile: '0123456789',
      password: 'AdminPassword123',
      role: 'admin',
      is_verified: true,
    });

    console.log('Admin created successfully!');
    console.log('Email:', email);
    console.log('Password: AdminPassword123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
