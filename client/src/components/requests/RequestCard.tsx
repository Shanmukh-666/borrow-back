import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Star,
  ArrowRight,
} from 'lucide-react';
import { BorrowRequest } from '../../types/BorrowRequest';
import { StatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Toast } from '../common/Toast';
import { formatDate } from '../../utils/date';
import { RequestStatusStepper } from './RequestStatus';
import { ConfirmationPanel } from './ConfirmationPanel';

export interface RequestCardProps {
  request: BorrowRequest;
  role: 'owner' | 'borrower';
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onPickup?: (id: string, note?: string) => Promise<void>;
  onReturn?: (id: string, note?: string) => Promise<void>;
  onReview?: (id: string, rating: number, comment?: string) => Promise<void>;
  showReviewButton?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  role,
  onApprove,
  onReject,
  onCancel,
  onPickup,
  onReturn,
  onReview,
  showReviewButton = true,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dialog states
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Note inputs
  const [conditionNote, setConditionNote] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isOwner = role === 'owner';
  const isBorrower = role === 'borrower';

  const itemTitle =
    typeof request.item === 'object' && request.item !== null
      ? request.item.title
      : 'Listing item';

  const itemId =
    typeof request.item === 'object' && request.item !== null
      ? request.item.id
      : request.item;

  const counterpartName = isOwner
    ? typeof request.borrower === 'object'
      ? request.borrower.name
      : 'Borrower'
    : typeof request.owner === 'object'
    ? request.owner.name
    : 'Owner';

  // Progress text calculation according to page 12 specification
  const getProgressText = () => {
    switch (request.status) {
      case 'pending':
        return isBorrower ? 'Waiting for owner approval' : 'Action needed: review incoming request';
      case 'approved': {
        const myPickup = isOwner
          ? request.pickupConfirmations?.owner
          : request.pickupConfirmations?.borrower;
        const otherPickup = isOwner
          ? request.pickupConfirmations?.borrower
          : request.pickupConfirmations?.owner;
        if (myPickup && !otherPickup) return 'You confirmed pickup; waiting for other participant';
        if (!myPickup && otherPickup) return 'Other participant confirmed pickup; awaiting your confirmation';
        return 'Waiting for both pickup confirmations';
      }
      case 'borrowed':
        return `Borrowed - return due ${formatDate(request.endDate)}`;
      case 'return_pending': {
        const myReturn = isOwner
          ? request.returnConfirmations?.owner
          : request.returnConfirmations?.borrower;
        const otherReturn = isOwner
          ? request.returnConfirmations?.borrower
          : request.returnConfirmations?.owner;
        if (myReturn && !otherReturn) return 'You confirmed return; waiting for other participant';
        if (!myReturn && otherReturn) return 'Other participant confirmed return; awaiting your confirmation';
        return 'Waiting for both return confirmations';
      }
      case 'completed':
        return 'Completed';
      case 'rejected':
        return 'Request declined by owner';
      case 'cancelled':
        return 'Request cancelled by borrower';
      default:
        return '';
    }
  };

