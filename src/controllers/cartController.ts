import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cartService';
import { HTTP } from '../utils/statuscodes';

export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.getCart(req.user!._id);
    res.status(HTTP.OK).json({ success: true, cart });
  } catch (err) { next(err); }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, variantId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user!._id, productId, variantId, quantity);
    res.status(HTTP.OK).json({ success: true, cart });
  } catch (err) { next(err); }
};

export const updateCartQty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.updateCartQty(req.user!._id, req.params.variantId as string, req.body.quantity);
    res.status(HTTP.OK).json({ success: true, cart });
  } catch (err) { next(err); }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await cartService.removeFromCart(req.user!._id, req.params.variantId as string);
    res.status(HTTP.OK).json({ success: true, cart });
  } catch (err) { next(err); }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await cartService.applyCoupon(req.user!._id, req.body.code);
    res.status(HTTP.OK).json({ success: true, ...result });
  } catch (err) { next(err); }
};
