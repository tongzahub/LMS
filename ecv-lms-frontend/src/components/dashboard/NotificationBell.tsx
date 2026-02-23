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
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={t('dashboard.recentNotifications')}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900">{t('dashboard.recentNotifications')}</h4>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height="48px" />
                ))}
              </div>
            ) : !notifications?.length ? (
              <p className="p-4 text-sm text-gray-400 text-center">{t('common.noResults')}</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 p-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-blue-50/50' : ''}`}
                >
                  <span className="text-base mt-0.5">{typeIcons[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(new Date(n.createdAt))}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
