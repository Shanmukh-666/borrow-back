import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Eye,
  Edit2,
  Archive,
  RefreshCw,
  MoreVertical,
  PackageOpen,
  Calendar,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { Item } from '../types/Item';
import { Button } from '../components/common/Button';
import { ConditionBadge, StatusBadge } from '../components/common/Badge';
import { Toast } from '../components/common/Toast';
import { Skeleton } from '../components/common/Skeleton';
import { ConfirmationPanel } from '../components/requests/ConfirmationPanel';
import { formatDate } from '../utils/date';
import { getCategoryIcon, getCategoryBg } from '../components/items/ItemCard';

export const MyItemsPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Archive modal
  const [itemToArchive, setItemToArchive] = useState<Item | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Mobile overflow open state per item id
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchMyItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await itemService.getMyItems();
      setItems(res.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, []);

  const handleArchiveConfirm = async () => {
    if (!itemToArchive) return;
    setArchiveLoading(true);
    setError(null);
    try {
      await itemService.archiveItem(itemToArchive.id);
      setSuccessMessage(`"${itemToArchive.title}" has been archived.`);
      setItemToArchive(null);
      await fetchMyItems();
    } catch (err: any) {
      setError(
        err.message ||
          'Cannot archive item with active or pending borrowing requests. Resolve all requests first.'
      );
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleReactivate = async (item: Item) => {
    setError(null);
    try {
      await itemService.reactivateItem(item.id);
      setSuccessMessage(`"${item.title}" is now active and visible to borrowers.`);
      await fetchMyItems();
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate listing');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            My items
          </h1>
          <p className="text-sm text-textMuted mt-1">
            Manage your personal inventory, update listing details, or archive items.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/items/new')}
          className="w-full sm:w-auto justify-center"
        >
          List an item
        </Button>
      </div>

      {error && <Toast type="error" message={error} onDismiss={() => setError(null)} />}
      {successMessage && (
        <Toast
          type="success"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="bg-surface border border-appBorder rounded-card p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-field border border-appBorder bg-surface text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-40 px-3 py-2 rounded-field border border-appBorder bg-surface text-sm text-textBody focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Zero listings state */
        <div className="bg-surface border border-appBorder rounded-card p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand mx-auto">
            <PackageOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary">You have no listings yet</h3>
            <p className="text-sm text-textMuted max-w-md mx-auto mt-1 leading-relaxed">
              Listing a useful item is the first step to sharing with your community. Share books, tools, electronics, or outdoor gear.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/items/new')}
          >
            List your first item
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface border border-appBorder rounded-card p-8 text-center text-textMuted text-sm">
          No listings match your search or filter.
        </div>
      ) : (
        /* Listings List */
        <div className="space-y-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-card border border-appBorder p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Item Info */}
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryBg(
                    item.category
                  )}`}
                >
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      to={`/items/${item.id}`}
                      className="font-bold text-textPrimary text-base hover:text-brand transition-colors truncate"
                    >
                      {item.title}
                    </Link>
                    <StatusBadge status={item.status} size="sm" />
                    <ConditionBadge condition={item.condition} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textMuted">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Created {formatDate(item.createdAt)}
                    </span>
                    {item.pickupNote && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">Pickup: {item.pickupNote}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Link to={`/items/${item.id}`}>
                  <Button size="sm" variant="ghost" icon={<Eye className="w-4 h-4" />}>
                    View
                  </Button>
                </Link>
                <Link to={`/items/${item.id}/edit`}>
                  <Button size="sm" variant="outline" icon={<Edit2 className="w-4 h-4" />}>
                    Edit
                  </Button>
                </Link>
                {item.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Archive className="w-4 h-4 text-textMuted" />}
                    onClick={() => setItemToArchive(item)}
                  >
                    Archive
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<RefreshCw className="w-4 h-4" />}
                    onClick={() => handleReactivate(item)}
                  >
                    Reactivate
                  </Button>
                )}
              </div>

              {/* Mobile Overflow Menu */}
              <div className="sm:hidden relative self-end">
                <button
                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                  className="p-1.5 text-textMuted hover:text-textPrimary rounded-lg hover:bg-slate-100"
                  aria-label="Actions"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {openMenuId === item.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-0 mt-1 w-44 bg-surface border border-appBorder rounded-xl shadow-lg py-1 z-20">
                      <Link
                        to={`/items/${item.id}`}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-textBody hover:bg-slate-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Eye className="w-3.5 h-3.5" /> View listing
                      </Link>
                      <Link
                        to={`/items/${item.id}/edit`}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-textBody hover:bg-slate-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit listing
                      </Link>
                      {item.status === 'active' ? (
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setItemToArchive(item);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-appDanger hover:bg-red-50 text-left"
                        >
                          <Archive className="w-3.5 h-3.5" /> Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            handleReactivate(item);
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-brand hover:bg-teal-50 text-left"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reactivate
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <ConfirmationPanel
        isOpen={!!itemToArchive}
        title="Archive Listing"
        message={`Are you sure you want to archive "${itemToArchive?.title}"? Archived items will be hidden from public search and browse, but transaction history is preserved.`}
        confirmLabel="Archive Item"
        variant="warning"
        loading={archiveLoading}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setItemToArchive(null)}
      />
    </div>
  );
};
