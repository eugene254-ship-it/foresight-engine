import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { mockRiskCards } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { TrendChip } from '@/components/shared/TrendChip';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { cn } from '@/lib/utils';
import type { LiveRiskEvent } from '@/hooks/useRealtimeRisks';
import type { RiskSeverity, TrendDirection, ConfidenceLevel } from '@/data/mockRiskData';

const sparklineColor: Record<string, string> = {
  critical: 'hsl(0, 85%, 55%)',
  high: 'hsl(25, 95%, 55%)',
  medium: 'hsl(45, 95%, 55%)',
  low: 'hsl(190, 80%, 50%)',
  stable: 'hsl(160, 60%, 45%)',
};

// Map live events to card overrides
function computeLiveOverrides(liveEvents: LiveRiskEvent[]) {
  const overrides: Record<string, { metric: number; severity: RiskSeverity; trend: TrendDirection; confidence: ConfidenceLevel }> = {};

  // Find latest event per event_key
  const latest = new Map<string, LiveRiskEvent>();
  for (const e of liveEvents) {
    const existing = latest.get(e.event_key);
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      latest.set(e.event_key, e);
    }
  }

  // Map event_keys to card ids
  const flood = latest.get('r1');
  if (flood) {
    overrides['flood'] = {
      metric: Math.round(Number(flood.probability)),
      severity: (Number(flood.probability) >= 70 ? 'critical' : Number(flood.probability) >= 50 ? 'high' : 'medium') as RiskSeverity,
      trend: flood.velocity as TrendDirection,
      confidence: flood.confidence as ConfidenceLevel,
    };
  }

  const grid = latest.get('r2');
  if (grid) {
    overrides['grid'] = {
      metric: Math.round(Number(grid.probability)),
      severity: (Number(grid.probability) >= 70 ? 'critical' : Number(grid.probability) >= 50 ? 'high' : 'medium') as RiskSeverity,
      trend: grid.velocity as TrendDirection,
      confidence: grid.confidence as ConfidenceLevel,
    };
  }

  const vaccine = latest.get('r3');
  if (vaccine) {
    overrides['vaccine'] = {
      metric: Math.round(Number(vaccine.probability)),
      severity: (Number(vaccine.probability) >= 60 ? 'high' : Number(vaccine.probability) >= 40 ? 'medium' : 'low') as RiskSeverity,
      trend: vaccine.velocity as TrendDirection,
      confidence: vaccine.confidence as ConfidenceLevel,
    };
  }

  // Compute fragility index from all live events
  if (liveEvents.length > 0) {
    const avgSeverity = liveEvents.reduce((s, e) => s + Number(e.severity), 0) / liveEvents.length;
    const fragility = Math.min(1, avgSeverity / 100);
    const risingCount = liveEvents.filter(e => e.velocity === 'rising').length;
    overrides['fragility'] = {
      metric: Number(fragility.toFixed(2)),
      severity: fragility >= 0.8 ? 'critical' : fragility >= 0.6 ? 'high' : 'medium',
      trend: risingCount > liveEvents.length / 2 ? 'rising' : 'stable',
      confidence: 'high',
    };
  }

  // Exposure from all live events
  if (liveEvents.length > 0) {
    const totalExposure = new Set(liveEvents.map(e => e.event_key));
    const exposureSum = Array.from(totalExposure).reduce((sum, key) => {
      const ev = latest.get(key);
      return sum + (ev ? Number(ev.exposure) : 0);
    }, 0);
    overrides['exposure'] = {
      metric: Number((exposureSum / 1000000).toFixed(1)),
      severity: exposureSum > 2000000 ? 'high' : 'medium',
      trend: 'rising',
      confidence: 'high',
    };
  }

  return overrides;
}

interface Props {
  liveEvents?: LiveRiskEvent[];
}

export const RiskOverviewCards = ({ liveEvents = [] }: Props) => {
  const overrides = useMemo(() => computeLiveOverrides(liveEvents), [liveEvents]);

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Current Failure Outlook</h2>
        {liveEvents.length > 0 && (
          <span className="text-[9px] font-mono text-risk-stable animate-pulse">● LIVE</span>
        )}
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {mockRiskCards.map((card, i) => {
          const override = overrides[card.id];
          const metric = override?.metric ?? card.metric;
          const severity = override?.severity ?? card.severity;
          const trend = override?.trend ?? card.trend;
          const confidence = override?.confidence ?? card.confidence;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={cn(
                'relative bg-card border border-border rounded-lg p-3 overflow-hidden group hover:border-primary/30 transition-colors',
                severity === 'critical' && 'border-risk-critical/30 glow-danger'
              )}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground leading-tight">{card.title}</span>
                <ConfidenceMeter level={confidence} />
              </div>

              <div className="flex items-baseline gap-1.5 mb-1">
                <motion.span
                  key={metric}
                  initial={{ scale: 1.2, color: 'hsl(190, 80%, 50%)' }}
                  animate={{ scale: 1, color: undefined }}
                  transition={{ duration: 0.4 }}
                  className={cn('text-2xl font-mono font-bold tabular-nums',
                    severity === 'critical' ? 'text-risk-critical' :
                    severity === 'high' ? 'text-risk-high' :
                    severity === 'medium' ? 'text-risk-medium' : 'text-foreground'
                  )}
                >
                  {metric}
                </motion.span>
                <span className="text-[10px] font-mono text-muted-foreground">{card.unit}</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <SeverityBadge severity={severity} />
                <TrendChip direction={trend} delta={card.trendDelta} />
              </div>

              {/* Sparkline */}
              <div className="h-8 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.sparkline}>
                    <defs>
                      <linearGradient id={`grad-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={sparklineColor[severity]} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={sparklineColor[severity]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={sparklineColor[severity]} strokeWidth={1.5} fill={`url(#grad-${card.id})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[9px] font-mono text-muted-foreground mt-1">
                vs prev: {card.previousPeriod}{card.unit.includes('%') ? '%' : card.unit.includes('/') ? '' : ` ${card.unit}`}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
