import { Router } from 'express';
import { checkServiceable } from '../controllers/deliveryController';

const router = Router();

// Public route to check serviceability
router.get('/check-serviceable', checkServiceable);

export default router;
