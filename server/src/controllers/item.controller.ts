import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Item, ITEM_CATEGORIES, ITEM_CONDITIONS } from '../models/Item';
import { BorrowRequest } from '../models/BorrowRequest';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../services/requestLifecycle.service';

export const getItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, category, condition, sort, page, limit } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(24, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const query: any = { status: 'active' };

    if (typeof search === 'string' && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (typeof category === 'string' && category.trim()) {
      query.category = category.trim();
    }

    if (typeof condition === 'string' && condition.trim()) {
      query.condition = condition.trim();
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'title_asc' || sort === 'Title A-Z') {
      sortObj = { title: 1 };
    } else if (sort === 'title_desc' || sort === 'Title Z-A') {
      sortObj = { title: -1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    }

    const [items, total] = await Promise.all([
      Item.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('owner', 'name')
        .lean(),
      Item.countDocuments(query),
    ]);

    const formattedItems = items.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
      owner: item.owner
        ? {
            id: (item.owner as any)._id?.toString() || (item.owner as any).id,
            name: (item.owner as any).name,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyItems = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const items = await Item.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .populate('owner', 'name')
      .lean();

    const activeCount = items.filter((i) => i.status === 'active').length;
    const archivedCount = items.filter((i) => i.status === 'archived').length;

    const formattedItems = items.map((item) => ({
      ...item,
      id: item._id.toString(),
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        counts: {
          total: items.length,
          active: activeCount,
          archived: archivedCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    const item = await Item.findById(id).populate('owner', 'name createdAt');
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    // If item is archived, only the owner can view it
    const isOwner = req.user && item.owner._id.toString() === req.user.id;
    if (item.status === 'archived' && !isOwner) {
      throw new AppError(404, 'ITEM_UNAVAILABLE', 'This listing is no longer active');
    }

    // Owner reviews summary
    const ownerReviews = await Review.find({ reviewee: item.owner._id });
    const reviewCount = ownerReviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((ownerReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : null;

    const itemObj: any = item.toJSON();
    itemObj.ownerSummary = {
      id: (item.owner as any)._id.toString(),
      name: (item.owner as any).name,
      rating: avgRating,
      reviewCount,
    };

    res.status(200).json({
      success: true,
      data: { item: itemObj },
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { title, description, category, condition, pickupNote, imageUrl } = req.body;

    const validationDetails: Array<{ field: string; message: string }> = [];

    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedDesc = typeof description === 'string' ? description.trim() : '';
    const trimmedPickup = typeof pickupNote === 'string' ? pickupNote.trim() : '';
    const trimmedImage = typeof imageUrl === 'string' ? imageUrl.trim() : '';

    if (!trimmedTitle || trimmedTitle.length < 3 || trimmedTitle.length > 80) {
      validationDetails.push({ field: 'title', message: 'Title must be between 3 and 80 characters' });
    }

    if (!trimmedDesc || trimmedDesc.length < 20 || trimmedDesc.length > 1000) {
      validationDetails.push({ field: 'description', message: 'Description must be between 20 and 1000 characters' });
    }

    if (!category || !ITEM_CATEGORIES.includes(category)) {
      validationDetails.push({ field: 'category', message: 'Please select a valid category' });
    }

    if (!condition || !ITEM_CONDITIONS.includes(condition)) {
      validationDetails.push({ field: 'condition', message: 'Please select a valid condition' });
    }

    if (trimmedPickup && trimmedPickup.length > 100) {
      validationDetails.push({ field: 'pickupNote', message: 'Pickup note cannot exceed 100 characters' });
    }

    if (validationDetails.length > 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed for listing', validationDetails);
    }

    const item = new Item({
      owner: req.user.id,
      title: trimmedTitle,
      description: trimmedDesc,
      category,
      condition,
      pickupNote: trimmedPickup,
      imageUrl: trimmedImage || undefined,
      status: 'active',
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item listed successfully',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    const item = await Item.findById(id);
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    if (item.owner.toString() !== req.user.id) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to edit this listing');
    }

    const { title, description, category, condition, pickupNote, imageUrl, status } = req.body;

    if (imageUrl !== undefined) {
      item.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
    }

    if (title !== undefined) {
      const trimmed = typeof title === 'string' ? title.trim() : '';
      if (trimmed.length < 3 || trimmed.length > 80) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Title must be between 3 and 80 characters', [
          { field: 'title', message: 'Title must be between 3 and 80 characters' },
        ]);
      }
      item.title = trimmed;
    }

    if (description !== undefined) {
      const trimmed = typeof description === 'string' ? description.trim() : '';
      if (trimmed.length < 20 || trimmed.length > 1000) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Description must be between 20 and 1000 characters', [
          { field: 'description', message: 'Description must be between 20 and 1000 characters' },
        ]);
      }
      item.description = trimmed;
    }

    if (category !== undefined) {
      if (!ITEM_CATEGORIES.includes(category)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid category');
      }
      item.category = category;
    }

    if (condition !== undefined) {
      if (!ITEM_CONDITIONS.includes(condition)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Invalid condition');
      }
      item.condition = condition;
    }

    if (pickupNote !== undefined) {
      const trimmed = typeof pickupNote === 'string' ? pickupNote.trim() : '';
      if (trimmed.length > 100) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Pickup note cannot exceed 100 characters');
      }
      item.pickupNote = trimmed;
    }

    if (status !== undefined && (status === 'active' || status === 'archived')) {
      item.status = status;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const archiveItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    const item = await Item.findById(id);
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    if (item.owner.toString() !== req.user.id) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to archive this listing');
    }

    // Check for active or pending requests
    const activeRequests = await BorrowRequest.findOne({
      item: item._id,
      status: { $in: ['pending', 'approved', 'borrowed', 'return_pending'] },
    });

    if (activeRequests) {
      throw new AppError(
        409,
        'ACTIVE_BORROWING_CONFLICT',
        'Cannot archive item with active or pending borrowing requests.'
      );
    }

    item.status = 'archived';
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item archived successfully',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

export const reactivateItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    const item = await Item.findById(id);
    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
    }

    if (item.owner.toString() !== req.user.id) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to reactivate this listing');
    }

    item.status = 'active';
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item reactivated successfully',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};
