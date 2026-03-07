import { Router } from 'express';
import * as auth from '../controllers/authController';
import validateRequest from '../middlewares/validateRequest';
import { sendOtpValidation, verifyOtpValidation, completeSignupValidation } from '../validations/authValidation';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/send-otp', validateRequest(sendOtpValidation), auth.sendOtp);
router.post('/verify-otp', validateRequest(verifyOtpValidation), auth.verifyOtp);
router.post('/complete-signup', protect, validateRequest(completeSignupValidation), auth.completeSignup);

router.post('/google', auth.googleSignIn);
router.post('/logout', protect, auth.logout);

export default router;
