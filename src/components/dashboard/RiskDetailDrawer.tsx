import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Activity, Users, Clock, Zap, ChevronDown, ChevronUp, Lightbulb, TrendingDown, Shield, DollarSign } from 'lucide-react';
import { type RiskEvent } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { ProbabilityPill } from '@/components/shared/ProbabilityPill';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { TrendChip } from '@/components/shared/TrendChip';
import { cn } from '@/lib/utils';

interface Props {
  event: RiskEvent | null;
  onClose: () => void;
}

export const RiskDetailDrawer = ({ event, onClose }: Props) => {
  const [showExplain, setShowExplain] = useState(false);
  const [showDrivers, setShowDrivers] = useState(true);

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

          <div className="p-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Probability', value: <ProbabilityPill value={event.probability} size="lg" />, icon: Activity },
                { label: 'Severity', value: <span className="text-2xl font-mono font-bold text-foreground">{event.severity}</span>, icon: AlertTriangle },
                { label: 'Exposure', value: <span className="text-2xl font-mono font-bold text-foreground">{(event.exposure / 1000).toFixed(0)}K</span>, icon: Users },
              ].map(m => (
                <div key={m.label} className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <m.icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                  <div>{m.value}</div>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">Time to Failure</span>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">{event.timeToFailure}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">Cascade Risk</span>
                </div>
                <span className="text-sm font-mono font-semibold text-risk-high">{event.cascadePotential}%</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">Velocity: <TrendChip direction={event.velocity} /></div>
              <div className="flex items-center gap-1.5">Confidence: <ConfidenceMeter level={event.confidence} /></div>
              <div>Leverage: <span className="text-primary">{event.mitigationLeverage}%</span></div>
            </div>

            {/* Explainability — "Why this risk is high" */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowExplain(!showExplain)}
                className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-risk-medium" />
                  <span className="text-[11px] font-mono font-medium text-foreground">Why this risk is high</span>
                </div>
                {showExplain ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {showExplain && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 text-xs text-secondary-foreground leading-relaxed bg-secondary/10">
                      {event.explainability}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Risk Drivers — Weighted */}
            <div>
              <button onClick={() => setShowDrivers(!showDrivers)}
                className="flex items-center gap-2 mb-2 w-full">
                <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Contributing Factors</h3>
                {showDrivers ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {showDrivers && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {event.riskDrivers.map((d, i) => (
                      <div key={i} className="bg-secondary/30 rounded-md p-2.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-mono font-medium text-foreground">{d.name}</span>
                          <div className="flex items-center gap-2">
                            <TrendChip direction={d.direction} />
                            <span className="text-[11px] font-mono font-bold text-primary">{d.contribution}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${d.contribution}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={cn('h-full rounded-full',
                              d.contribution >= 30 ? 'bg-risk-critical' : d.contribution >= 20 ? 'bg-risk-high' : 'bg-risk-medium'
                            )}
                          />
                        </div>
                        <p className="text-[10px] font-mono text-muted-foreground">{d.evidence}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Failure Pathway */}
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">Failure Pathway</h3>
              <p className="text-xs text-secondary-foreground leading-relaxed bg-secondary/30 rounded-lg p-3 border border-border">
                {event.failurePathway}
              </p>
            </div>

            {/* Intervention Leverage — with details */}
            <div>
              <h3 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">Intervention Leverage</h3>
              <div className="space-y-2">
                {event.interventionDetails.map((iv, i) => (
                  <div key={i} className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[11px] font-mono font-medium text-primary flex-1">{iv.name}</span>
                      <span className="text-[11px] font-mono font-bold text-risk-stable ml-2">−{iv.riskReduction}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{iv.timeToEffect}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-2.5 h-2.5" />
                        <span>{iv.operationalCost}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-2.5 h-2.5" />
                        <ConfidenceMeter level={iv.confidence} />
                      </div>
                    </div>
                    {/* Risk reduction bar */}
                    <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${iv.riskReduction * 3}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="h-full rounded-full bg-risk-stable"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total reduction */}
              <div className="mt-2 flex items-center gap-2 bg-risk-stable/10 border border-risk-stable/20 rounded-md px-3 py-2">
                <TrendingDown className="w-3.5 h-3.5 text-risk-stable flex-shrink-0" />
                <span className="text-[10px] font-mono text-risk-stable">
                  Combined: −{event.interventionDetails.reduce((s, iv) => s + iv.riskReduction, 0)}% projected risk reduction
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
