import { Router } from 'express';
import * as products from '../controllers/productController';

const router = Router();

router.get('/categories', products.getCategories);
router.get('/', products.getProducts);
router.get('/:id/recommendations', products.getProductRecommendations);
router.get('/:id', products.getProduct);

export default router;
