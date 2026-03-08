import { type ConfidenceLevel } from '@/data/mockRiskData';
import { cn } from '@/lib/utils';

const config: Record<ConfidenceLevel, { label: string; color: string; bars: number }> = {
  high: { label: 'High', color: 'bg-risk-stable', bars: 3 },
  medium: { label: 'Med', color: 'bg-risk-medium', bars: 2 },
  low: { label: 'Low', color: 'bg-risk-critical', bars: 1 },
};

export const ConfidenceMeter = ({ level }: { level: ConfidenceLevel }) => {
  const c = config[level];
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-end gap-0.5 h-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={cn('w-1 rounded-sm transition-all', i <= c.bars ? c.color : 'bg-muted', i === 1 ? 'h-1.5' : i === 2 ? 'h-2.5' : 'h-3')} />
        ))}
      </div>
      <span className="text-[10px] font-mono text-muted-foreground uppercase">{c.label}</span>
    </div>
  );
};
