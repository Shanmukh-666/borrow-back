import React from 'react';
import { Item } from '../../types/Item';
import { ItemCard } from './ItemCard';
import { CardSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { AlertCircle, SearchX } from 'lucide-react';

export interface ItemGridProps {
  items: Item[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  loading,
  error,
  onRetry,
  onClearFilters,
  emptyTitle = 'No items found',
  emptyDescription = 'Try adjusting your search query or filter selections to find what you need.',
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-7 h-7 text-appDanger" />}
        title="Unable to load listings"
        description={error}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : undefined
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="w-7 h-7 text-textMuted" />}
        title={emptyTitle}
        description={emptyDescription}
        action={
          onClearFilters ? (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear all filters
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
