import { Router } from 'express';
import * as user from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import validateRequest from '../middlewares/validateRequest';
import { changePasswordValidation } from '../validations/authValidation';

const router = Router();

router.use(protect); // All user routes require auth

router.get('/profile', user.getProfile);
router.put('/profile', user.updateProfile);
router.patch('/change-password', validateRequest(changePasswordValidation), user.changePassword);

export default router;
