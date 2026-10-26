import { Router } from 'express';
import { getUserReviews } from '../controllers/review.controller';

const router = Router();

// GET /api/users/:id/reviews
router.get('/users/:id/reviews', getUserReviews);

export default router;
