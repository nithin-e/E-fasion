import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/orderModel';
import * as orderService from '../services/orderService';
import { HTTP } from '../utils/statuscodes';
import { AppError } from '../middlewares/errorMiddleware';

export const checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orderService.createOrder(req.user!._id, req.body.addressId, req.body.paymentMethod);
    res.status(HTTP.CREATED).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.verifyRazorpayPayment(req.body);
    res.status(HTTP.OK).json({ success: true, orderId: order._id });
  } catch (err) { next(err); }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find({ userId: req.user!._id }).sort({ createdAt: -1 }).lean();
    res.status(HTTP.OK).json({ success: true, orders });
  } catch (err) { next(err); }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!._id })
      .populate('products.productId', 'name brand')
      .populate('products.variantId', 'size shadeName images');
    if (!order) { next(new AppError('Order not found', HTTP.NOT_FOUND)); return; }
    res.status(HTTP.OK).json({ success: true, order });
  } catch (err) { next(err); }
};

export const cancelOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!order) { next(new AppError('Order not found', HTTP.NOT_FOUND)); return; }
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      next(new AppError('Order cannot be cancelled at this stage', HTTP.BAD_REQUEST)); return;
    }
    order.orderStatus = 'cancelled';
    await order.save();
    res.status(HTTP.OK).json({ success: true, message: 'Order cancelled' });
  } catch (err) { next(err); }
};
