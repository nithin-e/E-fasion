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

export const registerUser = async (data: {
  name: string;
  email: string;
  mobile: string;
  password: string;
}): Promise<void> => {
  const existing = await User.findOne({ $or: [{ email: data.email }, { mobile: data.mobile }] });
  if (existing) {
    throw new AppError('Email or mobile already registered', HTTP.CONFLICT);
  }

  await User.create(data);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.deleteMany({ email: data.email });
  await Otp.create({ email: data.email, otp, expiresAt });
  await sendOTPEmail(data.email, otp);
  logger.info(`User registered, OTP sent to ${data.email}`);
};

export const verifyOTP = async (email: string, code: string): Promise<void> => {
  const otpDoc = await Otp.findOne({ email });
  if (!otpDoc) throw new AppError('No OTP found for this email', HTTP.BAD_REQUEST);
  if (otpDoc.expiresAt < new Date()) throw new AppError('OTP has expired', HTTP.BAD_REQUEST);
  if (otpDoc.otp !== code) throw new AppError('Invalid OTP', HTTP.BAD_REQUEST);

  await User.updateOne({ email }, { is_verified: true });
  await Otp.deleteMany({ email });
  logger.info(`Email verified: ${email}`);
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ token: string; user: Partial<IUser> }> => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', HTTP.UNAUTHORIZED);
  if (!user.is_verified) throw new AppError('Please verify your email first', HTTP.UNAUTHORIZED);
  if (user.is_blocked) throw new AppError('Your account has been suspended', HTTP.FORBIDDEN);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', HTTP.UNAUTHORIZED);

  const token = signToken(user._id, user.role);
  logger.info(`User logged in: ${email}`);

  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  };
};
