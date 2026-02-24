'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isDemoMode } from '@/lib/demo';
import { MOCK_MEDIA } from '@/lib/mock';
import type { MediaItem, UploadProgress, VideoUploadParams } from '@/lib/media/types';

const mediaCdnDomain = process.env.NEXT_PUBLIC_MEDIA_CDN_DOMAIN ?? '';

function buildCdnUrl(s3Key: string): string {
  if (!mediaCdnDomain) return '';
  return `https://${mediaCdnDomain}/${s3Key}`;
}

function generateId(): string {
  return `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatS3Key(file: File, courseId?: number): string {
  const ext = file.name.split('.').pop() ?? 'mp4';
  const timestamp = Date.now();
  const prefix = courseId ? `videos/courses/${courseId}` : 'videos/uncategorized';
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '');
  return `${prefix}/${safeName}-${timestamp}.${ext}`;
}

// ---------------------------------------------------------------------------
// Demo in-memory store
// ---------------------------------------------------------------------------
let demoMedia = [...MOCK_MEDIA];

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Fetch all media items, optionally filtered by courseId */
export function useMedia(courseId?: number) {
  return useQuery<MediaItem[]>({
    queryKey: ['media', courseId],
    queryFn: async () => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 200));
        return courseId ? demoMedia.filter((m) => m.courseId === courseId) : demoMedia;
      }

      // Production: fetch from BFF
      const params = courseId ? `?courseId=${courseId}` : '';
      const res = await fetch(`/api/media${params}`);
      if (!res.ok) throw new Error('Failed to fetch media');
      return res.json();
    },
    staleTime: isDemoMode ? Infinity : 30_000,
  });
}

/** Fetch a single media item by ID */
export function useMediaItem(id: string) {
  return useQuery<MediaItem | null>({
    queryKey: ['media', 'item', id],
    queryFn: async () => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 100));
        return demoMedia.find((m) => m.id === id) ?? null;
      }
      const res = await fetch(`/api/media/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!id,
  });
}

/** Delete a media item */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        demoMedia = demoMedia.filter((m) => m.id !== id);
        return;
      }

      // Production: use Amplify Storage remove + BFF metadata delete
      const { remove } = await import('aws-amplify/storage');
      const item = demoMedia.find((m) => m.id === id);
      if (item) {
        await remove({ path: item.s3Key });
      }
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

/** Upload a video with progress tracking */
export function useVideoUpload() {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const upload = useCallback(async (params: VideoUploadParams): Promise<MediaItem> => {
    const { file, title, description, courseId, sectionId } = params;

    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const s3Key = formatS3Key(file, courseId);

      if (isDemoMode) {
        // Simulate upload progress in demo mode
        for (let pct = 0; pct <= 100; pct += 10) {
          await new Promise((r) => setTimeout(r, 150));
          setProgress({
            loaded: Math.floor((file.size * pct) / 100),
            total: file.size,
            percentage: pct,
          });
        }

        const newItem: MediaItem = {
          id: generateId(),
          title,
          description,
          type: 'video',
          s3Key,
          url: URL.createObjectURL(file),
          thumbnailUrl: undefined,
          mimeType: file.type || 'video/mp4',
          sizeBytes: file.size,
          durationSeconds: 0,
          courseId,
          sectionId,
          uploadedBy: 'admin@ecv.ac.th',
          uploadedAt: new Date().toISOString(),
          status: 'ready',
        };
        demoMedia = [newItem, ...demoMedia];
        queryClient.invalidateQueries({ queryKey: ['media'] });
        return newItem;
      }

      // Production: use Amplify Storage uploadData
      const { uploadData } = await import('aws-amplify/storage');
      const result = await uploadData({
        path: s3Key,
        data: file,
        options: {
          contentType: file.type || 'video/mp4',
          onProgress: (event) => {
            const loaded = event.transferredBytes;
            const total = event.totalBytes ?? file.size;
            setProgress({
              loaded,
              total,
              percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
            });
          },
        },
      }).result;

      const newItem: MediaItem = {
        id: generateId(),
        title,
        description,
        type: 'video',
        s3Key: result.path,
        url: buildCdnUrl(result.path),
        mimeType: file.type || 'video/mp4',
        sizeBytes: file.size,
        courseId,
        sectionId,
        uploadedBy: 'current-user',
        uploadedAt: new Date().toISOString(),
        status: 'ready',
      };

      queryClient.invalidateQueries({ queryKey: ['media'] });
      return newItem;
    } finally {
      setIsUploading(false);
    }
  }, [queryClient]);

  const reset = useCallback(() => {
    setProgress(null);
    setIsUploading(false);
  }, []);

  return { upload, progress, isUploading, reset };
}
