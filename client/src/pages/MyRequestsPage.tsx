import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { BorrowRequest } from '../types/BorrowRequest';
import { RequestCard } from '../components/requests/RequestCard';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { ArrowUpRight, Search } from 'lucide-react';

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getMyRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to load your borrow requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancel = async (id: string) => {
    await requestService.cancelRequest(id);
    setActionSuccess('Borrow request cancelled.');
    await fetchRequests();
  };

  const handlePickup = async (id: string, note?: string) => {
    const updated = await requestService.confirmPickup(id, note);
    setActionSuccess(
      updated.status === 'borrowed'
        ? 'Pickup confirmed by both parties! The item is now marked as borrowed.'
        : 'Pickup confirmed. Awaiting confirmation from the owner.'
    );
    await fetchRequests();
  };

  const handleReturn = async (id: string, note?: string) => {
    const updated = await requestService.confirmReturn(id, note);
    setActionSuccess(
      updated.status === 'completed'
        ? 'Return confirmed by both parties! Transaction completed.'
        : 'Return confirmed. Awaiting confirmation from the owner.'
    );
    await fetchRequests();
  };

  const filterTabs = [
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'borrowed', label: 'Active Borrowings' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          My requests
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Track outgoing requests you submitted to borrow items from other members.
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
          icon={<ArrowUpRight className="w-7 h-7 text-textMuted" />}
          title="No requests found"
          description={
            statusFilter === 'all'
              ? "You haven't requested to borrow any items yet. Browse listings to find useful tools, electronics, or books."
              : `No requests with status "${statusFilter}".`
          }
          action={
            <Button
              variant="primary"
              icon={<Search className="w-4 h-4" />}
              onClick={() => navigate('/browse')}
            >
              Browse items
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              role="borrower"
              onCancel={handleCancel}
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
