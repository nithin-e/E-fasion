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
router.post('/products', upload.array('images', 1), validateRequest(addProductValidation), admin.createProduct);
router.put('/products/:id', validateRequest(updateProductValidation), admin.updateProduct);
router.delete('/products/:id', admin.softDeleteProduct);
router.post('/products/:id/variants', upload.array('images', 10), validateRequest(addVariantValidation), admin.addVariant);

// Categories
router.post('/categories', upload.array('images', 1), validateRequest(addCategoryValidation), admin.createCategory);
router.put('/categories/:id', validateRequest(updateCategoryValidation), admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

// Orders
router.get('/orders', admin.getAllOrders);
router.patch('/orders/:id/status', validateRequest(updateOrderStatusValidation), admin.updateOrderStatus);

// Customers
router.get('/customers', admin.getCustomers);
router.patch('/customers/:id/block', admin.blockUser);

// Coupons
router.get('/coupons', admin.getCoupons);
router.post('/coupons', validateRequest(addCouponValidation), admin.createCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);

// Sales Report
router.get('/sales', admin.getSalesReport);

export default router;
