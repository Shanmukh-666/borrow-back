import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Package2,
  PlusCircle,
  Menu,
  X,
  LayoutDashboard,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-appBorder/80 h-[72px] transition-all">
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-textPrimary font-bold text-xl tracking-tight focus:outline-none focus:ring-2 focus:ring-brand rounded-xl px-1 py-1"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand shadow-xs">
            <Package2 className="w-5 h-5 text-brand" />
          </div>
          <span className="font-extrabold">
            Borrow<span className="text-brand">Back</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/browse"
            className={`text-sm px-3.5 py-1.5 rounded-lg font-medium transition-all ${
              isActive('/browse')
                ? 'bg-teal-50 text-brand font-semibold shadow-xs'
                : 'text-textBody hover:text-brand hover:bg-slate-50'
            }`}
          >
            Browse
          </Link>
          <a
            href="/#how-it-works"
            className="text-sm px-3.5 py-1.5 rounded-lg font-medium text-textBody transition-all hover:text-brand hover:bg-slate-50"
          >
            How it works
          </a>
          <a
            href="/#categories"
            className="text-sm px-3.5 py-1.5 rounded-lg font-medium text-textBody transition-all hover:text-brand hover:bg-slate-50"
          >
            Categories
          </a>
        </nav>

        {/* Desktop Action Area */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/items/new')}
          >
            List an item
          </Button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-appBorder hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-brand-tint text-brand flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-textPrimary max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-appBorder rounded-2xl shadow-lg py-2 z-20">
                    <div className="px-4 py-2 border-b border-appBorder">
                      <p className="text-xs font-semibold text-textPrimary truncate">{user.name}</p>
                      <p className="text-xs text-textMuted truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textBody hover:bg-slate-50 hover:text-brand transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-textMuted" />
                      Dashboard
                    </Link>

                    <Link
                      to="/my-items"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textBody hover:bg-slate-50 hover:text-brand transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Boxes className="w-4 h-4 text-textMuted" />
                      My items
                    </Link>

                    <Link
                      to="/my-requests"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textBody hover:bg-slate-50 hover:text-brand transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <ArrowUpRight className="w-4 h-4 text-textMuted" />
                      My requests (Outgoing)
                    </Link>

                    <Link
                      to="/incoming-requests"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textBody hover:bg-slate-50 hover:text-brand transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <ArrowDownLeft className="w-4 h-4 text-textMuted" />
                      Incoming requests
                    </Link>

                    <Link
                      to="/history"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-textBody hover:bg-slate-50 hover:text-brand transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <History className="w-4 h-4 text-textMuted" />
                      Borrowing history
                    </Link>

                    <div className="pt-1 mt-1 border-t border-appBorder">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-appDanger hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-appDanger" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/items/new')}
            className="text-xs px-2.5 py-1.5"
          >
            List item
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-textBody hover:text-textPrimary rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-appBorder px-6 py-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            <Link
              to="/browse"
              className="text-sm font-medium py-2 text-textPrimary hover:text-brand"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse items
            </Link>
            <a
              href="/#how-it-works"
              className="text-sm font-medium py-2 text-textPrimary hover:text-brand"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it works
            </a>

            {user ? (
              <div className="pt-3 border-t border-appBorder flex flex-col gap-2">
                <div className="flex items-center gap-2 py-1 text-xs text-textMuted">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Signed in as <strong>{user.name}</strong></span>
                </div>
                <Link
                  to="/dashboard"
                  className="text-sm py-1.5 text-textBody hover:text-brand flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-textMuted" /> Dashboard
                </Link>
                <Link
                  to="/my-items"
                  className="text-sm py-1.5 text-textBody hover:text-brand flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Boxes className="w-4 h-4 text-textMuted" /> My items
                </Link>
                <Link
                  to="/my-requests"
                  className="text-sm py-1.5 text-textBody hover:text-brand flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ArrowUpRight className="w-4 h-4 text-textMuted" /> My requests
                </Link>
                <Link
                  to="/incoming-requests"
                  className="text-sm py-1.5 text-textBody hover:text-brand flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ArrowDownLeft className="w-4 h-4 text-textMuted" /> Incoming requests
                </Link>
                <Link
                  to="/history"
                  className="text-sm py-1.5 text-textBody hover:text-brand flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <History className="w-4 h-4 text-textMuted" /> Borrowing history
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm py-1.5 text-appDanger text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-appDanger" /> Sign out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-appBorder flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Create account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
