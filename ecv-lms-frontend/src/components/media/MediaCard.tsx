'use client';

import Image from 'next/image';
import { Film, Clock, HardDrive, MoreVertical, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { MediaItem } from '@/lib/media/types';
import { useState, useRef, useEffect } from 'react';

interface MediaCardProps {
  item: MediaItem;
  onPlay?: (item: MediaItem) => void;
  onDelete?: (item: MediaItem) => void;
  showCourse?: boolean;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const statusMap: Record<string, 'active' | 'warning' | 'draft' | 'error'> = {
  ready: 'active',
  processing: 'warning',
  uploading: 'draft',
  failed: 'error',
};

export function MediaCard({ item, onPlay, onDelete, showCourse }: MediaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <Card padding="none" hoverable className="overflow-hidden group">
      {/* Thumbnail */}
      <button
        type="button"
        className="relative aspect-video w-full bg-gray-900 block"
        onClick={() => item.status === 'ready' && onPlay?.(item)}
        disabled={item.status !== 'ready'}
      >
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Film className="w-10 h-10 text-gray-600" />
          </div>
        )}

        {/* Duration badge */}
        {item.durationSeconds && item.durationSeconds > 0 && (
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-white font-mono tabular-nums">
              {formatDuration(item.durationSeconds)}
            </span>
          </div>
        )}

        {/* Processing overlay */}
        {item.status === 'processing' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Play overlay on hover */}
        {item.status === 'ready' && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
              <Film className="w-5 h-5 text-brand-600 ml-0.5" />
            </div>
          </div>
        )}
      </button>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => { onDelete(item); setMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
          <StatusBadge status={statusMap[item.status] ?? 'draft'} label={item.status} />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(item.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatSize(item.sizeBytes)}
          </span>
        </div>

        {showCourse && item.courseId && (
          <p className="text-[11px] text-gray-400 mt-1">Course #{item.courseId}</p>
        )}
      </div>
    </Card>
  );
}
