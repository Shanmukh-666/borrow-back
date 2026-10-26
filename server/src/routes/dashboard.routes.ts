import { Router } from 'express';
import { getDashboardSummary, getBorrowingHistory } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard/summary', authenticate, getDashboardSummary);
router.get('/history', authenticate, getBorrowingHistory);

export default router;
