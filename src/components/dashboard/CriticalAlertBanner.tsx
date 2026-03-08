import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveRiskEvent } from '@/hooks/useRealtimeRisks';
import { useAlertSound } from '@/hooks/useAlertSound';

const CRITICAL_PROBABILITY = 75;
const CRITICAL_SEVERITY = 85;

interface CriticalAlert {
  eventKey: string;
  name: string;
  region: string;
  reason: string;
  probability: number;
  severity: number;
}

interface Props {
  liveEvents: LiveRiskEvent[];
}

export const CriticalAlertBanner = ({ liveEvents }: Props) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { checkAndAlert, requestPermission } = useAlertSound();

  const alerts = useMemo(() => {
    const result: CriticalAlert[] = [];
    for (const e of liveEvents) {
      if (dismissed.has(e.event_key)) continue;
      const reasons: string[] = [];
      if (Number(e.probability) >= CRITICAL_PROBABILITY) reasons.push(`P: ${Math.round(Number(e.probability))}%`);
      if (Number(e.severity) >= CRITICAL_SEVERITY) reasons.push(`S: ${Math.round(Number(e.severity))}/100`);
      if (reasons.length > 0) {
        result.push({
          eventKey: e.event_key,
          name: e.name,
          region: e.region,
          reason: reasons.join(' · '),
          probability: Number(e.probability),
          severity: Number(e.severity),
        });
      }
    }
    return result.sort((a, b) => b.probability - a.probability);
  }, [liveEvents, dismissed]);

  const handleDismiss = (key: string) => {
    setDismissed(prev => new Set(prev).add(key));
  };

  // Trigger sound + notification for new critical alerts
  useEffect(() => {
    if (soundEnabled && alerts.length > 0) {
      checkAndAlert(alerts.map(a => a.eventKey));
    }
  }, [alerts, soundEnabled, checkAndAlert]);

  // Request notification permission on first enable
  useEffect(() => {
    if (soundEnabled) requestPermission();
  }, [soundEnabled, requestPermission]);

  if (alerts.length === 0) return null;

  const shown = expanded ? alerts : alerts.slice(0, 1);

  return (
    <div className="px-4 pb-2">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative border rounded-lg overflow-hidden',
          'border-destructive/40 bg-destructive/5'
        )}
      >
        {/* Animated top line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-destructive to-transparent animate-pulse" />

        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-[11px] font-mono font-semibold text-destructive tracking-wider uppercase">
                Critical Threshold Breach — {alerts.length} active
              </span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded hover:bg-destructive/10 transition-colors"
              title={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
            >
              {soundEnabled
                ? <Volume2 className="w-3.5 h-3.5 text-destructive" />
                : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {alerts.length > 1 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'Collapse' : `+${alerts.length - 1} more`}
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {shown.map((alert) => (
              <motion.div
                key={alert.eventKey}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between py-1.5 border-b border-destructive/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs font-mono font-medium text-foreground">{alert.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{alert.region}</span>
                  <span className="text-[10px] font-mono text-destructive font-semibold">{alert.reason}</span>
                </div>
                <button
                  onClick={() => handleDismiss(alert.eventKey)}
                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
