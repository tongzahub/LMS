'use client';

import { useState, useEffect } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  animate?: boolean;
  colorScheme?: 'default' | 'gradient';
}

export function ProgressBar({
  value,
  className = '',
  showLabel = true,
  size = 'md',
  animate = true,
  colorScheme = 'default',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const [displayValue, setDisplayValue] = useState(animate ? 0 : clamped);
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setDisplayValue(clamped), 50);
      return () => clearTimeout(timer);
    }
    setDisplayValue(clamped);
  }, [clamped, animate]);

  const getBarColor = () => {
    if (colorScheme === 'gradient') {
      return 'bg-gradient-to-r from-brand-500 to-brand-600';
    }
    if (clamped >= 100) return 'bg-green-500';
    if (clamped >= 70) return 'bg-brand-600';
    if (clamped >= 40) return 'bg-brand-500';
    return 'bg-brand-400';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex-1 ${height} bg-gray-100 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${clamped}% complete`}
      >
        <div
          className={`${height} ${getBarColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 tabular-nums w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
