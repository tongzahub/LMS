import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

function Skeleton({ variant = 'text', width, height, className = '', ...props }: SkeletonProps) {
  const variants: Record<string, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-200/70 ${variants[variant]} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Skeleton };
