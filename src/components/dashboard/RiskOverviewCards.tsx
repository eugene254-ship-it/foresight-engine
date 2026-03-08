import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { mockRiskCards } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { TrendChip } from '@/components/shared/TrendChip';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { cn } from '@/lib/utils';

const sparklineColor: Record<string, string> = {
  critical: 'hsl(0, 85%, 55%)',
  high: 'hsl(25, 95%, 55%)',
  medium: 'hsl(45, 95%, 55%)',
  low: 'hsl(190, 80%, 50%)',
  stable: 'hsl(160, 60%, 45%)',
};

export const RiskOverviewCards = () => {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Current Failure Outlook</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {mockRiskCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className={cn(
              'relative bg-card border border-border rounded-lg p-3 overflow-hidden group hover:border-primary/30 transition-colors',
              card.severity === 'critical' && 'border-risk-critical/30 glow-danger'
            )}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-[10px] font-mono text-muted-foreground leading-tight">{card.title}</span>
              <ConfidenceMeter level={card.confidence} />
            </div>

            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={cn('text-2xl font-mono font-bold tabular-nums',
                card.severity === 'critical' ? 'text-risk-critical' :
                card.severity === 'high' ? 'text-risk-high' :
                card.severity === 'medium' ? 'text-risk-medium' : 'text-foreground'
              )}>
                {card.metric}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{card.unit}</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <SeverityBadge severity={card.severity} />
              <TrendChip direction={card.trend} delta={card.trendDelta} />
            </div>

            {/* Sparkline */}
            <div className="h-8 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.sparkline}>
                  <defs>
                    <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sparklineColor[card.severity]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={sparklineColor[card.severity]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={sparklineColor[card.severity]} strokeWidth={1.5} fill={`url(#grad-${card.id})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[9px] font-mono text-muted-foreground mt-1">
              vs prev: {card.previousPeriod}{card.unit.includes('%') ? '%' : card.unit.includes('/') ? '' : ` ${card.unit}`}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
