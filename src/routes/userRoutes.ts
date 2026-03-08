import { Router } from 'express';
import * as user from '../controllers/userController';
import { getCoupons } from '../controllers/admin/adminController';
import { protect } from '../middlewares/authMiddleware';
import validateRequest from '../middlewares/validateRequest';
import { changePasswordValidation } from '../validations/authValidation';

const router = Router();

router.use(protect); // All user routes require auth

router.get('/profile', user.getProfile);
router.put('/profile', user.updateProfile);
router.patch('/change-password', validateRequest(changePasswordValidation), user.changePassword);

// Coupons (Read-only for users)
router.get('/coupons', getCoupons);

// Payment Methods
router.post('/saved-cards', user.addSavedCard);
router.delete('/saved-cards/:id', user.deleteSavedCard);
router.post('/saved-upi', user.addSavedUPI);
router.delete('/saved-upi/:id', user.deleteSavedUPI);
router.post('/saved-wallets', user.addSavedWallet);
router.delete('/saved-wallets/:id', user.deleteSavedWallet);

// Account Deletion
router.delete('/account', user.deleteAccount);

export default router;
