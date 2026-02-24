'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { useI18n } from '@/contexts/I18nContext';
import { Skeleton } from '@/components/ui/Skeleton';

const typeIcons: Record<Notification['type'], string> = {
  assignment: '📝',
  grade: '📊',
  message: '💬',
  system: '🔔',
};

export function NotificationBell() {
  const { t, formatDate } = useI18n();
  const { data: notifications, isLoading } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={t('dashboard.recentNotifications')}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1">
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200/80 shadow-lg z-50 animate-scale-in">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">{t('dashboard.recentNotifications')}</h4>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height="48px" />
                ))}
              </div>
            ) : !notifications?.length ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t('common.noResults')}</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50 cursor-pointer ${
                    !n.read ? 'bg-brand-50/30' : ''
                  }`}
                >
                  <span className="text-base mt-0.5 shrink-0">{typeIcons[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-gray-900 truncate ${!n.read ? 'font-semibold' : 'font-medium'}`}>
                      {n.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(new Date(n.createdAt))}</p>
                  </div>
                  {!n.read && (
                    <span className="shrink-0 mt-2 w-2 h-2 rounded-full bg-brand-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
