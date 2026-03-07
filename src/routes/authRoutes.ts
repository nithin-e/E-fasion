import { Router } from 'express';
import * as auth from '../controllers/authController';
import validateRequest from '../middlewares/validateRequest';
import { registerValidation, loginValidation, otpValidation } from '../validations/authValidation';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', validateRequest(registerValidation), auth.register);
router.post('/verify-otp', validateRequest(otpValidation), auth.verifyOTP);
router.post('/login', validateRequest(loginValidation), auth.login);
router.post('/google', auth.googleSignIn);   // Google Sign-In / Sign-Up
router.post('/logout', protect, auth.logout);

export default router;
