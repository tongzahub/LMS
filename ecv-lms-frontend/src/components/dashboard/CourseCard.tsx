'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from './ProgressBar';
import { useI18n } from '@/contexts/I18nContext';

interface CourseCardProps {
  id: number;
  fullname: string;
  imageUrl?: string;
  progress: number;
  lastAccessed?: string;
}

export function CourseCard({ id, fullname, imageUrl, progress, lastAccessed }: CourseCardProps) {
  const { t, formatDate } = useI18n();

  return (
    <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-32 bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={fullname}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-blue-50">
            <span className="text-3xl text-blue-300">📚</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{fullname}</h3>
        <ProgressBar value={progress} size="sm" />
        {lastAccessed && (
          <p className="text-xs text-gray-400 mt-2">
            {t('dashboard.lastAccessed')}: {formatDate(new Date(lastAccessed))}
          </p>
        )}
      </div>
    </Card>
  );
}
