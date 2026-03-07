import { Router } from 'express';
import * as admin from '../controllers/admin/adminController';

const router = Router();

router.get('/', admin.getCategories);

export default router;
