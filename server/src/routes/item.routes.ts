import { Router } from 'express';
import {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  archiveItem,
  reactivateItem,
} from '../controllers/item.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// Static routes MUST come before parameterized /:id routes
router.get('/', getItems);
router.get('/mine', authenticate, getMyItems);
router.post('/', authenticate, createItem);

// Parameterized routes
router.get('/:id', optionalAuthenticate, getItemById);
router.patch('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, archiveItem);
router.patch('/:id/reactivate', authenticate, reactivateItem);

export default router;
