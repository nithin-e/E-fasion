import { Request, Response, NextFunction } from 'express';
import { User } from '../models/userModel';
import { HTTP } from '../utils/statuscodes';
import { AppError } from '../middlewares/errorMiddleware';

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('-password');
    res.status(HTTP.OK).json({ success: true, user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, mobile, email, gender, birthday, alternateMobile } = req.body;
    
    // Build update object based on what's provided
    const updates: any = {};
    if (name) updates.name = name;
    if (mobile) updates.mobile = mobile;
    if (email) updates.email = email;
    if (gender) updates.gender = gender;
    if (birthday) updates.birthday = birthday;
    if (alternateMobile !== undefined) updates.alternateMobile = alternateMobile;

    const user = await User.findByIdAndUpdate(
      (req as any).user._id,
      updates,
      { new: true, runValidators: true, select: '-password' }
    );
    res.status(HTTP.OK).json({ success: true, user });
  } catch (err) { next(err); }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id).select('+password');
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) { next(new AppError('Current password is incorrect', HTTP.BAD_REQUEST)); return; }

    user.password = req.body.newPassword;
    await user.save();
    res.status(HTTP.OK).json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

// --- Mock Payment Methods Management ---
export const addSavedCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }
    
    user.savedCards.push(req.body);
    await user.save();
    res.status(HTTP.OK).json({ success: true, savedCards: user.savedCards });
  } catch (err) { next(err); }
};

export const deleteSavedCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }
    
    user.savedCards = user.savedCards.filter((c: any) => c._id.toString() !== req.params.id);
    await user.save();
    res.status(HTTP.OK).json({ success: true, savedCards: user.savedCards });
  } catch (err) { next(err); }
};

export const addSavedUPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }
    
    user.savedUPI.push(req.body);
    await user.save();
    res.status(HTTP.OK).json({ success: true, savedUPI: user.savedUPI });
  } catch (err) { next(err); }
};

export const deleteSavedUPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }
    
    user.savedUPI = user.savedUPI.filter((u: any) => u._id.toString() !== req.params.id);
    await user.save();
    res.status(HTTP.OK).json({ success: true, savedUPI: user.savedUPI });
  } catch (err) { next(err); }
};

export const addSavedWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }
    
    user.savedWallets.push(req.body);
    await user.save();
    res.status(HTTP.OK).json({ success: true, savedWallets: user.savedWallets });
  } catch (err) { next(err); }
};

export const deleteSavedWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }
    
    user.savedWallets = user.savedWallets.filter((w: any) => w._id.toString() !== req.params.id);
    await user.save();
    res.status(HTTP.OK).json({ success: true, savedWallets: user.savedWallets });
  } catch (err) { next(err); }
};

// --- Account Deletion ---
export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).user._id);
    if (!user) { next(new AppError('User not found', HTTP.NOT_FOUND)); return; }

    user.is_deleted = true;
    await user.save();

    res.cookie('jwt', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
    res.status(HTTP.OK).json({ success: true, message: 'Account successfully deleted' });
  } catch (err) { next(err); }
};
