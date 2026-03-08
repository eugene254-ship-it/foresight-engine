import { cn } from '@/lib/utils';

export const ProbabilityPill = ({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) => {
  const color = value >= 70 ? 'text-risk-critical' : value >= 50 ? 'text-risk-high' : value >= 30 ? 'text-risk-medium' : 'text-risk-low';
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={cn('font-mono font-bold tabular-nums', color, sizeClass)}>
      {value}%
    </span>
  );
};
