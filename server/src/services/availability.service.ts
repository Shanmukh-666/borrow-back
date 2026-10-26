import { Types } from 'mongoose';
import { BorrowRequest, IBorrowRequest } from '../models/BorrowRequest';

/**
 * Validates that dates are in YYYY-MM-DD format,
 * startDate is today or in the future,
 * and endDate >= startDate.
 */
export function validateDateRange(startDateStr: string, endDateStr: string): { valid: boolean; message?: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
    return { valid: false, message: 'Dates must be in YYYY-MM-DD format' };
  }

  const start = new Date(startDateStr + 'T00:00:00.000Z');
  const end = new Date(endDateStr + 'T00:00:00.000Z');

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid calendar date specified' };
  }

  // Today in UTC
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const today = new Date(todayStr + 'T00:00:00.000Z');

  if (start < today) {
    return { valid: false, message: 'Start date cannot be in the past' };
  }

  if (end < start) {
    return { valid: false, message: 'End date must be on or after start date' };
  }

  return { valid: true };
}

/**
 * Checks if the requested date range overlaps with any active borrowing
 * (approved, borrowed, return_pending) for the specified item.
 * Overlap condition: requestedStart <= existingEnd AND requestedEnd >= existingStart
 */
export async function checkItemAvailability(
  itemId: string | Types.ObjectId,
  startDateStr: string,
  endDateStr: string,
  excludeRequestId?: string | Types.ObjectId
): Promise<{ available: boolean; conflictingRequest?: IBorrowRequest }> {
  const query: any = {
    item: itemId,
    status: { $in: ['approved', 'borrowed', 'return_pending'] },
    // Overlap: existingStart <= newEnd AND existingEnd >= newStart
    startDate: { $lte: endDateStr },
    endDate: { $gte: startDateStr },
  };

  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }

  const conflict = await BorrowRequest.findOne(query);

  if (conflict) {
    return { available: false, conflictingRequest: conflict };
  }

  return { available: true };
}
