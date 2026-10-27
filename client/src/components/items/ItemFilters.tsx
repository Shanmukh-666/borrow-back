import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { ITEM_CATEGORIES, ITEM_CONDITIONS } from '../../types/Item';
import { ItemFilterParams } from '../../services/itemService';

export interface ItemFiltersProps {
  filters: ItemFilterParams;
  onChange: (newFilters: Partial<ItemFilterParams>) => void;
  onClear: () => void;
}

export const ItemFilters: React.FC<ItemFiltersProps> = ({ filters, onChange, onClear }) => {
  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.category && filters.category !== 'all') ||
      (filters.condition && filters.condition !== 'all') ||
      (filters.sort && filters.sort !== 'newest')
  );

  return (
    <div className="bg-surface border border-appBorder rounded-2xl sm:rounded-card p-3.5 sm:p-5 mb-6 sm:mb-8 shadow-xs space-y-3 sm:space-y-4">
      {/* Category Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => onChange({ category: undefined, page: 1 })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
            !filters.category || filters.category === 'all'
              ? 'bg-brand text-white shadow-xs'
              : 'bg-slate-100 text-textBody hover:bg-slate-200'
          }`}
        >
          All Items
        </button>
        {ITEM_CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: isSelected ? undefined : cat, page: 1 })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-100 text-textBody hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3.5 pt-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search books, tools, electronics, gear..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-field border border-appBorder bg-surface text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter dropdowns responsive grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          {/* Category Dropdown */}
          <div className="col-span-1 sm:w-44">
            <select
              value={filters.category || 'all'}
              onChange={(e) => onChange({ category: e.target.value === 'all' ? undefined : e.target.value, page: 1 })}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-field border border-appBorder bg-surface text-xs sm:text-sm text-textBody focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="col-span-1 sm:w-36">
            <select
              value={filters.condition || 'all'}
              onChange={(e) => onChange({ condition: e.target.value === 'all' ? undefined : e.target.value, page: 1 })}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-field border border-appBorder bg-surface text-xs sm:text-sm text-textBody focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
            >
              <option value="all">All Conditions</option>
              {ITEM_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-span-2 sm:col-span-1 sm:w-40">
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
              className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-field border border-appBorder bg-surface text-xs sm:text-sm text-textBody focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer"
            >
              <option value="newest">Recently added</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="col-span-2 sm:col-span-1 flex justify-center sm:justify-start">
              <button
                onClick={onClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-textMuted hover:text-brand hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
