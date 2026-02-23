'use client';

interface CompetencyProgressBarProps {
  currentLevel: { name: string; sortOrder: number } | null;
  requiredLevel: { name: string; sortOrder: number };
  maxLevel?: number;
}

export function CompetencyProgressBar({ currentLevel, requiredLevel, maxLevel = 5 }: CompetencyProgressBarProps) {
  const currentOrder = currentLevel?.sortOrder ?? 0;
  const requiredOrder = requiredLevel.sortOrder;
  const currentPct = Math.min(100, (currentOrder / maxLevel) * 100);
  const requiredPct = Math.min(100, (requiredOrder / maxLevel) * 100);
  const isMet = currentOrder >= requiredOrder;

  return (
    <div className="space-y-1">
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${isMet ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${currentPct}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-orange-500"
          style={{ left: `${requiredPct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{currentLevel?.name ?? '—'}</span>
        <span>{requiredLevel.name}</span>
      </div>
    </div>
  );
}
