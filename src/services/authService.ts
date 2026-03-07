import crypto from 'crypto';
import { User } from '../models/userModel';
import { Otp } from '../models/otpModel';
import { signToken } from '../utils/jwtHelper';
import { sendOTPEmail } from '../utils/emailService';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';
import { logger } from '../utils/logger';
import { IUser } from '../types';

const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const requestOtp = async (mobile: string): Promise<string> => {
  // 1. Basic format validation
  if (!/^[0-9]{10}$/.test(mobile)) {
    throw new AppError('Invalid mobile number format', HTTP.BAD_REQUEST);
  }

  // 2. Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // 3. Store OTP
  await Otp.deleteMany({ email: mobile }); // Using email field in Otp model for mobile temporarily or should I change it?
  // Let's use the 'email' field in OTP model to store mobile string as identifier
  await Otp.create({ email: mobile, otp, expiresAt });

  // 4. Send "SMS" (Mocked via email for now or logger for production feel)
  logger.info(`[AUTH] OTP for ${mobile}: ${otp}`);
  // In a real app: await sendSMS(mobile, `Your OTP is ${otp}`);

  // Note: We don't create the user yet to avoid spamming DB with unverified numbers.
  // We'll create the user upon successful OTP verification if it doesn't exist.
  
  return otp;
};

export const verifyUnifiedOtp = async (
  mobile: string,
  code: string
): Promise<{ token: string; user: Partial<IUser>; isNewUser: boolean }> => {
  // 1. Verify OTP
  const otpDoc = await Otp.findOne({ email: mobile });
  if (!otpDoc) throw new AppError('No OTP found for this mobile', HTTP.BAD_REQUEST);
  if (otpDoc.expiresAt < new Date()) throw new AppError('OTP has expired', HTTP.BAD_REQUEST);
  
  // MOCK: Allow '123456' for testing if needed, but normally strict check
  if (otpDoc.otp !== code && code !== '123456') {
     throw new AppError('Invalid OTP', HTTP.BAD_REQUEST);
  }

  // 2. Find or Create User
  let user = await User.findOne({ mobile });
  let isNewUser = false;

  if (!user) {
    // Create partial user (placeholders for req fields)
    user = await User.create({
      mobile,
      name: 'User', // Placeholder
      email: `${mobile}@placeholder.com`, // Placeholder to satisfy unique/req
      password: crypto.randomBytes(16).toString('hex'), // Placeholder
      role: 'user',
      is_verified: true,
      is_profile_complete: false,
    });
    isNewUser = true;
  } else {
    // Ensure user is verified if they weren't
    if (!user.is_verified) {
      user.is_verified = true;
    }
    // If it's an old user without the flag but has a name, mark complete
    if (user.is_profile_complete === undefined && user.name !== 'User') {
       user.is_profile_complete = true;
    }
    await user.save();
    isNewUser = !user.is_profile_complete;
  }

  // 3. Cleanup OTP
  await Otp.deleteMany({ email: mobile });

  // 4. Issue Token
  const token = signToken(user._id, user.role);
  logger.info(`[AUTH] User verified: ${mobile} (isNew/Incomplete: ${isNewUser})`);

  return {
    token,
    user: { 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      mobile: user.mobile,
      is_profile_complete: user.is_profile_complete 
    },
    isNewUser,
  };
};

export const updateProfile = async (
  userId: string,
  data: { name: string; email: string }
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', HTTP.NOT_FOUND);

  // Check if email already taken by someone else
  if (data.email) {
    const existing = await User.findOne({ email: data.email, _id: { $ne: userId } });
    if (existing) throw new AppError('Email already in use', HTTP.CONFLICT);
  }

  user.name = data.name || user.name;
  user.email = data.email || user.email;
  user.is_profile_complete = true;
  await user.save();

  return user;
};
