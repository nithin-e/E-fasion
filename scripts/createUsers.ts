import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/userModel';

dotenv.config();

const createUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB ...');

    // Create Admin User
    const adminEmail = 'admin@suruchi.com';
    await User.findOneAndDelete({ email: adminEmail });
    await User.create({
      name: 'Admin User',
      email: adminEmail,
      mobile: '9999999999',
      password: 'AdminPassword123!',
      role: 'admin',
      is_verified: true
    });
    console.log(`Admin user created: ${adminEmail} / AdminPassword123!`);

    // Create Normal User
    const normalEmail = 'user@suruchi.com';
    await User.findOneAndDelete({ email: normalEmail });
    await User.create({
      name: 'Normal User',
      email: normalEmail,
      mobile: '8888888888',
      password: 'UserPassword123!',
      role: 'user',
      is_verified: true
    });
    console.log(`Normal user created: ${normalEmail} / UserPassword123!`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createUsers();
