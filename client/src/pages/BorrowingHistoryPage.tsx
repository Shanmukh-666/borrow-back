import React, { useEffect, useState, useCallback } from 'react';
import { requestService } from '../services/requestService';
import { reviewService } from '../services/reviewService';
import { BorrowRequest } from '../types/BorrowRequest';
import { RequestCard } from '../components/requests/RequestCard';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Toast } from '../components/common/Toast';
import { History } from 'lucide-react';

export const BorrowingHistoryPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getBorrowingHistory({
        status: statusFilter === 'all' ? undefined : statusFilter,
        role: roleFilter === 'all' ? undefined : roleFilter,
      });
      setHistoryItems(data.history);
    } catch (err: any) {
      setError(err.message || 'Failed to load borrowing history');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleReview = async (requestId: string, rating: number, comment?: string) => {
    await reviewService.submitReview(requestId, rating, comment);
    setActionSuccess('Your review has been published. Thank you for building community trust!');
    await fetchHistory();
  };

  const handlePickup = async (id: string, note?: string) => {
    await requestService.confirmPickup(id, note);
    setActionSuccess('Pickup confirmed.');
    await fetchHistory();
  };

  const handleReturn = async (id: string, note?: string) => {
    await requestService.confirmReturn(id, note);
    setActionSuccess('Return confirmed.');
    await fetchHistory();
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Borrowing history
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Review all current, completed, and past transactions, track handovers, and rate counterpart participants.
        </p>
      </div>

      {error && <Toast type="error" message={error} onDismiss={() => setError(null)} />}
      {actionSuccess && (
        <Toast
          type="success"
          message={actionSuccess}
          onDismiss={() => setActionSuccess(null)}
        />
      )}

      {/* Filter controls */}
      <div className="bg-surface border border-appBorder rounded-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-field border border-appBorder bg-surface text-xs text-textBody focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed only</option>
            <option value="borrowed">Currently borrowed</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-textMuted uppercase tracking-wider">
            Role:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-field border border-appBorder bg-surface text-xs text-textBody focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
          >
            <option value="all">All transactions (Lending & Borrowing)</option>
            <option value="borrower">I was borrower</option>
            <option value="owner">I was lender / owner</option>
          </select>
        </div>
      </div>

      {/* History Items */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-card" />
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <EmptyState
          icon={<History className="w-7 h-7 text-textMuted" />}
          title="No history records found"
          description="Completed and past borrowing records will appear here for record-keeping and review submission."
        />
      ) : (
        <div className="space-y-4">
          {historyItems.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              role={req.isOwner ? 'owner' : 'borrower'}
              onPickup={handlePickup}
              onReturn={handleReturn}
              onReview={handleReview}
              showReviewButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
