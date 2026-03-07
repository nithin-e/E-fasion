import { Router } from 'express';
import * as admin from '../controllers/admin/adminController';
import { protect, restrictTo } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', admin.getBrands);

// Admin only routes
router.use(protect, restrictTo('admin'));
router.post('/', admin.createBrand);
router.patch('/:id', admin.updateBrand);
router.delete('/:id', admin.deleteBrand);

export default router;
