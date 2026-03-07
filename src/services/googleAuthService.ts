import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/userModel';
import { signToken } from '../utils/jwtHelper';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { IUser } from '../types';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleAuth = async (
  idToken: string
): Promise<{ token: string; user: Partial<IUser>; isNewUser: boolean }> => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google Sign-In is not configured on this server', HTTP.INTERNAL_ERROR);
  }

  // 1. Verify Google ID token server-side
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new AppError('Invalid Google token', HTTP.UNAUTHORIZED);
  }

  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError('Google account has no email', HTTP.BAD_REQUEST);
  if (!payload.email_verified) throw new AppError('Google email is not verified', HTTP.BAD_REQUEST);

  const { email, name = 'Google User', sub: googleId } = payload;

  // 2. Find existing user OR create a new one (upsert)
  let isNewUser = false;
  let user = await User.findOne({ email });

  if (!user) {
    // New sign-up via Google — no password needed (random placeholder)
    const randomPassword = googleId + Date.now().toString();
    user = await User.create({
      name,
      email,
      mobile: '',         // No mobile from Google — user can fill in profile later
      password: randomPassword,
      is_verified: true,  // Google already verified the email
      role: 'user',
    });
    isNewUser = true;
    logger.info(`New user via Google: ${email}`);
  } else {
    if (user.is_blocked) throw new AppError('Your account has been suspended', HTTP.FORBIDDEN);
    // Mark verified if somehow not (legacy accounts)
    if (!user.is_verified) {
      user.is_verified = true;
      await user.save();
    }
    logger.info(`Existing user Google login: ${email}`);
  }

  const token = signToken(user._id, user.role);

  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    isNewUser,
  };
};
