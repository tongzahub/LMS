export type MediaType = 'video' | 'document' | 'image';
export type UploadStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: MediaType;
  s3Key: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  courseId?: number;
  sectionId?: number;
  uploadedBy: string;
  uploadedAt: string;
  status: UploadStatus;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface VideoUploadParams {
  file: File;
  title: string;
  description?: string;
  courseId?: number;
  sectionId?: number;
}
