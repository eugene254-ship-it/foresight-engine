import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, TrendingDown, Shield, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { mockRiskEvents } from '@/data/mockRiskData';
import type { ConfidenceLevel } from '@/data/mockRiskData';

interface Scenario {
  id: string;
  label: string;
  icon: typeof Shield;
  color: string;
  borderColor: string;
}

const scenarios: Scenario[] = [
  { id: 'current', label: 'Current Risk', icon: AlertTriangle, color: 'text-risk-high', borderColor: 'border-risk-high/30' },
  { id: 'noAction', label: 'No Action (72h)', icon: AlertTriangle, color: 'text-risk-critical', borderColor: 'border-risk-critical/30' },
  { id: 'withIntervention', label: 'With Intervention', icon: Shield, color: 'text-risk-stable', borderColor: 'border-risk-stable/30' },
];

// Build comparisons from enriched mock data
const comparisons = mockRiskEvents.slice(0, 5).map(e => ({
  name: e.name,
  sector: e.sector,
  current: e.probability,
  noAction: Math.min(100, Math.round(e.probability * 1.3)),
  withIntervention: Math.max(5, Math.round(e.probability - e.interventionDetails.reduce((s, iv) => s + iv.riskReduction, 0))),
  interventionName: e.interventionDetails[0]?.name || e.interventions[0],
  reductionPercent: e.interventionDetails.reduce((s, iv) => s + iv.riskReduction, 0),
  timeToEffect: e.interventionDetails[0]?.timeToEffect || 'Unknown',
  operationalCost: e.interventionDetails[0]?.operationalCost || 'N/A',
  confidence: e.interventionDetails[0]?.confidence || 'medium' as ConfidenceLevel,
}));

const getRiskColor = (value: number) => {
  if (value >= 80) return 'bg-risk-critical';
  if (value >= 60) return 'bg-risk-high';
  if (value >= 40) return 'bg-risk-medium';
  return 'bg-risk-stable';
};

const getRiskTextColor = (value: number) => {
  if (value >= 80) return 'text-risk-critical';
  if (value >= 60) return 'text-risk-high';
  if (value >= 40) return 'text-risk-medium';
  return 'text-risk-stable';
};

export const CounterfactualComparison = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const avgCurrent = comparisons.reduce((s, c) => s + c.current, 0) / comparisons.length;
  const avgNoAction = comparisons.reduce((s, c) => s + c.noAction, 0) / comparisons.length;
  const avgIntervention = comparisons.reduce((s, c) => s + c.withIntervention, 0) / comparisons.length;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Intervention Leverage — Decision Intelligence</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Current Risk', value: avgCurrent, scenario: scenarios[0] },
          { label: 'If No Action (72h)', value: avgNoAction, scenario: scenarios[1] },
          { label: 'With Interventions', value: avgIntervention, scenario: scenarios[2] },
        ].map(item => (
          <div key={item.label} className={cn('rounded-lg border p-3 text-center', item.scenario.borderColor)}>
            <item.scenario.icon className={cn('w-4 h-4 mx-auto mb-1', item.scenario.color)} />
            <div className={cn('text-2xl font-mono font-bold tabular-nums', item.scenario.color)}>
              {item.value.toFixed(0)}%
            </div>
            <div className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Aggregate headline */}
      <div className="flex items-center gap-2 bg-risk-stable/10 border border-risk-stable/20 rounded-lg px-3 py-2 mb-4">
        <TrendingDown className="w-4 h-4 text-risk-stable flex-shrink-0" />
        <span className="text-xs font-mono text-risk-stable">
          Combined interventions: <span className="font-bold">{avgNoAction.toFixed(0)}%</span> → <span className="font-bold">{avgIntervention.toFixed(0)}%</span> (−{(avgNoAction - avgIntervention).toFixed(0)}pp)
        </span>
      </div>

      {/* Comparison rows */}
      <div className="space-y-2">
        {comparisons.map((comp, i) => (
          <motion.div key={comp.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => setExpandedRow(expandedRow === comp.name ? null : comp.name)}
              className="w-full text-left"
            >
              <div className="bg-secondary/20 hover:bg-secondary/40 rounded-lg p-3 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-foreground">{comp.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-2">{comp.sector}</span>
                  </div>
                  <span className="text-[9px] font-mono text-risk-stable bg-risk-stable/10 px-1.5 py-0.5 rounded">
                    −{comp.reductionPercent}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: 'Current', value: comp.current },
                    { label: 'No Action', value: comp.noAction },
                    { label: 'Intervened', value: comp.withIntervention },
                  ].map(bar => (
                    <div key={bar.label} className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground w-16 text-right">{bar.label}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bar.value}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className={cn('h-full rounded-full', getRiskColor(bar.value))}
                        />
                      </div>
                      <span className={cn('text-[10px] font-mono font-bold tabular-nums w-8', getRiskTextColor(bar.value))}>
                        {bar.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedRow === comp.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-secondary/10 border border-border/50 rounded-b-lg px-3 py-2.5 -mt-1">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Top Intervention</span>
                        <p className="text-xs font-mono text-primary mt-0.5">{comp.interventionName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{comp.timeToEffect}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{comp.operationalCost}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <ConfidenceMeter level={comp.confidence} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-muted-foreground">
                      <span className={getRiskTextColor(comp.noAction)}>{comp.noAction}%</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className={getRiskTextColor(comp.withIntervention)}>{comp.withIntervention}%</span>
                      <span className="text-risk-stable ml-1">(saves {((comp.noAction - comp.withIntervention) / comp.noAction * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
