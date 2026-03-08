import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealtimeStatus } from '@/hooks/useRealtimeRisks';

interface Props {
  status: RealtimeStatus;
  onTriggerSimulation: () => void;
  isSimulating: boolean;
}

export const LiveStreamIndicator = ({ status, onTriggerSimulation, isSimulating }: Props) => {
  const timeSince = status.lastEventAt
    ? `${Math.round((Date.now() - status.lastEventAt.getTime()) / 1000)}s ago`
    : 'waiting…';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
          Live Data Stream
        </h3>
        <div className="flex items-center gap-2">
          {status.connected ? (
            <Wifi className="w-3.5 h-3.5 text-risk-stable" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-risk-critical" />
          )}
          <span className={cn(
            'text-[10px] font-mono',
            status.connected ? 'text-risk-stable' : 'text-risk-critical'
          )}>
            {status.connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-secondary/30 rounded-md p-2 text-center">
          <div className="text-lg font-mono font-bold text-foreground tabular-nums">
            {status.eventCount}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">EVENTS</div>
        </div>
        <div className="bg-secondary/30 rounded-md p-2 text-center">
          <div className="text-lg font-mono font-bold text-foreground tabular-nums">
            {timeSince}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">LAST UPDATE</div>
        </div>
        <div className="bg-secondary/30 rounded-md p-2 text-center">
          <div className={cn(
            'text-lg font-mono font-bold tabular-nums',
            status.connected ? 'text-risk-stable' : 'text-muted-foreground'
          )}>
            {status.connected ? 'LIVE' : 'OFF'}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">STATUS</div>
        </div>
      </div>

      <button
        onClick={onTriggerSimulation}
        disabled={isSimulating}
        className={cn(
          'w-full py-2 rounded-md text-[11px] font-mono font-medium transition-all',
          'border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20',
          isSimulating && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Radio className="w-3 h-3 mr-1.5 inline" />
        {isSimulating ? 'Streaming…' : 'Simulate Live Event'}
      </button>

      {/* Pulse animation for incoming events */}
      <AnimatePresence>
        {status.lastEventAt && Date.now() - status.lastEventAt.getTime() < 3000 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-[10px] font-mono text-risk-stable text-center"
          >
            ● New risk data received
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
