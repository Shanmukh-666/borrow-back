import React from 'react';
import { Link } from 'react-router-dom';
import { Package2, ShieldCheck, HeartHandshake, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-appBorder mt-auto">
      {/* Community Trust Bar */}
      <div className="border-b border-appBorder bg-slate-50/60 py-6">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-textMuted">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-brand shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-textPrimary text-sm">Two-Party Verified</p>
                <p className="text-textMuted">Both participants confirm condition at pickup and return.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-appSuccess shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-textPrimary text-sm">Zero Rental Fees</p>
                <p className="text-textMuted">Pure community sharing designed for neighborly trust.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-textPrimary text-sm">Safe Public Handovers</p>
                <p className="text-textMuted">Guidance to exchange items at safe, public meeting points.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Brand */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-appBorder">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5 text-textPrimary font-bold text-xl tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand shadow-xs">
                <Package2 className="w-5 h-5 text-brand" />
              </div>
              <span>
                Borrow<span className="text-brand">Back</span>
              </span>
            </Link>
            <p className="text-xs text-textMuted max-w-sm leading-relaxed">
              A community-powered resource sharing platform. Borrow tools, textbooks, electronics, and gear from neighbors instead of buying things you only use once.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50/70 border border-teal-200/60 text-brand text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Neighbor-to-neighbor resource network</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-textBody">
              <li>
                <Link to="/browse" className="hover:text-brand transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/items/new" className="hover:text-brand transition-colors">
                  List an Item
                </Link>
              </li>
              <li>
                <a href="/#categories" className="hover:text-brand transition-colors">
                  Explore Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: How It Works */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-xs text-textBody">
              <li>
                <a href="/#how-it-works" className="hover:text-brand transition-colors">
                  How Borrowing Works
                </a>
              </li>
              <li>
                <Link to="/browse" className="hover:text-brand transition-colors">
                  Popular Community Items
                </Link>
              </li>
              <li>
                <span className="text-textMuted">Safe Handover Guide</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-xs text-textBody">
              <li>
                <Link to="/dashboard" className="hover:text-brand transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-items" className="hover:text-brand transition-colors">
                  My Listed Items
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-brand transition-colors">
                  Borrowing History
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand transition-colors">
                  Member Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & status */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-textMuted gap-4">
          <p>© {new Date().getFullYear()} BorrowBack. Community Resource Sharing & Temporary Borrowing.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Platform Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
