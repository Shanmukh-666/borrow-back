import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Review } from '../models/Review';
import { BorrowRequest } from '../models/BorrowRequest';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../services/requestLifecycle.service';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params; // BorrowRequest ID
    const { rating, comment } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
    }

    const request = await BorrowRequest.findById(id);
    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
    }

    if (request.status !== 'completed') {
      throw new AppError(
        400,
        'INVALID_REQUEST_STATUS',
        'Reviews can only be submitted for completed borrowing transactions'
      );
    }

    const isOwner = request.owner.toString() === req.user.id;
    const isBorrower = request.borrower.toString() === req.user.id;

    if (!isOwner && !isBorrower) {
      throw new AppError(403, 'FORBIDDEN', 'Only participants in this transaction can leave a review');
    }

    // Determine reviewee
    const revieweeId = isOwner ? request.borrower : request.owner;

    if (revieweeId.toString() === req.user.id) {
      throw new AppError(400, 'SELF_REVIEW_NOT_ALLOWED', 'You cannot review yourself');
    }

    // Check rating
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Rating must be an integer between 1 and 5', [
        { field: 'rating', message: 'Rating must be an integer between 1 and 5' },
      ]);
    }

    // Check if user already reviewed this request
    const existingReview = await Review.findOne({
      request: request._id,
      reviewer: req.user.id,
    });

    if (existingReview) {
      throw new AppError(409, 'DUPLICATE_REVIEW', 'You have already submitted a review for this transaction');
    }

    const trimmedComment = typeof comment === 'string' ? comment.trim().slice(0, 300) : '';

    const review = new Review({
      request: request._id,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating: ratingNum,
      comment: trimmedComment,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params; // User ID

    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const { page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ reviewee: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('reviewer', 'name')
        .lean(),
      Review.countDocuments({ reviewee: id }),
    ]);

    const allUserReviews = await Review.find({ reviewee: id }).select('rating').lean();
    const averageRating =
      allUserReviews.length > 0
        ? Number((allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length).toFixed(1))
        : null;

    const formattedReviews = reviews.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      data: {
        reviews: formattedReviews,
        summary: {
          totalReviews: total,
          averageRating,
        },
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
