import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { googleAuth } from '../services/googleAuthService';
import { HTTP } from '../utils/statuscodes';
import { env } from '../config/env';

export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'Mobile number is required' });
      return;
    }
    const otp = await authService.requestOtp(mobile);
    
    // In development, return the OTP for easier testing
    const response: any = { success: true, message: 'OTP sent successfully' };
    if (env.NODE_ENV === 'development') {
      response.otp = otp;
    }
    
    res.status(HTTP.OK).json(response);
  } catch (err) { next(err); }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { mobile, code } = req.body;
    if (!mobile || !code) {
      res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'Mobile and OTP are required' });
      return;
    }
    const result = await authService.verifyUnifiedOtp(mobile, code);
    res.status(HTTP.OK).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const completeSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email } = req.body;
    const userId = (req as any).user?._id;
    
    if (!userId) {
       res.status(HTTP.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
       return;
    }

    const user = await authService.updateProfile(userId, { name, email });
    res.status(HTTP.OK).json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, mobile: user.mobile }
    });
  } catch (err) { next(err); }
};

export const logout = (_req: Request, res: Response): void => {
  res.status(HTTP.OK).json({ success: true, message: 'Logged out successfully' });
};

export const googleSignIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'ID token is required' });
      return;
    }
    const result = await googleAuth(idToken);
    res.status(result.isNewUser ? HTTP.CREATED : HTTP.OK).json({ success: true, ...result });
  } catch (err) { next(err); }
};
