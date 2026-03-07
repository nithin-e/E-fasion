import { Request, Response, NextFunction } from 'express';
import { Wishlist } from '../models/wishlistModel';
import { HTTP } from '../utils/statuscodes';

export const getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user!._id })
      .populate({ path: 'products', match: { is_deleted: false }, populate: { path: 'variants', match: { is_deleted: false } } });
    res.status(HTTP.OK).json({ success: true, products: wishlist?.products || [] });
  } catch (err) { next(err); }
};

export const addToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Wishlist.findOneAndUpdate(
      { userId: req.user!._id },
      { $addToSet: { products: req.body.productId } },
      { upsert: true, new: true }
    );
    res.status(HTTP.OK).json({ success: true, message: 'Added to wishlist' });
  } catch (err) { next(err); }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Wishlist.findOneAndUpdate(
      { userId: req.user!._id },
      { $pull: { products: req.params.productId } }
    );
    res.status(HTTP.OK).json({ success: true, message: 'Removed from wishlist' });
  } catch (err) { next(err); }
};
