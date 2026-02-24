'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Film, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useVideoUpload } from '@/hooks/useMedia';
import { useI18n } from '@/contexts/I18nContext';
import type { MediaItem } from '@/lib/media/types';

const MAX_VIDEO_SIZE_MB = 500;
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime,video/x-msvideo';

interface VideoUploaderProps {
  courseId?: number;
  sectionId?: number;
  onUploadComplete?: (media: MediaItem) => void;
  onCancel?: () => void;
  className?: string;
}

export function VideoUploader({
  courseId,
  sectionId,
  onUploadComplete,
  onCancel,
  className = '',
}: VideoUploaderProps) {
  const { t } = useI18n();
  const { upload, progress, isUploading, reset } = useVideoUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedItem, setUploadedItem] = useState<MediaItem | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const maxBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${MAX_VIDEO_SIZE_MB}MB limit`;
    }
    const validTypes = ACCEPTED_VIDEO_TYPES.split(',');
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi)$/i)) {
      return 'Please select a valid video file (MP4, WebM, MOV, AVI)';
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  }, [validateFile, title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;
    setError(null);
    try {
      const item = await upload({
        file: selectedFile,
        title: title.trim(),
        description: description.trim() || undefined,
        courseId,
        sectionId,
      });
      setUploadedItem(item);
      onUploadComplete?.(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setError(null);
    setUploadedItem(null);
    reset();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Success state
  if (uploadedItem) {
    return (
      <div className={`rounded-xl border-2 border-green-200 bg-green-50 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Upload Complete</h3>
        </div>
        <p className="text-sm text-green-700 mb-4">
          &quot;{uploadedItem.title}&quot; has been uploaded successfully.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Upload Another
          </Button>
          {onCancel && (
            <Button size="sm" onClick={onCancel}>
              {t('common.done')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      {!selectedFile ? (
        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer ${
            isDragging
              ? 'border-brand-400 bg-brand-50 scale-[1.01]'
              : error
                ? 'border-red-300 bg-red-50/50'
                : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Select video file"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-brand-600" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drag & drop video file or <span className="text-brand-600">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            MP4, WebM, MOV, AVI — Max {MAX_VIDEO_SIZE_MB}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      ) : (
        <>
          {/* Selected file preview */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Film className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setError(null); }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Title & description */}
          <Input
            label="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this video"
            disabled={isUploading}
            required
          />
          <div>
            <label htmlFor="video-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="video-desc"
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the video content"
              disabled={isUploading}
            />
          </div>

          {/* Progress bar */}
          {isUploading && progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span className="font-mono tabular-nums">{progress.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {formatSize(progress.loaded)} / {formatSize(progress.total)}
              </p>
            </div>
          )}

          {/* Actions */}
          {!isUploading && (
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleUpload} disabled={!title.trim()}>
                <Upload className="h-4 w-4 mr-1.5" />
                Upload Video
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  {t('common.cancel')}
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
