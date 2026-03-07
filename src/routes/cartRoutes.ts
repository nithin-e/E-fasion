import { Router } from 'express';
import * as cart from '../controllers/cartController';
import { protect } from '../middlewares/authMiddleware';
import validateRequest from '../middlewares/validateRequest';
import { addCartItemValidation, updateCartQtyValidation, applyCouponValidation } from '../validations/cartValidation';

const router = Router();

router.use(protect);

router.get('/', cart.getCart);
router.post('/', validateRequest(addCartItemValidation), cart.addToCart);
router.patch('/:variantId', validateRequest(updateCartQtyValidation), cart.updateCartQty);
router.delete('/:variantId', cart.removeFromCart);
router.post('/apply-coupon', validateRequest(applyCouponValidation), cart.applyCoupon);

export default router;
