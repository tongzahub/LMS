'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { LogOut, Globe, ChevronDown, Menu, User, Settings } from 'lucide-react';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import type { Locale } from '@/lib/utils/i18n';

export function Navbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user, signOut } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'th' : 'en' as Locale);
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const displayName = user ? `${user.givenName} ${user.familyName}` : '';
  const initials = user ? `${user.givenName.charAt(0)}${user.familyName.charAt(0)}`.toUpperCase() : '';

  return (
    <header className="h-16 border-b border-gray-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center lg:hidden shadow-sm">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <span className="text-base font-semibold text-gray-900 hidden sm:block tracking-tight">
          ECV Learning Solutions
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Language toggle */}
        <button
          onClick={toggleLocale}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          aria-label={`Switch to ${locale === 'en' ? 'Thai' : 'English'}`}
          title={`Switch to ${locale === 'en' ? 'ไทย' : 'English'}`}
        >
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600 hidden sm:inline">
            {locale === 'en' ? 'EN' : 'TH'}
          </span>
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold text-white">{initials}</span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{displayName}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 hidden md:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200/80 py-1 z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  {t('nav.profile')}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  {t('nav.settings')}
                </Link>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.signOut')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
