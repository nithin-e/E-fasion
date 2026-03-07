import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import addressRoutes from './addressRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import orderRoutes from './orderRoutes';
import adminRoutes from './adminRoutes';
import brandRoutes from './brandRoutes';
import bannerRoutes from './bannerRoutes';
import categoryRoutes from './categoryRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/brands', brandRoutes);
router.use('/banners', bannerRoutes);
router.use('/categories', categoryRoutes);

export default router;
