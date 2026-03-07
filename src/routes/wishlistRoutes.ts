import { Router } from 'express';
import * as wishlist from '../controllers/wishlistController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', wishlist.getWishlist);
router.post('/', wishlist.addToWishlist);
router.delete('/:productId', wishlist.removeFromWishlist);

export default router;
