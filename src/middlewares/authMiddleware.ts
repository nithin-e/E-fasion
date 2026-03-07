import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtHelper';
import { User } from '../models/userModel';
import { HTTP } from '../utils/statuscodes';
import { logger } from '../utils/logger';

// Authenticate JWT and attach user to request
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(HTTP.UNAUTHORIZED).json({ success: false, message: 'No token provided' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      res.status(HTTP.UNAUTHORIZED).json({ success: false, message: 'User not found' });
      return;
    }
    if (user.is_blocked) {
      res.status(HTTP.FORBIDDEN).json({ success: false, message: 'Your account has been suspended' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('Auth middleware – invalid token', err);
    res.status(HTTP.UNAUTHORIZED).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Restrict to given roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(HTTP.FORBIDDEN).json({ success: false, message: 'Access denied' });
      return;
    }
    next();
  };
};
