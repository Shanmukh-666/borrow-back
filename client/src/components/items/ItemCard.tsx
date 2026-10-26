import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Laptop,
  Wrench,
  Tent,
  Utensils,
  Presentation,
  Box,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Item, ItemCategory } from '../../types/Item';
import { ConditionBadge, StatusBadge } from '../common/Badge';

export const getCategoryIcon = (category: string, className = 'w-6 h-6') => {
  switch (category as ItemCategory) {
    case 'Books & Study':
      return <BookOpen className={`${className} text-indigo-600`} />;
    case 'Electronics':
      return <Laptop className={`${className} text-sky-600`} />;
    case 'Tools & DIY':
      return <Wrench className={`${className} text-amber-600`} />;
    case 'Sports & Outdoors':
      return <Tent className={`${className} text-emerald-600`} />;
    case 'Home & Kitchen':
      return <Utensils className={`${className} text-rose-600`} />;
    case 'Event & Presentation':
      return <Presentation className={`${className} text-purple-600`} />;
    default:
      return <Box className={`${className} text-teal-600`} />;
  }
};

export const getCategoryTheme = (category: string) => {
  switch (category as ItemCategory) {
    case 'Books & Study':
      return {
        bg: 'bg-indigo-50/60',
        border: 'border-indigo-100',
        badge: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        glow: 'from-indigo-100/40 to-indigo-50/20',
      };
    case 'Electronics':
      return {
        bg: 'bg-sky-50/60',
        border: 'border-sky-100',
        badge: 'text-sky-700 bg-sky-50 border-sky-200',
        glow: 'from-sky-100/40 to-sky-50/20',
      };
    case 'Tools & DIY':
      return {
        bg: 'bg-amber-50/60',
        border: 'border-amber-100',
        badge: 'text-amber-800 bg-amber-50 border-amber-200',
        glow: 'from-amber-100/40 to-amber-50/20',
      };
    case 'Sports & Outdoors':
      return {
        bg: 'bg-emerald-50/60',
        border: 'border-emerald-100',
        badge: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        glow: 'from-emerald-100/40 to-emerald-50/20',
      };
    case 'Home & Kitchen':
      return {
        bg: 'bg-rose-50/60',
        border: 'border-rose-100',
        badge: 'text-rose-800 bg-rose-50 border-rose-200',
        glow: 'from-rose-100/40 to-rose-50/20',
      };
    case 'Event & Presentation':
      return {
        bg: 'bg-purple-50/60',
        border: 'border-purple-100',
        badge: 'text-purple-800 bg-purple-50 border-purple-200',
        glow: 'from-purple-100/40 to-purple-50/20',
      };
    default:
      return {
        bg: 'bg-teal-50/60',
        border: 'border-teal-100',
        badge: 'text-teal-800 bg-teal-50 border-teal-200',
        glow: 'from-teal-100/40 to-teal-50/20',
      };
  }
};

export const getCategoryBg = (category: string) => {
  return getCategoryTheme(category).bg;
};

export const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const theme = getCategoryTheme(item.category);
  const hasImage = Boolean(item.imageUrl && item.imageUrl.trim() && !imgFailed);

  return (
    <div className="bg-surface rounded-2xl border border-appBorder overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-lg transition-all duration-300 h-full group">
      <div>
        {/* Visual Showcase: Real Image or Category Graphic Banner */}
        {hasImage ? (
          <div className="h-44 w-full relative overflow-hidden bg-slate-900">
            <img
              src={item.imageUrl!.trim()}
              alt={item.title}
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            />
            {/* Gradient overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

            {/* Badges Overlaid on top of real image */}
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-white/60 text-slate-800">
                {item.category}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              {item.status === 'archived' && (
                <span className="bg-white/95 backdrop-blur-md rounded-full shadow-sm">
                  <StatusBadge status="archived" size="sm" />
                </span>
              )}
              <span className="bg-white/95 backdrop-blur-md rounded-full shadow-sm">
                <ConditionBadge condition={item.condition} size="sm" />
              </span>
            </div>
          </div>
        ) : (
          <div className={`h-32 w-full bg-gradient-to-b ${theme.glow} border-b ${theme.border} flex items-center justify-between px-5 relative overflow-hidden`}>
            {/* Subtle background motif circle */}
            <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-white/40 blur-xs" />
            
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-white/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              {getCategoryIcon(item.category, 'w-6 h-6')}
            </div>

            <div className="flex flex-col items-end gap-1.5 z-10">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.badge}`}>
                {item.category}
              </span>
              <div className="flex items-center gap-1">
                {item.status === 'archived' && <StatusBadge status="archived" size="sm" />}
                <ConditionBadge condition={item.condition} size="sm" />
              </div>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-bold text-textPrimary text-base line-clamp-1 group-hover:text-brand transition-colors mb-2">
            <Link to={`/items/${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>

          {/* Description (2 lines clamp) */}
          <p className="text-sm text-textBody line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Pickup Area Note if present */}
          {item.pickupNote ? (
            <div className="flex items-center gap-1.5 text-xs text-textMuted bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
              <span className="truncate">{item.pickupNote}</span>
            </div>
          ) : (
            <div className="h-[29px]" /> // Maintain consistent card height
          )}
        </div>
      </div>

      {/* Card Footer / Affordance */}
      <div className="px-5 py-3.5 border-t border-appBorder bg-slate-50/50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-xs text-textMuted">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
            {item.owner?.name ? item.owner.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="truncate max-w-[120px] font-medium text-textBody">
            {item.owner?.name || 'Community Member'}
          </span>
        </div>

        <Link
          to={`/items/${item.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover group-hover:translate-x-0.5 transition-transform"
        >
          View details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
