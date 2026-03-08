import { type RiskSeverity } from '@/data/mockRiskData';
import { cn } from '@/lib/utils';

const severityConfig: Record<RiskSeverity, { label: string; className: string }> = {
  critical: { label: 'CRITICAL', className: 'bg-risk-critical/20 text-risk-critical border-risk-critical/40' },
  high: { label: 'HIGH', className: 'bg-risk-high/20 text-risk-high border-risk-high/40' },
  medium: { label: 'WATCH', className: 'bg-risk-medium/20 text-risk-medium border-risk-medium/40' },
  low: { label: 'LOW', className: 'bg-risk-low/20 text-risk-low border-risk-low/40' },
  stable: { label: 'STABLE', className: 'bg-risk-stable/20 text-risk-stable border-risk-stable/40' },
};

export const SeverityBadge = ({ severity }: { severity: RiskSeverity }) => {
  const config = severityConfig[severity];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider border rounded-sm uppercase', config.className)}>
      {severity === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-risk-critical mr-1.5 animate-pulse-risk" />}
      {config.label}
    </span>
  );
};
