import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  PlusCircle,
  Search,
  Clock,
  ArrowRight,
  PackageOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { DashboardSummary, RecentActivityItem } from '../types/BorrowRequest';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { Toast } from '../components/common/Toast';
import { formatDate } from '../utils/date';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Member';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    requestService
      .getDashboardSummary()
      .then((data) => {
        if (mounted) {
          setSummary(data.summary);
          setRecentActivity(data.recentActivity);
        }
      })
      .catch((err: any) => {
        if (mounted) setError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 py-2">
      {/* Header Greeting & Prompt */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Here is an overview of your active listings, borrowing requests, and community loans.
        </p>
      </div>

      {error && <Toast type="error" message={error} onDismiss={() => setError(null)} />}

      {/* 4 Compact Summary Cards Driven by API Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Active listings */}
        <Link
          to="/my-items"
          className="bg-surface rounded-2xl sm:rounded-card border border-appBorder border-t-4 border-t-brand p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-semibold text-textMuted uppercase tracking-wider line-clamp-1">
              Active Listings
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-brand group-hover:scale-105 transition-transform shrink-0">
              <Boxes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            {loading ? <Skeleton className="h-7 w-10 sm:h-8 sm:w-12" /> : summary?.activeListings ?? 0}
          </div>
          <p className="text-[11px] sm:text-xs text-textMuted mt-1 sm:mt-1.5 flex items-center gap-1 group-hover:text-brand transition-colors font-medium truncate">
            Manage listings <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </p>
        </Link>

        {/* Card 2: Incoming pending requests */}
        <Link
          to="/incoming-requests"
          className="bg-surface rounded-2xl sm:rounded-card border border-appBorder border-t-4 border-t-amber-500 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-semibold text-textMuted uppercase tracking-wider line-clamp-1">
              Incoming Pending
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-appWarning group-hover:scale-105 transition-transform shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            {loading ? <Skeleton className="h-7 w-10 sm:h-8 sm:w-12" /> : summary?.incomingPendingRequests ?? 0}
          </div>
          <p className="text-[11px] sm:text-xs text-textMuted mt-1 sm:mt-1.5 flex items-center gap-1 group-hover:text-appWarning transition-colors font-medium truncate">
            Review incoming <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </p>
        </Link>

        {/* Card 3: Requests I sent */}
        <Link
          to="/my-requests"
          className="bg-surface rounded-2xl sm:rounded-card border border-appBorder border-t-4 border-t-sky-500 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-semibold text-textMuted uppercase tracking-wider line-clamp-1">
              Requests I Sent
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:scale-105 transition-transform shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            {loading ? <Skeleton className="h-7 w-10 sm:h-8 sm:w-12" /> : summary?.requestsSent ?? 0}
          </div>
          <p className="text-[11px] sm:text-xs text-textMuted mt-1 sm:mt-1.5 flex items-center gap-1 group-hover:text-sky-700 transition-colors font-medium truncate">
            View outgoing <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </p>
        </Link>

        {/* Card 4: Active borrowings */}
        <Link
          to="/history"
          className="bg-surface rounded-2xl sm:rounded-card border border-appBorder border-t-4 border-t-emerald-500 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-semibold text-textMuted uppercase tracking-wider line-clamp-1">
              Active Loans
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-appSuccess group-hover:scale-105 transition-transform shrink-0">
              <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            {loading ? <Skeleton className="h-7 w-10 sm:h-8 sm:w-12" /> : summary?.activeBorrowings ?? 0}
          </div>
          <p className="text-[11px] sm:text-xs text-textMuted mt-1 sm:mt-1.5 flex items-center gap-1 group-hover:text-appSuccess transition-colors font-medium truncate">
            Track handovers <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </p>
        </Link>
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-surface rounded-2xl sm:rounded-card border border-appBorder p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-sm font-bold text-textPrimary">Quick actions</h2>
          <p className="text-xs text-textMuted mt-0.5">Frequent tasks for resource sharing.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button
            size="sm"
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/items/new')}
            className="w-full sm:w-auto justify-center"
          >
            List an item
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Search className="w-4 h-4" />}
            onClick={() => navigate('/browse')}
            className="w-full sm:w-auto justify-center"
          >
            Browse items
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<ArrowDownLeft className="w-4 h-4" />}
            onClick={() => navigate('/incoming-requests')}
            className="w-full sm:w-auto justify-center"
          >
            Review incoming requests
          </Button>
        </div>
      </div>

      {/* Recent Activity Panel */}
      <div className="bg-surface rounded-card border border-appBorder p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-appBorder pb-3">
          <div>
            <h2 className="text-base font-bold text-textPrimary">Recent Activity</h2>
            <p className="text-xs text-textMuted">Latest 5 requests and status updates across your account.</p>
          </div>
          <Link to="/history" className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1">
            Full history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="divide-y divide-appBorder">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-3 rounded-xl transition-all border border-transparent hover:border-appBorder"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-textPrimary text-sm">
                      {act.itemTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        act.role === 'owner'
                          ? 'bg-teal-50 text-brand border-teal-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {act.role === 'owner' ? 'Lending' : 'Borrowing'}
                    </span>
                    <span className="text-xs text-textMuted">
                      {act.role === 'owner' ? `from ${act.counterpartName}` : `with ${act.counterpartName}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-textMuted mt-1">
                    <span>Dates: {formatDate(act.startDate)} — {formatDate(act.endDate)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {formatDate(act.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <StatusBadge status={act.status} size="sm" />
                  <Link
                    to={act.role === 'owner' ? '/incoming-requests' : '/my-requests'}
                    className="text-xs font-semibold text-brand hover:text-brand-hover hover:underline ml-1"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <PackageOpen className="w-8 h-8 text-textMuted mx-auto" />
            <h4 className="text-sm font-bold text-textPrimary">No activity yet</h4>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              Get started by exploring community items to borrow or listing an item from home.
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <Button size="sm" variant="outline" onClick={() => navigate('/browse')}>
                Browse items
              </Button>
              <Button size="sm" variant="primary" onClick={() => navigate('/items/new')}>
                List an item
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
