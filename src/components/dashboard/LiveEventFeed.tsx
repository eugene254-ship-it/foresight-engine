import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LiveRiskEvent } from '@/hooks/useRealtimeRisks';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import type { RiskSeverity } from '@/data/mockRiskData';
import { AlertTriangle, TrendingUp, Activity, ShieldAlert, Zap, Radio } from 'lucide-react';

interface Props {
  events: LiveRiskEvent[];
}

type AnomalyType = 'threshold_breach' | 'fast_escalation' | 'confidence_shift' | 'new_risk' | 'intervention_failure';

interface EnrichedEvent extends LiveRiskEvent {
  anomalies: AnomalyType[];
  escalationRate?: number;
}

const anomalyConfig: Record<AnomalyType, { icon: typeof AlertTriangle; color: string; label: string }> = {
  threshold_breach: { icon: ShieldAlert, color: 'text-risk-critical', label: 'Threshold Breach' },
  fast_escalation: { icon: TrendingUp, color: 'text-risk-high', label: 'Fast Escalation' },
  confidence_shift: { icon: Activity, color: 'text-risk-medium', label: 'Confidence Shift' },
  new_risk: { icon: Zap, color: 'text-primary', label: 'New Risk' },
  intervention_failure: { icon: AlertTriangle, color: 'text-destructive', label: 'Intervention Failed' },
};

// Detect anomalies from event patterns
function detectAnomalies(events: LiveRiskEvent[]): EnrichedEvent[] {
  const seenKeys = new Set<string>();
  const eventHistory = new Map<string, number[]>();
  
  return events.map((event, idx) => {
    const anomalies: AnomalyType[] = [];
    const probability = Number(event.probability);
    const severity = Number(event.severity);
    
    // Track probability history for escalation detection
    const history = eventHistory.get(event.event_key) || [];
    history.push(probability);
    eventHistory.set(event.event_key, history.slice(-5)); // Keep last 5
    
    // 1. Threshold breach detection
    if (probability >= 75 || severity >= 85) {
      anomalies.push('threshold_breach');
    }
    
    // 2. Fast escalation detection (>15% increase in recent readings)
    if (history.length >= 2) {
      const prevAvg = history.slice(0, -1).reduce((a, b) => a + b, 0) / (history.length - 1);
      const escalationRate = probability - prevAvg;
      if (escalationRate > 10) {
        anomalies.push('fast_escalation');
      }
    }
    
    // 3. Confidence shift (velocity change pattern)
    if (event.velocity === 'rising' && probability >= 50) {
      anomalies.push('confidence_shift');
    }
    
    // 4. New risk detection
    if (!seenKeys.has(event.event_key) && idx < 3) {
      anomalies.push('new_risk');
    }
    seenKeys.add(event.event_key);
    
    // 5. Simulated intervention failure (for demo - events with specific patterns)
    if (event.status === 'critical' && event.velocity === 'rising' && probability > 80) {
      anomalies.push('intervention_failure');
    }
    
    return {
      ...event,
      anomalies,
      escalationRate: history.length >= 2 ? probability - history[0] : undefined,
    };
  });
}

export const LiveEventFeed = ({ events }: Props) => {
  const enrichedEvents = useMemo(() => detectAnomalies(events), [events]);
  
  const anomalyCounts = useMemo(() => {
    const counts: Record<AnomalyType, number> = {
      threshold_breach: 0,
      fast_escalation: 0,
      confidence_shift: 0,
      new_risk: 0,
      intervention_failure: 0,
    };
    for (const e of enrichedEvents) {
      for (const a of e.anomalies) counts[a]++;
    }
    return counts;
  }, [enrichedEvents]);

  const hasAnomalies = Object.values(anomalyCounts).some(c => c > 0);

  if (events.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Live Event Feed — Anomaly Stream
          </h3>
        </div>
        <div className="text-center py-6 text-[11px] font-mono text-muted-foreground">
          No live events yet. Click "Simulate Live Event" to stream data.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-risk-stable animate-pulse" />
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Live Event Feed — Anomaly Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{events.length} events</span>
      </div>

      {/* Anomaly Summary Bar */}
      {hasAnomalies && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border overflow-x-auto">
          {Object.entries(anomalyCounts).filter(([_, count]) => count > 0).map(([type, count]) => {
            const config = anomalyConfig[type as AnomalyType];
            const Icon = config.icon;
            return (
              <div key={type} className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono shrink-0',
                type === 'threshold_breach' ? 'border-risk-critical/30 bg-risk-critical/5' :
                type === 'fast_escalation' ? 'border-risk-high/30 bg-risk-high/5' :
                type === 'intervention_failure' ? 'border-destructive/30 bg-destructive/5' :
                'border-border bg-secondary/20'
              )}>
                <Icon className={cn('w-3 h-3', config.color)} />
                <span className={config.color}>{count}</span>
                <span className="text-muted-foreground">{config.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {enrichedEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'bg-secondary/30 border rounded-md p-3',
                event.anomalies.includes('threshold_breach') ? 'border-risk-critical/40 bg-risk-critical/5' :
                event.anomalies.includes('fast_escalation') ? 'border-risk-high/40 bg-risk-high/5' :
                event.anomalies.includes('intervention_failure') ? 'border-destructive/40 bg-destructive/5' :
                event.status === 'critical' ? 'border-risk-critical/40' :
                event.status === 'high' ? 'border-risk-high/40' :
                'border-border'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[11px] font-mono font-medium text-foreground truncate">
                    {event.name}
                  </span>
                  {/* Anomaly badges */}
                  {event.anomalies.slice(0, 2).map(anomaly => {
                    const config = anomalyConfig[anomaly];
                    const Icon = config.icon;
                    return (
                      <div key={anomaly} className={cn('flex items-center gap-0.5', config.color)} title={config.label}>
                        <Icon className="w-3 h-3" />
                      </div>
                    );
                  })}
                </div>
                <SeverityBadge severity={event.status as RiskSeverity} />
              </div>
              
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span>{event.region}</span>
                <span>•</span>
                <span className={Number(event.probability) >= 75 ? 'text-risk-critical font-semibold' : ''}>
                  P: {Number(event.probability).toFixed(0)}%
                </span>
                <span>•</span>
                <span className={Number(event.severity) >= 85 ? 'text-risk-critical font-semibold' : ''}>
                  S: {Number(event.severity).toFixed(0)}
                </span>
                <span>•</span>
                <span className={cn(
                  event.velocity === 'rising' ? 'text-risk-critical' :
                  event.velocity === 'falling' ? 'text-risk-stable' :
                  'text-muted-foreground'
                )}>
                  {event.velocity === 'rising' ? '↑' : event.velocity === 'falling' ? '↓' : '→'} {event.velocity}
                </span>
                {event.escalationRate !== undefined && event.escalationRate > 5 && (
                  <>
                    <span>•</span>
                    <span className="text-risk-high">+{event.escalationRate.toFixed(0)}% escalation</span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