  // Handlers
  const handleApprove = async () => {
    if (!onApprove) return;
    setLoadingAction('approve');
    setErrorMessage(null);
    try {
      await onApprove(request.id);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'These dates overlap with another approved borrowing. Choose another date range or reject this request.'
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setLoadingAction('reject');
    try {
      await onReject(request.id);
      setIsRejectOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reject request');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setLoadingAction('cancel');
    try {
      await onCancel(request.id);
      setIsCancelOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to cancel request');
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePickupConfirm = async () => {
    if (!onPickup) return;
    setLoadingAction('pickup');
    try {
      await onPickup(request.id, conditionNote.trim());
      setIsPickupOpen(false);
      setConditionNote('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to confirm pickup');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReturnConfirm = async () => {
    if (!onReturn) return;
    setLoadingAction('return');
    try {
      await onReturn(request.id, conditionNote.trim());
      setIsReturnOpen(false);
      setConditionNote('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to confirm return');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!onReview) return;
    setLoadingAction('review');
    try {
      await onReview(request.id, reviewRating, reviewComment.trim());
      setIsReviewOpen(false);
      setReviewComment('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit review');
    } finally {
      setLoadingAction(null);
    }
  };

  // Check confirmation state for caller
  const myPickupConfirmed = isOwner
    ? request.pickupConfirmations?.owner
    : request.pickupConfirmations?.borrower;

  const myReturnConfirmed = isOwner
    ? request.returnConfirmations?.owner
    : request.returnConfirmations?.borrower;

  return (
    <div className="bg-surface rounded-card border border-appBorder p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
      {errorMessage && (
        <Toast
          type="error"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          className="mb-4"
        />
      )}

      {/* Header: Title, Counterpart, Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-appBorder">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/items/${itemId}`}
              className="font-bold text-textPrimary hover:text-brand transition-colors text-base"
            >
              {itemTitle}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textMuted">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {isOwner ? 'Requester:' : 'Owner:'}{' '}
              <strong className="text-textBody font-medium">{counterpartName}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Updated {formatDate(request.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Stepper */}
      <div className="my-4">
        <RequestStatusStepper status={request.status} />
        <p className="text-xs font-medium text-brand mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          {getProgressText()}
        </p>
      </div>

      {/* Dates & Message Box */}
      <div className="bg-slate-50 rounded-xl p-3.5 mb-4 text-xs space-y-2 border border-slate-100">
        <div className="flex flex-wrap items-center gap-4 text-textBody">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-brand" />
            Dates: {formatDate(request.startDate)} — {formatDate(request.endDate)}
          </span>
          {request.borrowedAt && (
            <span className="text-textMuted">
              Handover: {formatDate(request.borrowedAt)}
            </span>
          )}
          {request.completedAt && (
            <span className="text-textMuted">
              Completed: {formatDate(request.completedAt)}
            </span>
          )}
        </div>

        {request.message && (
          <div className="pt-2 border-t border-slate-200/60 text-textBody">
            <span className="text-textMuted font-medium">Requester Note:</span> {request.message}
          </div>
        )}

        {/* Condition notes display */}
        {(request.pickupConditionNotes?.owner || request.pickupConditionNotes?.borrower) && (
          <div className="pt-2 border-t border-slate-200/60 text-textMuted">
            <span className="font-semibold text-textBody">Pickup Notes: </span>
            {request.pickupConditionNotes.owner && `[Owner: ${request.pickupConditionNotes.owner}] `}
            {request.pickupConditionNotes.borrower && `[Borrower: ${request.pickupConditionNotes.borrower}]`}
          </div>
        )}

        {(request.returnConditionNotes?.owner || request.returnConditionNotes?.borrower) && (
          <div className="pt-2 border-t border-slate-200/60 text-textMuted">
            <span className="font-semibold text-textBody">Return Notes: </span>
            {request.returnConditionNotes.owner && `[Owner: ${request.returnConditionNotes.owner}] `}
            {request.returnConditionNotes.borrower && `[Borrower: ${request.returnConditionNotes.borrower}]`}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
        {/* Owner Decision on Pending */}
        {isOwner && request.status === 'pending' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRejectOpen(true)}
              disabled={!!loadingAction}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleApprove}
              loading={loadingAction === 'approve'}
            >
              Approve Request
            </Button>
          </>
        )}

        {/* Borrower Cancel on Pending */}
        {isBorrower && request.status === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCancelOpen(true)}
            disabled={!!loadingAction}
          >
            Cancel Request
          </Button>
        )}

        {/* Pickup Confirmation for Approved Status */}
        {request.status === 'approved' && !myPickupConfirmed && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsPickupOpen(true)}
            disabled={!!loadingAction}
          >
            Confirm Item Pickup
          </Button>
        )}

        {/* Return Confirmation for Borrowed or Return Pending */}
        {(request.status === 'borrowed' || request.status === 'return_pending') &&
          !myReturnConfirmed && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsReturnOpen(true)}
              disabled={!!loadingAction}
            >
              Confirm Item Return
            </Button>
          )}

        {/* Review Action on Completed */}
        {request.status === 'completed' && showReviewButton && (
          <>
            {request.hasReviewed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-appSuccess bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle className="w-3.5 h-3.5" />
                Review submitted
              </span>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                icon={<Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                onClick={() => setIsReviewOpen(true)}
              >
                Leave a review
              </Button>
            )}
          </>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      <ConfirmationPanel
        isOpen={isRejectOpen}
        title="Decline Borrow Request"
        message="Are you sure you want to decline this request? The requester will be notified that the item is unavailable."
        confirmLabel="Decline Request"
        variant="danger"
        loading={loadingAction === 'reject'}
        onConfirm={handleReject}
        onCancel={() => setIsRejectOpen(false)}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationPanel
        isOpen={isCancelOpen}
        title="Cancel Borrow Request"
        message="Are you sure you want to cancel your request to borrow this item?"
        confirmLabel="Cancel Request"
        variant="warning"
        loading={loadingAction === 'cancel'}
        onConfirm={handleCancel}
        onCancel={() => setIsCancelOpen(false)}
      />

      {/* Pickup Note Modal */}
      <Modal
        isOpen={isPickupOpen}
        onClose={() => setIsPickupOpen(false)}
        title="Confirm Item Pickup"
        description="Verify you have physically handed over or received the item in satisfactory condition."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Condition note (Optional)
            </label>
            <textarea
              rows={3}
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="e.g. Received drill with both batteries fully charged, no visible scratches..."
              maxLength={300}
              className="w-full px-3 py-2 rounded-field border border-appBorder bg-surface text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-appBorder">
            <Button variant="ghost" onClick={() => setIsPickupOpen(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handlePickupConfirm}
              loading={loadingAction === 'pickup'}
            >
              Confirm Handover
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Note Modal */}
      <Modal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        title="Confirm Item Return"
        description="Verify the item has been returned safely back to the owner."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Condition note on return (Optional)
            </label>
            <textarea
              rows={3}
              value={conditionNote}
              onChange={(e) => setConditionNote(e.target.value)}
              placeholder="e.g. Returned cleanly with all bits and charger included..."
              maxLength={300}
              className="w-full px-3 py-2 rounded-field border border-appBorder bg-surface text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-appBorder">
            <Button variant="ghost" onClick={() => setIsReturnOpen(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleReturnConfirm}
              loading={loadingAction === 'return'}
            >
              Confirm Return
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Submission Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`Review ${counterpartName}`}
        description="Rate your lending or borrowing experience with this community member."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-2">
              Rating (1 to 5 stars) <span className="text-appDanger">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none"
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-textPrimary ml-2">
                {reviewRating} of 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Short comment (Optional, max 300 characters)
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share details about punctuality, item condition, or communication..."
              maxLength={300}
              className="w-full px-3 py-2 rounded-field border border-appBorder bg-surface text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-appBorder">
            <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReviewSubmit}
              loading={loadingAction === 'review'}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
