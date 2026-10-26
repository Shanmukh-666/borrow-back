import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemService, ItemFilterParams } from '../services/itemService';
import { Item } from '../types/Item';
import { ItemFilters } from '../components/items/ItemFilters';
import { ItemGrid } from '../components/items/ItemGrid';
import { Button } from '../components/common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const BrowseItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Extract filters from URL search params
  const currentFilters: ItemFilterParams = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || undefined,
    condition: searchParams.get('condition') || undefined,
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemService.getItems(currentFilters);
      setItems(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (newFilters: Partial<ItemFilterParams>) => {
    const updated = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'all') {
        updated.delete(key);
      } else {
        updated.set(key, String(val));
      }
    });

    setSearchParams(updated);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Find something useful
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Browse items listed by community members available for temporary borrowing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <ItemFilters
        filters={currentFilters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-textMuted px-1">
          <span>
            Showing {items.length} of {totalCount} active {totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* Item Grid with Skeletons, Error, Empty State */}
      <ItemGrid
        items={items}
        loading={loading}
        error={error}
        onRetry={fetchItems}
        onClearFilters={handleClearFilters}
        emptyTitle="No items match your criteria"
        emptyDescription="We couldn't find any listings matching your search or filters. Try clearing some filters or searching for something else."
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 pb-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentFilters.page! <= 1 || loading}
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => handleFilterChange({ page: currentFilters.page! - 1 })}
          >
            Previous
          </Button>
          <span className="text-xs text-textBody font-medium">
            Page {currentFilters.page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentFilters.page! >= totalPages || loading}
            icon={<ChevronRight className="w-4 h-4" />}
            onClick={() => handleFilterChange({ page: currentFilters.page! + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
