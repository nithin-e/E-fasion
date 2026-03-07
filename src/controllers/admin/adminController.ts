import { Request, Response, NextFunction } from 'express';
import { Product } from '../../models/productModel';
import { Variant } from '../../models/variantModel';
import { Category } from '../../models/categoryModel';
import { Order } from '../../models/orderModel';
import { User } from '../../models/userModel';
import { Coupon } from '../../models/couponModel';
import { uploadToCloudinary } from '../../middlewares/uploadMiddleware';
import * as adminService from '../../services/adminService';
import { HTTP } from '../../utils/statuscodes';
import { AppError } from '../../middlewares/errorMiddleware';
import { logger } from '../../utils/logger';

// Helper to log admin actions
const logAdminAction = (admin: any, action: string, targetId: string, details: any = {}) => {
  logger.info(`[ADMIN_ACTION] Admin: ${admin.id} | Email: ${admin.email} | Action: ${action} | Target: ${targetId} | Details: ${JSON.stringify(details)}`);
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(HTTP.OK).json({ success: true, stats });
  } catch (err) { next(err); }
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const getAdminProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip((+/^(\d+)$/.exec(String(page))?.[1]! - 1) * +/^(\d+)$/.exec(String(limit))?.[1]!)
      .limit(+limit);
    const total = await Product.countDocuments();
    res.status(HTTP.OK).json({ success: true, products, total });
  } catch (err) { next(err); }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, brand, description, highlights, category, basePrice } = req.body;
    
    // Explicit field picking for security
    const productData = { name, brand, description, highlights, category, basePrice };
    
    const product = await Product.create(productData);
    logAdminAction(req.user, 'CREATE_PRODUCT', (product._id as any).toString(), { name });
    
    res.status(HTTP.CREATED).json({ success: true, product });
  } catch (err) { next(err); }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = req.params.id as string;
    const { name, brand, description, highlights, category, basePrice, is_deleted } = req.body;
    const updateData = { name, brand, description, highlights, category, basePrice, is_deleted };

    const product = await Product.findByIdAndUpdate(
      productId, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );
    
    if (!product) return next(new AppError('Product not found', HTTP.NOT_FOUND));
    
    logAdminAction(req.user, 'UPDATE_PRODUCT', (product._id as any).toString(), updateData);
    res.status(HTTP.OK).json({ success: true, product });
  } catch (err) { next(err); }
};

export const softDeleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = req.params.id as string;
    const product = await Product.findByIdAndUpdate(productId, { is_deleted: true }, { new: true });
    if (!product) return next(new AppError('Product not found', HTTP.NOT_FOUND));
    
    logAdminAction(req.user, 'SOFT_DELETE_PRODUCT', productId);
    res.status(HTTP.OK).json({ success: true, message: 'Product moved to trash' });
  } catch (err) { next(err); }
};

export const addVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = req.params.id as string;
    const product = await Product.findById(productId);
    if (!product) return next(new AppError('Product not found', HTTP.NOT_FOUND));

    // Upload images to Cloudinary
    const files = (req.files as Express.Multer.File[]) || [];
    const imageUrls: string[] = await Promise.all(
      files.map((f) => uploadToCloudinary(f.buffer, `suruchi/products/${productId}`))
    );

    const { size, shadeName, shadeHex, price, discountPrice, stock } = req.body;
    const variantData = { size, shadeName, shadeHex, price, discountPrice, stock, productId: product._id, images: imageUrls };

    const variant = await Variant.create(variantData);
    product.variants.push(variant as any);
    await product.save();

    logAdminAction(req.user, 'ADD_VARIANT', (product._id as any).toString(), { variantId: (variant._id as any).toString() });
    res.status(HTTP.CREATED).json({ success: true, variant });
  } catch (err) { next(err); }
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    let image = '';
    if (files.length > 0) {
      image = await uploadToCloudinary(files[0].buffer, 'suruchi/categories');
    }

    const { name, description } = req.body;
    const category = await Category.create({ name, description, image });
    
    logAdminAction(req.user, 'CREATE_CATEGORY', (category._id as any).toString(), { name });
    res.status(HTTP.CREATED).json({ success: true, category });
  } catch (err) { next(err); }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categoryId = req.params.id as string;
    const { name, description, is_deleted } = req.body;
    const updateData = { name, description, is_deleted };

    const category = await Category.findByIdAndUpdate(categoryId, { $set: updateData }, { new: true });
    if (!category) return next(new AppError('Category not found', HTTP.NOT_FOUND));

    logAdminAction(req.user, 'UPDATE_CATEGORY', categoryId, updateData);
    res.status(HTTP.OK).json({ success: true, category });
  } catch (err) { next(err); }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categoryId = req.params.id as string;
    const category = await Category.findByIdAndUpdate(categoryId, { is_deleted: true });
    if (!category) return next(new AppError('Category not found', HTTP.NOT_FOUND));

    logAdminAction(req.user, 'DELETE_CATEGORY', categoryId);
    res.status(HTTP.OK).json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.orderStatus = status;
    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((+String(page) - 1) * +String(limit))
      .limit(+String(limit));
    const total = await Order.countDocuments(filter);
    res.status(HTTP.OK).json({ success: true, orders, total });
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orderId = req.params.id as string;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
    if (!order) return next(new AppError('Order not found', HTTP.NOT_FOUND));

    logAdminAction(req.user, 'UPDATE_ORDER_STATUS', orderId, { status });
    res.status(HTTP.OK).json({ success: true, order });
  } catch (err) { next(err); }
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const customers = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((+String(page) - 1) * +String(limit))
      .limit(+String(limit));
    const total = await User.countDocuments({ role: 'user' });
    res.status(HTTP.OK).json({ success: true, customers, total });
  } catch (err) { next(err); }
};

export const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { is_blocked: blocked },
      { new: true, select: '-password' }
    );
    if (!user) return next(new AppError('User not found', HTTP.NOT_FOUND));

    logAdminAction(req.user, 'BLOCK_USER', userId, { blocked });
    res.status(HTTP.OK).json({ success: true, user });
  } catch (err) { next(err); }
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const getCoupons = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(HTTP.OK).json({ success: true, coupons });
  } catch (err) { next(err); }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, discount, minPurchase, maxRedeemable, expiresAt } = req.body;
    const couponData = { code, discount, minPurchase, maxRedeemable, expiresAt };
    
    const coupon = await Coupon.create(couponData);
    logAdminAction(req.user, 'CREATE_COUPON', (coupon._id as any).toString(), { code });
    res.status(HTTP.CREATED).json({ success: true, coupon });
  } catch (err) { next(err); }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const couponId = req.params.id as string;
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) return next(new AppError('Coupon not found', HTTP.NOT_FOUND));

    logAdminAction(req.user, 'DELETE_COUPON', couponId);
    res.status(HTTP.OK).json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
};

// ─── Sales Report ─────────────────────────────────────────────────────────────
export const getSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const from = new Date((req.query.from as string) || new Date(Date.now() - 30 * 86400000));
    const to = new Date((req.query.to as string) || new Date());
    const data = await adminService.getSalesReport(from, to);
    res.status(HTTP.OK).json({ success: true, data });
  } catch (err) { next(err); }
};

