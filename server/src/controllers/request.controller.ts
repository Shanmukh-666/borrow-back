import { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { BorrowRequest } from '../models/BorrowRequest';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createBorrowRequest,
  handleOwnerDecision,
  cancelBorrowRequest,
  confirmPickup,
  confirmReturn,
  AppError,
} from '../services/requestLifecycle.service';

export const submitRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { itemId, startDate, endDate, message } = req.body;

    const request = await createBorrowRequest({
      itemId,
      borrowerId: req.user.id,
      startDate,
      endDate,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Borrow request submitted successfully',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { status, page, limit } = req.query;

    const query: any = { borrower: req.user.id };
    if (typeof status === 'string' && status.trim() && status !== 'all') {
      query.status = status.trim();
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      BorrowRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('item', 'title category condition pickupNote status')
        .populate('owner', 'name')
        .lean(),
      BorrowRequest.countDocuments(query),
    ]);

    const formattedRequests = requests.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      data: {
        requests: formattedRequests,
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

export const getReceivedRequests = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { status, page, limit } = req.query;

    const query: any = { owner: req.user.id };
    if (typeof status === 'string' && status.trim() && status !== 'all') {
      query.status = status.trim();
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      BorrowRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('item', 'title category condition pickupNote status')
        .populate('borrower', 'name')
        .lean(),
      BorrowRequest.countDocuments(query),
    ]);

    const formattedRequests = requests.map((r) => ({
      ...r,
      id: r._id.toString(),
      _id: undefined,
    }));

    res.status(200).json({
      success: true,
      data: {
        requests: formattedRequests,
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

export const getRequestById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
    }

    const request = await BorrowRequest.findById(id)
      .populate('item', 'title description category condition pickupNote status')
      .populate('owner', 'name')
      .populate('borrower', 'name');

    if (!request) {
      throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
    }

    const ownerId =
      (request.owner as any)?._id?.toString() ||
      (request.owner as any)?.id ||
      request.owner?.toString();
    const borrowerId =
      (request.borrower as any)?._id?.toString() ||
      (request.borrower as any)?.id ||
      request.borrower?.toString();

    const isOwner = Boolean(ownerId && ownerId === req.user.id);
    const isBorrower = Boolean(borrowerId && borrowerId === req.user.id);

    if (!isOwner && !isBorrower) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this request');
    }

    res.status(200).json({
      success: true,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const decideRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    const action = req.body.action || req.body.decision;

    if (action !== 'approve' && action !== 'reject') {
      throw new AppError(400, 'INVALID_ACTION', 'Action must be approve or reject');
    }

    const request = await handleOwnerDecision(id, req.user.id, action);

    res.status(200).json({
      success: true,
      message: `Request ${action}d successfully`,
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    const request = await cancelBorrowRequest(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const pickupRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    const { conditionNote } = req.body;

    const request = await confirmPickup(id, req.user.id, conditionNote);

    res.status(200).json({
      success: true,
      message:
        request.status === 'borrowed'
          ? 'Pickup confirmed by both parties. Status is now borrowed!'
          : 'Pickup confirmed. Waiting for the other party to confirm.',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

export const returnRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { id } = req.params;
    const { conditionNote } = req.body;

    const request = await confirmReturn(id, req.user.id, conditionNote);

    res.status(200).json({
      success: true,
      message:
        request.status === 'completed'
          ? 'Return confirmed by both parties. Transaction completed!'
          : 'Return confirmed. Waiting for the other party to confirm.',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};
