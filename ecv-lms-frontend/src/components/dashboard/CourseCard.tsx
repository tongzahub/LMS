'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';
import { Play, BookOpen } from 'lucide-react';

interface CourseCardProps {
  id: number;
  fullname: string;
  imageUrl?: string;
  progress: number;
  lastAccessed?: string;
  instructorName?: string;
  category?: string;
}

// Maps category names to a consistent color palette for badges
function getCategoryStyle(category?: string): { bg: string; text: string } {
  if (!category) return { bg: 'bg-gray-100', text: 'text-gray-600' };
  const styles: Record<string, { bg: string; text: string }> = {
    'Computer Science & IT': { bg: 'bg-brand-100', text: 'text-brand-700' },
    'Business & Management': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Language & Communication': { bg: 'bg-green-100', text: 'text-green-700' },
    'Science & Engineering': { bg: 'bg-amber-100', text: 'text-amber-700' },
    'Arts & Design': { bg: 'bg-pink-100', text: 'text-pink-700' },
    'Health & Medicine': { bg: 'bg-red-100', text: 'text-red-700' },
  };
  // Match by partial key
  const matched = Object.keys(styles).find((k) => category.includes(k.split(' ')[0]));
  return matched ? styles[matched] : { bg: 'bg-gray-100', text: 'text-gray-600' };
}

// Short category label for badge (first meaningful word)
function getShortCategory(category?: string): string {
  if (!category) return '';
  // Strip Thai parenthetical text
  return category.replace(/\s*\(.*?\)\s*/, '').split('&')[0].trim();
}

export function CourseCard({ id, fullname, imageUrl, progress, lastAccessed, instructorName, category }: CourseCardProps) {
  const { t, formatDate } = useI18n();
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  const categoryStyle = getCategoryStyle(category);
  const shortCategory = getShortCategory(category);

  // Progress bar color
  const progressBarClass =
    clamped >= 100
      ? 'bg-green-500'
      : clamped >= 70
      ? 'bg-brand-600'
      : clamped >= 40
      ? 'bg-brand-500'
      : 'bg-brand-400';

  return (
    <Link href={`/courses/${id}`}>
      <Card padding="none" hoverable className="overflow-hidden h-full flex flex-col group">
        {/* Thumbnail with gradient overlay and play button */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={fullname}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-brand-50 to-indigo-100">
              <BookOpen className="w-10 h-10 text-brand-300" />
            </div>
          )}

          {/* Gradient overlay — always present for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Category badge — overlaid bottom-left */}
          {shortCategory && (
            <div className="absolute bottom-2 left-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text} shadow-sm`}>
                {shortCategory}
              </span>
            </div>
          )}

          {/* Progress pill — bottom right */}
          {clamped > 0 && (
            <div className="absolute bottom-2 right-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-800 shadow-sm tabular-nums">
                {clamped}%
              </span>
            </div>
          )}

          {/* Progress bar strip at bottom of thumbnail */}
          {clamped > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
              <div
                className={`h-full ${progressBarClass} transition-all duration-500`}
                style={{ width: `${clamped}%` }}
              />
            </div>
          )}

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/15 transition-colors duration-200">
            <div className="w-11 h-11 rounded-full bg-white/95 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
              <Play className="w-4.5 h-4.5 text-brand-600 ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug group-hover:text-brand-700 transition-colors">
            {fullname}
          </h3>
          {instructorName && (
            <p className="text-xs text-gray-500 mb-2 truncate">{instructorName}</p>
          )}
          <div className="mt-auto space-y-2">
            {/* Styled progress bar with percentage */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400 font-medium">
                  {clamped >= 100 ? 'Completed' : clamped > 0 ? 'In Progress' : 'Not started'}
                </span>
                <span className="text-[11px] font-bold text-gray-600 tabular-nums">{clamped}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressBarClass} rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${clamped}%` }}
                />
              </div>
            </div>
            {lastAccessed && (
              <p className="text-[11px] text-gray-400">
                {t('dashboard.lastAccessed')}: {formatDate(new Date(lastAccessed))}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
