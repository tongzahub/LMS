'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

function FileUpload({
  accept,
  multiple = false,
  onFilesSelected,
  label = 'Upload file',
  helperText,
  error,
  maxSizeMB,
  className = '',
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (maxSizeMB) {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid = fileArray.filter((f) => f.size <= maxBytes);
      onFilesSelected(valid);
    } else {
      onFilesSelected(fileArray);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  return (
    <div className={className}>
      {label && <p className="block text-sm font-medium text-gray-700 mb-1">{label}</p>}
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : isDragging
              ? 'border-blue-400 bg-blue-50'
              : error
                ? 'border-red-300 hover:border-red-400'
                : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
      >
        <Upload className="h-8 w-8 text-gray-400 mb-2" aria-hidden="true" />
        <p className="text-sm text-gray-600">
          Drag & drop or <span className="text-blue-600 font-medium">browse</span>
        </p>
        {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}

export { FileUpload };
