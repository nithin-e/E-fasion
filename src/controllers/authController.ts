import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { googleAuth } from '../services/googleAuthService';
import { HTTP } from '../utils/statuscodes';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.registerUser(req.body);
    res.status(HTTP.CREATED).json({ success: true, message: 'Account created. Please verify your email.' });
  } catch (err) { next(err); }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.verifyOTP(req.body.email, req.body.code);
    res.status(HTTP.OK).json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, user } = await authService.loginUser(req.body.email, req.body.password);
    res.status(HTTP.OK).json({ success: true, token, user });
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
