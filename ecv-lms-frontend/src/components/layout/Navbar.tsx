'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Bell, LogOut, Globe, ChevronDown, Menu } from 'lucide-react';
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
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center lg:hidden">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <span className="text-lg font-semibold text-gray-900 hidden sm:block">
          ECV Learning Solutions
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleLocale}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={`Switch to ${locale === 'en' ? 'Thai' : 'English'}`}
          title={`Switch to ${locale === 'en' ? 'ไทย' : 'English'}`}
        >
          <Globe className="h-5 w-5 text-gray-600" />
          <span className="sr-only">{locale === 'en' ? 'ไทย' : 'EN'}</span>
        </button>

        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">{initials}</span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{displayName}</span>
            <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
