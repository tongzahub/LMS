'use client';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, className = '', showLabel = true, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 ${height} bg-gray-200 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clamped}% complete`}
      >
        <div
          className={`${height} bg-blue-600 rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 tabular-nums w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
