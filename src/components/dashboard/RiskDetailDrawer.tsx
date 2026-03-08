import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Activity, Users, Clock, Zap } from 'lucide-react';
import { type RiskEvent } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { ProbabilityPill } from '@/components/shared/ProbabilityPill';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { TrendChip } from '@/components/shared/TrendChip';

interface Props {
  event: RiskEvent | null;
  onClose: () => void;
}

export const RiskDetailDrawer = ({ event, onClose }: Props) => {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SeverityBadge severity={event.status} />
                <span className="text-[10px] font-mono text-muted-foreground">{event.lastUpdated}</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">{event.name}</h2>
              <p className="text-xs text-muted-foreground font-mono">{event.region} · {event.sector}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Probability', value: <ProbabilityPill value={event.probability} size="lg" />, icon: Activity },
                { label: 'Severity', value: <span className="text-2xl font-mono font-bold text-foreground">{event.severity}</span>, icon: AlertTriangle },
                { label: 'Exposure', value: <span className="text-2xl font-mono font-bold text-foreground">{(event.exposure / 1000).toFixed(0)}K</span>, icon: Users },
              ].map(m => (
                <div key={m.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                  <m.icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                  <div>{m.value}</div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">Impact Window</span>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">{event.impactWindow}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">Cascade Potential</span>
                </div>
                <span className="text-sm font-mono font-semibold text-risk-high">{event.cascadePotential}%</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">Velocity: <TrendChip direction={event.velocity} /></div>
              <div className="flex items-center gap-1.5">Confidence: <ConfidenceMeter level={event.confidence} /></div>
              <div>Mitigation: <span className="text-primary">{event.mitigationLeverage}%</span></div>
            </div>

            {/* Drivers */}
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">Risk Drivers</h3>
              <div className="space-y-1.5">
                {event.drivers.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="w-1 h-1 rounded-full bg-risk-high mt-1.5 flex-shrink-0" />
                    <span className="font-mono">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Failure Pathway */}
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">Failure Pathway</h3>
              <p className="text-xs text-secondary-foreground leading-relaxed bg-secondary/30 rounded-lg p-3 border border-border">
                {event.failurePathway}
              </p>
            </div>

            {/* Interventions */}
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">Recommended Interventions</h3>
              <div className="space-y-1.5">
                {event.interventions.map((intervention, i) => (
                  <button key={i} className="w-full text-left flex items-center gap-2 text-xs font-mono text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-md px-3 py-2 transition-colors">
                    <span className="w-4 h-4 rounded-full border border-primary/40 flex items-center justify-center text-[9px] flex-shrink-0">{i + 1}</span>
                    {intervention}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
