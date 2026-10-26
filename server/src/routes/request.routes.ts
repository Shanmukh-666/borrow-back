import { Router } from 'express';
import {
  submitRequest,
  getMyRequests,
  getReceivedRequests,
  getRequestById,
  decideRequest,
  cancelRequest,
  pickupRequest,
  returnRequest,
} from '../controllers/request.controller';
import { createReview } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Static routes MUST come before parameterized /:id routes
router.post('/', authenticate, submitRequest);
router.get('/mine', authenticate, getMyRequests);
router.get('/received', authenticate, getReceivedRequests);

// Parameterized routes
router.get('/:id', authenticate, getRequestById);
router.patch('/:id/decision', authenticate, decideRequest);
router.patch('/:id/cancel', authenticate, cancelRequest);
router.patch('/:id/pickup', authenticate, pickupRequest);
router.patch('/:id/return', authenticate, returnRequest);
router.post('/:id/reviews', authenticate, createReview);

export default router;
