import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Package,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { Item, ITEM_CATEGORIES } from '../types/Item';
import { Button } from '../components/common/Button';
import { ItemCard, getCategoryIcon, getCategoryTheme } from '../components/items/ItemCard';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    itemService
      .getItems({ limit: 4, sort: 'newest' })
      .then((data) => {
        if (mounted) setRecentItems(data.items);
      })
      .catch((err) => {
        console.error('Failed to load recent items:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleListAnItem = () => {
    if (user) {
      navigate('/items/new');
    } else {
      navigate('/login', { state: { from: { pathname: '/items/new' } } });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8 overflow-hidden">
      {/* Hero Section */}
      <section className="relative isolate grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left Column: Eyebrow, Headline, Supporting text, CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-tint text-brand text-xs font-semibold tracking-wide border border-teal-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Community-Powered Resource Sharing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-textPrimary leading-[1.12]">
            Borrow what you need. <br />
            <span className="bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">Share what you have.</span>
          </h1>

          <p className="text-base sm:text-lg text-textBody max-w-xl leading-relaxed">
            BorrowBack connects neighbors, students, and community members to lend and borrow tools, electronics, academic books, and household essentials. Clear date tracking, mutual confirmations, and real accountability.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate('/browse')}
            >
              Explore items
            </Button>
            <Button
              size="lg"
              variant="outline"
              icon={<PlusCircle className="w-5 h-5" />}
              onClick={handleListAnItem}
            >
              List an item
            </Button>
          </div>

          {/* Quick micro-perks */}
          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-textMuted border-t border-appBorder">
            <span className="flex items-center gap-1.5 font-medium text-textBody">
              <ShieldCheck className="w-4 h-4 text-brand" /> Verified Handover
            </span>
            <span className="flex items-center gap-1.5 font-medium text-textBody">
              <RotateCcw className="w-4 h-4 text-brand" /> Mutual Returns
            </span>
            <span className="flex items-center gap-1.5 font-medium text-textBody">
              <CalendarRange className="w-4 h-4 text-brand" /> Conflict-Free Booking
            </span>
          </div>
        </div>

        {/* Right Column: Stacked composition of 3 sample item cards with real product thumbnails & local landmarks */}
        <div className="lg:col-span-5 relative flex flex-col gap-4">
          {/* Sample Card 1: Tools (Drill) */}
          <div className="bg-surface rounded-2xl border border-appBorder p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5 transform hover:-translate-y-0.5 duration-200">
            <img
              src="/images/items/cordless-drill.jpg"
              alt="Bosch Drill"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-inner"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Tools & DIY</span>
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Like New</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary truncate mt-0.5">Bosch 18V Cordless Drill Set</h4>
              <p className="text-xs text-textMuted truncate mt-0.5">Near Engineering Campus Gate 2</p>
            </div>
          </div>

          {/* Sample Card 2: Electronics (Camera) - slightly offset on desktop */}
          <div className="bg-surface rounded-2xl border border-appBorder p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5 sm:translate-x-4 transform hover:-translate-y-0.5 duration-200">
            <img
              src="/images/items/mirrorless-camera.jpg"
              alt="Sony Camera"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-inner"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">Electronics</span>
                <span className="text-[10px] font-medium bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">Like New</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary truncate mt-0.5">Sony Alpha 4K Mirrorless Camera</h4>
              <p className="text-xs text-textMuted truncate mt-0.5">Central Town Square / Community Center</p>
            </div>
          </div>

          {/* Sample Card 3: Books & Study (B.S. Grewal) */}
          <div className="bg-surface rounded-2xl border border-appBorder p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center gap-3.5 transform hover:-translate-y-0.5 duration-200">
            <img
              src="/images/items/engineering-maths.jpg"
              alt="Engineering Mathematics"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-inner"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">Books & Study</span>
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Good</span>
              </div>
              <h4 className="text-sm font-bold text-textPrimary truncate mt-0.5">Higher Engineering Mathematics</h4>
              <p className="text-xs text-textMuted truncate mt-0.5">College Ground Canteen / Library Area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="bg-surface border border-appBorder rounded-card p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand shrink-0">
              <CalendarRange className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-textPrimary">Borrow for a date range</h4>
              <p className="text-xs text-textMuted mt-1 leading-relaxed">
                Choose start and end dates with automatic calendar overlap validation on the server.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand shrink-0">
              <CheckCircle2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-textPrimary">Clear pickup and return</h4>
              <p className="text-xs text-textMuted mt-1 leading-relaxed">
                Both owner and borrower confirm physical handover and return with condition notes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand shrink-0">
              <Clock className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-textPrimary">History you can track</h4>
              <p className="text-xs text-textMuted mt-1 leading-relaxed">
                Complete record of every transaction, verified community reviews, and reliability ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">How BorrowBack works</h2>
          <p className="text-sm text-textMuted">
            A simple, trustworthy three-step lifecycle designed for community resource sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-card border border-appBorder p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center text-sm font-bold mb-4 shadow-xs">
                1
              </div>
              <h3 className="font-bold text-textPrimary text-base mb-2">List an item</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Publish any tools, gadgets, books, or gear sitting idle. Add condition, description, and suggested safe meeting location.
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-card border border-appBorder p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center text-sm font-bold mb-4 shadow-xs">
                2
              </div>
              <h3 className="font-bold text-textPrimary text-base mb-2">Request dates</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Find what you need, pick your calendar dates, and submit a request. The owner approves and conflicts are automatically prevented.
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-card border border-appBorder p-6 sm:p-7 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center text-sm font-bold mb-4 shadow-xs">
                3
              </div>
              <h3 className="font-bold text-textPrimary text-base mb-2">Confirm pickup & return</h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Meet up safely. Both participants confirm pickup, then confirm return when done, leaving mutual reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section id="categories" className="space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-textPrimary tracking-tight">Explore categories</h2>
            <p className="text-xs text-textMuted mt-0.5">Find items shared across 7 community categories.</p>
          </div>
          <Link to="/browse" className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {ITEM_CATEGORIES.map((cat) => {
            const theme = getCategoryTheme(cat);
            return (
              <button
                key={cat}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(cat)}`)}
                className="bg-surface hover:bg-slate-50/80 border border-appBorder hover:border-brand p-4 rounded-card flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 border ${theme.bg} ${theme.border} shadow-2xs`}>
                  {getCategoryIcon(cat, 'w-6 h-6')}
                </div>
                <span className="text-xs font-semibold text-textPrimary group-hover:text-brand transition-colors line-clamp-1">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-textPrimary tracking-tight">Recently listed</h2>
            <p className="text-xs text-textMuted mt-0.5">Fresh items available for temporary borrowing.</p>
          </div>
          <Link to="/browse" className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1">
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-appBorder rounded-card p-8 text-center">
            <Package className="w-8 h-8 text-textMuted mx-auto mb-2" />
            <h3 className="text-sm font-bold text-textPrimary">No listings yet</h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto mb-4">
              Be the first in your community to list an item or explore categories.
            </p>
            <Button size="sm" variant="primary" onClick={handleListAnItem}>
              List an item now
            </Button>
          </div>
        )}
      </section>

      {/* Closing CTA Panel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-brand to-teal-900 rounded-card p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-teal-700/60">
        {/* Ambient background decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Have useful items at home?
          </h2>
          <p className="text-teal-100 text-sm max-w-lg leading-relaxed">
            Put your idle power tools, camping gear, electronics, or books to work. Connect with neighbors and build a trusted local sharing community.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <Button
            size="lg"
            variant="white"
            icon={<PlusCircle className="w-5 h-5 text-emerald-800" />}
            onClick={handleListAnItem}
          >
            List an item now
          </Button>
          <Button
            size="lg"
            variant="outline-white"
            icon={<ArrowRight className="w-5 h-5 text-white" />}
            onClick={() => navigate('/browse')}
          >
            Explore catalog
          </Button>
        </div>
      </section>
    </div>
  );
};
