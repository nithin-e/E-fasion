import { Router } from 'express';
import * as address from '../controllers/addressController';
import { protect } from '../middlewares/authMiddleware';
import validateRequest from '../middlewares/validateRequest';
import { addAddressValidation } from '../validations/addressValidation';

const router = Router();

router.use(protect);

router.get('/', address.getAddresses);
router.post('/', validateRequest(addAddressValidation), address.addAddress);
router.delete('/:id', address.deleteAddress);

export default router;
