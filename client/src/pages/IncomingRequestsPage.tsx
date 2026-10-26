import React, { useEffect, useState, useCallback } from 'react';
import { requestService } from '../services/requestService';
import { BorrowRequest } from '../types/BorrowRequest';
import { RequestCard } from '../components/requests/RequestCard';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Toast } from '../components/common/Toast';
import { ArrowDownLeft, Inbox } from 'lucide-react';

export const IncomingRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getReceivedRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      // Sort to highlight pending requests first
      const sorted = [...data.requests].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setRequests(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load received requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    await requestService.decideRequest(id, 'approve');
    setActionSuccess('Request approved! Pickup confirmation is now open.');
    await fetchRequests();
  };

  const handleReject = async (id: string) => {
    await requestService.decideRequest(id, 'reject');
    setActionSuccess('Request declined.');
    await fetchRequests();
  };

  const handlePickup = async (id: string, note?: string) => {
    const updated = await requestService.confirmPickup(id, note);
    setActionSuccess(
      updated.status === 'borrowed'
        ? 'Pickup confirmed by both parties! Status is now active borrowed.'
        : 'Pickup confirmed. Awaiting confirmation from the borrower.'
    );
    await fetchRequests();
  };

  const handleReturn = async (id: string, note?: string) => {
    const updated = await requestService.confirmReturn(id, note);
    setActionSuccess(
      updated.status === 'completed'
        ? 'Return confirmed by both parties! The item is back in your inventory.'
        : 'Return confirmed. Awaiting confirmation from the borrower.'
    );
    await fetchRequests();
  };

  const filterTabs = [
    { key: 'all', label: 'All Incoming' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'borrowed', label: 'Currently Loaned' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Incoming requests
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Manage borrow requests from community members for your listed items.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-appBorder">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.key
                ? 'bg-brand text-white shadow-xs'
                : 'text-textBody hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-card" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-7 h-7 text-textMuted" />}
          title="No incoming requests"
          description={
            statusFilter === 'all'
              ? 'You have not received any requests for your items yet. Make sure your listings are active and descriptive!'
              : `No incoming requests with status "${statusFilter}".`
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              role="owner"
              onApprove={handleApprove}
              onReject={handleReject}
              onPickup={handlePickup}
              onReturn={handleReturn}
              showReviewButton={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};
