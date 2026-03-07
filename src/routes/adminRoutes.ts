import { Router } from 'express';
import * as admin from '../controllers/admin/adminController';
import { protect, restrictTo } from '../middlewares/authMiddleware';
import validateRequest from '../middlewares/validateRequest';
import { 
  addProductValidation, 
  updateProductValidation,
  addVariantValidation, 
  addCategoryValidation, 
  updateCategoryValidation,
  addBrandValidation,
  updateBrandValidation,
  addBannerValidation,
  addCouponValidation 
} from '../validations/productValidation';
import { updateOrderStatusValidation } from '../validations/orderValidation';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Protect ALL admin routes
router.use(protect, restrictTo('admin'));

// Dashboard
router.get('/dashboard', admin.getDashboard);

// Products
router.get('/products', admin.getAdminProducts);
router.post('/products', validateRequest(addProductValidation), admin.createProduct);
router.put('/products/:id', validateRequest(updateProductValidation), admin.updateProduct);
router.delete('/products/:id', admin.softDeleteProduct);
router.post('/products/:id/variants', upload.array('images', 10), validateRequest(addVariantValidation), admin.addVariant);

// Categories
router.get('/categories', admin.getCategories);
router.post('/categories', upload.array('images', 1), validateRequest(addCategoryValidation), admin.createCategory);
router.put('/categories/:id', upload.array('images', 1), validateRequest(updateCategoryValidation), admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Orders
router.get('/orders', admin.getAllOrders);
router.patch('/orders/:id/status', validateRequest(updateOrderStatusValidation), admin.updateOrderStatus);

// Variants (Direct management)
router.put('/variants/:id', upload.array('images', 10), admin.updateVariant);
router.delete('/variants/:id', admin.deleteVariant);

// Customers
router.get('/customers', admin.getCustomers);
router.patch('/customers/:id/block', admin.blockUser);

// Coupons
router.get('/coupons', admin.getCoupons);
router.post('/coupons', validateRequest(addCouponValidation), admin.createCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);

// Brands
router.get('/brands', admin.getBrands);
router.post('/brands', upload.array('logo', 1), validateRequest(addBrandValidation), admin.createBrand);
router.put('/brands/:id', upload.array('logo', 1), validateRequest(updateBrandValidation), admin.updateBrand);
router.delete('/brands/:id', admin.deleteBrand);

// Banners
router.get('/banners', admin.getBanners);
router.post('/banners', upload.array('image', 1), validateRequest(addBannerValidation), admin.createBanner);
router.delete('/banners/:id', admin.deleteBanner);

// Sales Report
router.get('/sales', admin.getSalesReport);

export default router;
