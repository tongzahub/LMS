'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  count?: number;
}

export function StarRating({ rating, maxStars = 5, size = 'sm', showValue = false, count }: StarRatingProps) {
  const full = Math.floor(rating);
  const partial = rating - full;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';

  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of ${maxStars} stars`}>
      {showValue && (
        <span className={`font-bold text-amber-700 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {rating.toFixed(1)}
        </span>
      )}
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, i) => (
          <div key={i} className="relative">
            <Star className={`${iconSize} text-gray-200`} fill="currentColor" strokeWidth={0} />
            {i < full && (
              <Star
                className={`${iconSize} text-amber-400 absolute inset-0`}
                fill="currentColor"
                strokeWidth={0}
              />
            )}
            {i === full && partial > 0 && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${partial * 100}%` }}>
                <Star className={`${iconSize} text-amber-400`} fill="currentColor" strokeWidth={0} />
              </div>
            )}
          </div>
        ))}
      </div>
      {count !== undefined && (
        <span className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
