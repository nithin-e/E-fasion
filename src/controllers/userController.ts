import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';
import { HTTP } from '../utils/statuscodes';
import { AppError } from '../middlewares/errorMiddleware';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    res.status(HTTP.OK).json({ success: true, user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, mobile },
      { new: true, runValidators: true, select: '-password' }
    );
    res.status(HTTP.OK).json({ success: true, user });
  } catch (err) { next(err); }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('+password');
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) { next(new AppError('Current password is incorrect', HTTP.BAD_REQUEST)); return; }

    user.password = req.body.newPassword;
    await user.save();
    res.status(HTTP.OK).json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
