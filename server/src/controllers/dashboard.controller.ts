import { Response, NextFunction } from 'express';
import { Item } from '../models/Item';
import { BorrowRequest } from '../models/BorrowRequest';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../services/requestLifecycle.service';

export const getDashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const userId = req.user.id;

    const [activeListingsCount, incomingPendingCount, requestsSentCount, activeBorrowingsCount] =
      await Promise.all([
        Item.countDocuments({ owner: userId, status: 'active' }),
        BorrowRequest.countDocuments({ owner: userId, status: 'pending' }),
        BorrowRequest.countDocuments({ borrower: userId }),
        BorrowRequest.countDocuments({
          $or: [{ owner: userId }, { borrower: userId }],
          status: { $in: ['borrowed', 'return_pending'] },
        }),
      ]);

    // Up to 5 recent requests involving the user
    const recentRequests = await BorrowRequest.find({
      $or: [{ owner: userId }, { borrower: userId }],
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('item', 'title category status')
      .populate('owner', 'name')
      .populate('borrower', 'name')
      .lean();

    const formattedRecentActivity = recentRequests
      .filter((r) => r && (r.owner || r.borrower))
      .map((r) => {
        const ownerId =
          (r.owner as any)?._id?.toString() ||
          (r.owner as any)?.id ||
          r.owner?.toString();
        const isOwner = Boolean(ownerId && ownerId === userId);
        const counterpartName = isOwner
          ? (r.borrower as any)?.name || 'Community Borrower'
          : (r.owner as any)?.name || 'Community Lender';

        return {
          id: r._id.toString(),
          type: 'request',
          itemTitle: (r.item as any)?.title || 'Community Item',
          itemCategory: (r.item as any)?.category || 'General',
          role: isOwner ? 'owner' : 'borrower',
          counterpartName,
          status: r.status,
          startDate: r.startDate,
          endDate: r.endDate,
          updatedAt: r.updatedAt,
        };
      });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          activeListings: activeListingsCount,
          incomingPendingRequests: incomingPendingCount,
          requestsSent: requestsSentCount,
          activeBorrowings: activeBorrowingsCount,
        },
        recentActivity: formattedRecentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBorrowingHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const userId = req.user.id;
    const { status, role } = req.query;

    const query: any = {
      $or: [{ owner: userId }, { borrower: userId }],
    };

    if (role === 'borrower') {
      delete query.$or;
      query.borrower = userId;
    } else if (role === 'owner') {
      delete query.$or;
      query.owner = userId;
    }

    if (typeof status === 'string' && status.trim() && status !== 'all') {
      query.status = status.trim();
    }

    const requests = await BorrowRequest.find(query)
      .sort({ updatedAt: -1 })
      .populate('item', 'title description category condition pickupNote status')
      .populate('owner', 'name')
      .populate('borrower', 'name')
      .lean();

    // Check which requests have been reviewed by current user
    const requestIds = requests.map((r) => r._id);
    const userReviews = await Review.find({
      request: { $in: requestIds },
      reviewer: userId,
    }).lean();

    const reviewedRequestMap = new Set(userReviews.map((rev) => rev.request.toString()));

    const formattedHistory = requests.map((r) => {
      const ownerId =
        (r.owner as any)?._id?.toString() ||
        (r.owner as any)?.id ||
        r.owner?.toString();
      const isOwner = Boolean(ownerId && ownerId === userId);
      return {
        ...r,
        id: r._id.toString(),
        _id: undefined,
        isOwner,
        hasReviewed: reviewedRequestMap.has(r._id.toString()),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        history: formattedHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
