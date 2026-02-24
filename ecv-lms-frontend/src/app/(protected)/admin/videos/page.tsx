'use client';

import { useState } from 'react';
import { useMedia, useDeleteMedia } from '@/hooks/useMedia';
import { useCourses } from '@/hooks/useCourses';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { VideoUploader } from '@/components/media/VideoUploader';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { MediaCard } from '@/components/media/MediaCard';
import { Plus, Film, Search, Filter } from 'lucide-react';
import type { MediaItem } from '@/lib/media/types';

export default function AdminVideosPage() {
  const { t } = useI18n();
  const [filterCourseId, setFilterCourseId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<MediaItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<MediaItem | null>(null);

  const { data: media, isLoading } = useMedia(filterCourseId);
  const { data: courses } = useCourses();
  const deleteMedia = useDeleteMedia();

  const filtered = (media ?? []).filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  const totalSize = (media ?? []).reduce((sum, m) => sum + m.sizeBytes, 0);
  const totalVideos = (media ?? []).length;
  const readyCount = (media ?? []).filter((m) => m.status === 'ready').length;

  const handleDelete = async () => {
    if (!deletingVideo) return;
    await deleteMedia.mutateAsync(deletingVideo.id);
    setDeletingVideo(null);
  };

  const formatTotalSize = (bytes: number): string => {
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Video Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage course videos and media uploads
          </p>
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Upload Video
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Film className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
              <p className="text-xs text-gray-500">Total Videos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Film className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{readyCount}</p>
              <p className="text-xs text-gray-500">Ready</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Film className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatTotalSize(totalSize)}</p>
              <p className="text-xs text-gray-500">Total Storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterCourseId ?? ''}
            onChange={(e) => setFilterCourseId(e.target.value ? Number(e.target.value) : undefined)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Courses</option>
            {(courses ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.fullname}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Film className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No videos found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery
              ? `No videos match "${searchQuery}"`
              : 'Upload your first video to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowUploader(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Upload Video
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onPlay={setPlayingVideo}
              onDelete={setDeletingVideo}
              showCourse
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        title="Upload Video"
        size="lg"
      >
        <VideoUploader
          onUploadComplete={() => {
            setShowUploader(false);
          }}
          onCancel={() => setShowUploader(false)}
        />
      </Modal>

      {/* Player Modal */}
      <Modal
        isOpen={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        title={playingVideo?.title ?? ''}
        size="xl"
      >
        {playingVideo && (
          <VideoPlayer
            src={playingVideo.url}
            title={playingVideo.title}
            thumbnailUrl={playingVideo.thumbnailUrl}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingVideo}
        onClose={() => setDeletingVideo(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${deletingVideo?.title}"? This action cannot be undone.`}
        confirmLabel={t('common.delete')}
        variant="danger"
        isLoading={deleteMedia.isPending}
      />
    </div>
  );
}
