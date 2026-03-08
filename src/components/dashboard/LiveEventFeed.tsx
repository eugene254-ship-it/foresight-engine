import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LiveRiskEvent } from '@/hooks/useRealtimeRisks';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import type { RiskSeverity } from '@/data/mockRiskData';

interface Props {
  events: LiveRiskEvent[];
}

export const LiveEventFeed = ({ events }: Props) => {
  if (events.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
          Live Event Feed
        </h3>
        <div className="text-center py-6 text-[11px] font-mono text-muted-foreground">
          No live events yet. Click "Simulate Live Event" to stream data.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
        Live Event Feed
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'bg-secondary/30 border rounded-md p-3',
                event.status === 'critical' ? 'border-risk-critical/40' :
                event.status === 'high' ? 'border-risk-high/40' :
                'border-border'
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-mono font-medium text-foreground truncate">
                  {event.name}
                </span>
                <SeverityBadge severity={event.status as RiskSeverity} />
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span>{event.region}</span>
                <span>•</span>
                <span>P: {Number(event.probability).toFixed(0)}%</span>
                <span>•</span>
                <span>S: {Number(event.severity).toFixed(0)}</span>
                <span>•</span>
                <span className={cn(
                  event.velocity === 'rising' ? 'text-risk-critical' :
                  event.velocity === 'falling' ? 'text-risk-stable' :
                  'text-muted-foreground'
                )}>
                  {event.velocity === 'rising' ? '↑' : event.velocity === 'falling' ? '↓' : '→'} {event.velocity}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
