import { Types } from 'mongoose';
import { BorrowRequest, IBorrowRequest } from '../models/BorrowRequest';
import { Item } from '../models/Item';
import { checkItemAvailability, validateDateRange } from './availability.service';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Array<{ field: string; message: string }>;

  constructor(statusCode: number, code: string, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export async function createBorrowRequest(params: {
  itemId: string;
  borrowerId: string;
  startDate: string;
  endDate: string;
  message?: string;
}): Promise<IBorrowRequest> {
  const { itemId, borrowerId, startDate, endDate, message } = params;

  if (!Types.ObjectId.isValid(itemId)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid item ID');
  }

  const item = await Item.findById(itemId);
  if (!item || item.status !== 'active') {
    throw new AppError(404, 'ITEM_NOT_FOUND', 'Item is not available for borrowing');
  }

  if (item.owner.toString() === borrowerId) {
    throw new AppError(400, 'SELF_BORROW_NOT_ALLOWED', 'You cannot borrow your own item');
  }

  const dateCheck = validateDateRange(startDate, endDate);
  if (!dateCheck.valid) {
    throw new AppError(400, 'INVALID_DATE_RANGE', dateCheck.message || 'Invalid date range');
  }

  const newRequest = new BorrowRequest({
    item: item._id,
    owner: item.owner,
    borrower: borrowerId,
    startDate,
    endDate,
    message: message?.trim() || '',
    status: 'pending',
    pickupConfirmations: { owner: false, borrower: false },
    returnConfirmations: { owner: false, borrower: false },
    pickupConditionNotes: {},
    returnConditionNotes: {},
  });

  await newRequest.save();
  return newRequest;
}

export async function handleOwnerDecision(
  requestId: string,
  ownerId: string,
  action: 'approve' | 'reject'
): Promise<IBorrowRequest> {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid request ID');
  }

  const request = await BorrowRequest.findById(requestId);
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
  }

  if (request.owner.toString() !== ownerId) {
    throw new AppError(403, 'FORBIDDEN', 'Only the listing owner can decide this request');
  }

  if (request.status !== 'pending') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', `Cannot ${action} a request that is in ${request.status} status`);
  }

  if (action === 'reject') {
    request.status = 'rejected';
    await request.save();
    return request;
  }

  // Approval flow: conflict check
  const availability = await checkItemAvailability(request.item, request.startDate, request.endDate, request._id);
  if (!availability.available) {
    throw new AppError(
      409,
      'DATE_CONFLICT',
      'These dates overlap with another approved borrowing. Choose another date range or reject this request.'
    );
  }

  request.status = 'approved';
  await request.save();
  return request;
}

export async function cancelBorrowRequest(requestId: string, borrowerId: string): Promise<IBorrowRequest> {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid request ID');
  }

  const request = await BorrowRequest.findById(requestId);
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
  }

  if (request.borrower.toString() !== borrowerId) {
    throw new AppError(403, 'FORBIDDEN', 'Only the borrower can cancel this request');
  }

  if (request.status !== 'pending') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', 'Only pending requests can be cancelled');
  }

  request.status = 'cancelled';
  await request.save();
  return request;
}

export async function confirmPickup(
  requestId: string,
  userId: string,
  conditionNote?: string
): Promise<IBorrowRequest> {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid request ID');
  }

  const request = await BorrowRequest.findById(requestId);
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
  }

  const isOwner = request.owner.toString() === userId;
  const isBorrower = request.borrower.toString() === userId;

  if (!isOwner && !isBorrower) {
    throw new AppError(403, 'FORBIDDEN', 'Only participants can confirm pickup');
  }

  if (request.status !== 'approved') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', `Pickup can only be confirmed for approved requests (current: ${request.status})`);
  }

  if (isOwner) {
    request.pickupConfirmations.owner = true;
    if (conditionNote) {
      request.pickupConditionNotes.owner = conditionNote.trim().slice(0, 300);
    }
  }

  if (isBorrower) {
    request.pickupConfirmations.borrower = true;
    if (conditionNote) {
      request.pickupConditionNotes.borrower = conditionNote.trim().slice(0, 300);
    }
  }

  // If both confirmed pickup, status becomes borrowed
  if (request.pickupConfirmations.owner && request.pickupConfirmations.borrower) {
    request.status = 'borrowed';
    request.borrowedAt = new Date();
  }

  await request.save();
  return request;
}

export async function confirmReturn(
  requestId: string,
  userId: string,
  conditionNote?: string
): Promise<IBorrowRequest> {
  if (!Types.ObjectId.isValid(requestId)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid request ID');
  }

  const request = await BorrowRequest.findById(requestId);
  if (!request) {
    throw new AppError(404, 'REQUEST_NOT_FOUND', 'Request not found');
  }

  const isOwner = request.owner.toString() === userId;
  const isBorrower = request.borrower.toString() === userId;

  if (!isOwner && !isBorrower) {
    throw new AppError(403, 'FORBIDDEN', 'Only participants can confirm return');
  }

  if (request.status !== 'borrowed' && request.status !== 'return_pending') {
    throw new AppError(409, 'INVALID_STATE_TRANSITION', `Return can only be confirmed when borrowed or return_pending (current: ${request.status})`);
  }

  if (isOwner) {
    request.returnConfirmations.owner = true;
    if (conditionNote) {
      request.returnConditionNotes.owner = conditionNote.trim().slice(0, 300);
    }
  }

  if (isBorrower) {
    request.returnConfirmations.borrower = true;
    if (conditionNote) {
      request.returnConditionNotes.borrower = conditionNote.trim().slice(0, 300);
    }
  }

  // If both confirmed return, status becomes completed
  if (request.returnConfirmations.owner && request.returnConfirmations.borrower) {
    request.status = 'completed';
    request.completedAt = new Date();
  } else {
    request.status = 'return_pending';
  }

  await request.save();
  return request;
}
