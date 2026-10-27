import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle,
  PackageX,
  ShieldCheck,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { requestService } from '../services/requestService';
import { Item } from '../types/Item';
import { useAuth } from '../context/AuthContext';
import { ConditionBadge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { Skeleton } from '../components/common/Skeleton';
import { DateRangeForm } from '../components/requests/DateRangeForm';
import { getCategoryIcon, getCategoryTheme } from '../components/items/ItemCard';
import { formatDate } from '../utils/date';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Request submission state
  const [requestSubmitted, setRequestSubmitted] = useState<boolean>(false);
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    itemService
      .getItemById(id)
      .then((data) => {
        setItem(data);
      })
      .catch((err: any) => {
        setError(err.message || 'This item listing could not be found or is no longer available.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const isOwner = user && item && (item.owner.id === user.id || (item.owner as any)._id === user.id);
  const theme = item ? getCategoryTheme(item.category) : null;

  const handleBorrowSubmit = async (startDate: string, endDate: string, message?: string) => {
    if (!item) return;
    setSubmittingRequest(true);
    setRequestError(null);
    try {
      await requestService.submitRequest({
        itemId: item.id,
        startDate,
        endDate,
        message,
      });
      setRequestSubmitted(true);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit borrow request');
      throw err;
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto py-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-64 w-full rounded-card" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-72 w-full rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  // Missing or archived item view
  if (error || !item) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-appWarning border border-amber-200 flex items-center justify-center mx-auto mb-2">
          <PackageX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-textPrimary">Listing Unavailable</h2>
        <p className="text-sm text-textMuted leading-relaxed">
          {error || 'This listing may have been archived or removed by its owner.'}
        </p>
        <div className="pt-2">
          <Link to="/browse">
            <Button variant="primary">Return to browse</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto py-2">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-textMuted">
        <Link to="/browse" className="hover:text-brand transition-colors">
          Browse
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          to={`/browse?category=${encodeURIComponent(item.category)}`}
          className="hover:text-brand transition-colors"
        >
          {item.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-textPrimary font-medium truncate max-w-[200px] sm:max-w-md">
          {item.title}
        </span>
      </nav>

      {item.status === 'archived' && (
        <Toast
          type="warning"
          message="Notice: This listing is currently archived. Only you (the owner) can view this page."
        />
      )}

      {/* Main Grid: Left Column Details, Right Column Request Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (8 cols): Large illustration tile, badges, full description, metadata */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Visual Showcase: High-Res Real Product Image or Category Graphic Banner */}
          {item.imageUrl && !imgFailed ? (
            <div className="w-full h-56 sm:h-72 md:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative shadow-md group">
              <img
                src={item.imageUrl.trim()}
                alt={item.title}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-white/60 text-slate-800">
                  {item.category}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-white text-[11px] sm:text-xs">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-white/20">
                  Verified Community Item
                </span>
                <span className="bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1 rounded-full font-semibold">
                  Free Community Borrowing
                </span>
              </div>
            </div>
          ) : (
            <div
              className={`w-full h-48 sm:h-64 rounded-2xl border ${theme?.border} bg-gradient-to-b ${theme?.glow} flex flex-col items-center justify-center p-6 sm:p-8 text-center relative overflow-hidden`}
            >
              {/* Subtle background decorative circle */}
              <div className="absolute -right-6 -bottom-8 w-40 h-40 rounded-full bg-white/40 blur-xs" />

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-sm border border-white/80 flex items-center justify-center mb-3 sm:mb-3.5 z-10">
                {getCategoryIcon(item.category, 'w-8 h-8 sm:w-10 sm:h-10')}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${theme?.badge} z-10`}>
                {item.category}
              </span>
              <p className="text-xs text-textMuted mt-1.5 z-10">Community Resource for Temporary Borrowing</p>
            </div>
          )}

          {/* Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {item.category}
              </span>
              <ConditionBadge condition={item.condition} size="md" />
              {item.status === 'archived' && <StatusBadge status="archived" size="md" />}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-textPrimary tracking-tight">
              {item.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-textMuted mt-2 sm:mt-2.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Listed on {formatDate(item.createdAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                Mutual Handover Confirmed
              </span>
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-surface rounded-2xl sm:rounded-card border border-appBorder p-4 sm:p-6 space-y-2.5 sm:space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">
              About this item
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-textBody whitespace-pre-line leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Meeting Area / Pickup Note */}
          <div className="bg-surface rounded-2xl sm:rounded-card border border-appBorder p-4 sm:p-6 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" />
              Pickup Location Guidance
            </h3>
            <p className="text-xs sm:text-sm text-textBody leading-relaxed">
              {item.pickupNote || 'General safe public meeting spot to be arranged upon request approval.'}
            </p>
          </div>
        </div>

        {/* Right Column (4 cols): Owner Summary & Request To Borrow Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Owner Summary Card */}
          <div className="bg-surface rounded-card border border-appBorder p-5 shadow-xs">
            <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider mb-3.5">
              Lending Member
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-brand-tint text-brand flex items-center justify-center font-bold text-base">
                {item.owner?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-textPrimary">{item.owner?.name}</h4>
                {item.ownerSummary?.rating ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.ownerSummary.rating}</span>
                    <span className="text-textMuted">
                      ({item.ownerSummary.reviewCount} {item.ownerSummary.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-textMuted">Community Member</span>
                )}
              </div>
            </div>
          </div>

          {/* Request to Borrow Card */}
          <div className="bg-surface rounded-card border border-appBorder p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-textPrimary">Request to borrow</h3>
              <p className="text-xs text-textMuted mt-1">
                An active listing accepts requests. Your selected date range will be verified when the owner decides.
              </p>
            </div>

            {/* If user is the owner */}
            {isOwner ? (
              <div className="bg-slate-50 border border-slate-200 rounded-field p-4 text-center space-y-3">
                <p className="text-xs text-textBody">
                  You are the owner of this listing.
                </p>
                <Link to={`/items/${item.id}/edit`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Edit listing
                  </Button>
                </Link>
              </div>
            ) : !user ? (
              /* If visitor is signed out */
              <div className="bg-teal-50 border border-teal-200 rounded-field p-4 space-y-3">
                <p className="text-xs text-teal-900 leading-relaxed">
                  Sign in or create a free BorrowBack account to request this item for your dates.
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() =>
                    navigate('/login', {
                      state: { from: { pathname: `/items/${item.id}` } },
                    })
                  }
                >
                  Sign in to request
                </Button>
              </div>
            ) : requestSubmitted ? (
              /* Success State */
              <div className="bg-green-50 border border-green-200 rounded-field p-5 text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-appSuccess mx-auto" />
                <h4 className="text-sm font-bold text-green-900">Request Submitted!</h4>
                <p className="text-xs text-green-800 leading-relaxed">
                  Your borrow request has been sent to {item.owner?.name}. Status is now <strong>Pending Approval</strong>.
                </p>
                <div className="pt-2">
                  <Link to="/my-requests">
                    <Button variant="primary" size="sm" className="w-full">
                      View in My Requests
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Date Range Form */
              <DateRangeForm
                onSubmit={handleBorrowSubmit}
                loading={submittingRequest}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
