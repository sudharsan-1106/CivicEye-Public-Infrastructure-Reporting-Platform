'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Eye,
  ShieldCheck,
  PlusCircle,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Compute dashboard link based on role
  const getDashboardHref = () => {
    switch (role) {
      case 'administrator':
        return '/admin';
      case 'department_officer':
        return '/officer';
      case 'field_engineer':
        return '/engineer';
      default:
        return '/dashboard';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'administrator':
        return 'Admin';
      case 'department_officer':
        return 'Department Officer';
      case 'field_engineer':
        return 'Field Engineer';
      case 'citizen':
        return 'Citizen';
      default:
        return 'Citizen';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl shadow-[0_4px_20px_-8px_rgba(15,23,42,0.05)] dark:border-slate-800/80 dark:bg-slate-900/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 group-hover:shadow-sky-500/40 transition-all duration-300">
              <Eye className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Civic<span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Eye</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-300/30 text-sky-700 dark:text-sky-300">
                  Gov
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/'
                ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs dark:bg-sky-950/40 dark:text-sky-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
            }`}
          >
            Home
          </Link>
          <Link
            href="/track"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/track'
                ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs dark:bg-sky-950/40 dark:text-sky-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
            }`}
          >
            Track Issue
          </Link>
          {user && (
            <Link
              href={getDashboardHref()}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith(getDashboardHref())
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs dark:bg-sky-950/40 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              Dashboard
            </Link>
          )}
          {user && role === 'administrator' && (
            <Link
              href="/admin/audit-logs"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/admin/audit-logs'
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-2xs dark:bg-sky-950/40 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              Audit Logs
            </Link>
          )}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/complaints/new">
            <Button size="sm" variant="gradient" className="shadow-xs shadow-sky-500/25">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Report Issue
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 border border-slate-300">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold leading-tight line-clamp-1 max-w-[110px]">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{getRoleLabel()}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200/90 py-1.5 z-50 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {profile?.full_name || 'Civic User'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        {getRoleLabel()}
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    <Link
                      href={getDashboardHref()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Role Dashboard
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="outline">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 dark:border-slate-800 dark:bg-slate-900">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-slate-700 dark:text-slate-200"
          >
            Home
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-slate-700 dark:text-slate-200"
          >
            Track Issue
          </Link>
          {user && (
            <Link
              href={getDashboardHref()}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-2 text-slate-700 dark:text-slate-200"
            >
              Dashboard ({getRoleLabel()})
            </Link>
          )}
          <div className="pt-2">
            <Link href="/complaints/new" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="primary" className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Report Infrastructure Issue
              </Button>
            </Link>
          </div>
          {user ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-600 dark:text-slate-300 py-1"
              >
                Profile: {profile?.full_name || user.email}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full text-left text-sm text-rose-600 font-medium py-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="secondary" className="w-full">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
