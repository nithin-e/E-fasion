import { Router } from 'express';
import * as orders from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';
import validateRequest from '../middlewares/validateRequest';
import { checkoutValidation, verifyPaymentValidation } from '../validations/orderValidation';

const router = Router();

router.use(protect);

router.get('/my-orders', orders.getMyOrders);
router.get('/:id', orders.getOrderById);
router.post('/checkout', validateRequest(checkoutValidation), orders.checkout);
router.post('/verify-payment', validateRequest(verifyPaymentValidation), orders.verifyPayment);
router.patch('/:id/cancel', orders.cancelOrder);

export default router;
