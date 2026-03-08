import { type TrendDirection } from '@/data/mockRiskData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; color: string; label: string }> = {
  rising: { icon: TrendingUp, color: 'text-risk-critical', label: '↑' },
  falling: { icon: TrendingDown, color: 'text-risk-stable', label: '↓' },
  stable: { icon: Minus, color: 'text-muted-foreground', label: '→' },
};

export const TrendChip = ({ direction, delta }: { direction: TrendDirection; delta?: number }) => {
  const c = trendConfig[direction];
  const Icon = c.icon;

  return (
    <div className={cn('inline-flex items-center gap-1 text-xs font-mono', c.color)}>
      <Icon className="w-3 h-3" />
      {delta !== undefined && (
        <span>{direction === 'falling' ? '' : '+'}{typeof delta === 'number' ? delta : ''}</span>
      )}
    </div>
  );
};
