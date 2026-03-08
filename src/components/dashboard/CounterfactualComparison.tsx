import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, TrendingDown, Shield, AlertTriangle } from 'lucide-react';

interface Scenario {
  id: string;
  label: string;
  icon: typeof Shield;
  color: string;
  borderColor: string;
}

interface RiskComparison {
  name: string;
  sector: string;
  current: number;
  noAction: number;
  withIntervention: number;
  interventionName: string;
  reductionPercent: number;
}

const scenarios: Scenario[] = [
  { id: 'current', label: 'Current Risk', icon: AlertTriangle, color: 'text-risk-high', borderColor: 'border-risk-high/30' },
  { id: 'noAction', label: 'No Action (72h)', icon: AlertTriangle, color: 'text-risk-critical', borderColor: 'border-risk-critical/30' },
  { id: 'withIntervention', label: 'With Intervention', icon: Shield, color: 'text-risk-stable', borderColor: 'border-risk-stable/30' },
];

const comparisons: RiskComparison[] = [
  {
    name: 'Eastlands Flood Event', sector: 'Flood',
    current: 78, noAction: 94, withIntervention: 52,
    interventionName: 'Clear drainage + early warning SMS',
    reductionPercent: 33,
  },
  {
    name: 'Grid Cascade Failure', sector: 'Energy',
    current: 63, noAction: 85, withIntervention: 41,
    interventionName: 'Load shedding Plan B + mobile generators',
    reductionPercent: 35,
  },
  {
    name: 'Vaccine Cold Chain Break', sector: 'Health',
    current: 41, noAction: 67, withIntervention: 18,
    interventionName: 'Reroute cold chain + solar backup',
    reductionPercent: 56,
  },
  {
    name: 'Road Network Collapse', sector: 'Logistics',
    current: 52, noAction: 78, withIntervention: 34,
    interventionName: 'Restrict loads + emergency repair crews',
    reductionPercent: 35,
  },
  {
    name: 'Microfinance Liquidity Crisis', sector: 'Finance',
    current: 34, noAction: 58, withIntervention: 22,
    interventionName: 'Emergency credit facility + stress review',
    reductionPercent: 35,
  },
];

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

  // Aggregate stats
  const avgCurrent = comparisons.reduce((s, c) => s + c.current, 0) / comparisons.length;
  const avgNoAction = comparisons.reduce((s, c) => s + c.noAction, 0) / comparisons.length;
  const avgIntervention = comparisons.reduce((s, c) => s + c.withIntervention, 0) / comparisons.length;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Counterfactual Comparison — Decision Intelligence</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
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

      {/* Intervention leverage headline */}
      <div className="flex items-center gap-2 bg-risk-stable/10 border border-risk-stable/20 rounded-lg px-3 py-2 mb-4">
        <TrendingDown className="w-4 h-4 text-risk-stable flex-shrink-0" />
        <span className="text-xs font-mono text-risk-stable">
          Combined interventions reduce average risk from <span className="font-bold">{avgNoAction.toFixed(0)}%</span> → <span className="font-bold">{avgIntervention.toFixed(0)}%</span> (−{(avgNoAction - avgIntervention).toFixed(0)}pp)
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-risk-stable bg-risk-stable/10 px-1.5 py-0.5 rounded">
                      −{comp.reductionPercent}%
                    </span>
                  </div>
                </div>

                {/* Three-bar comparison */}
                <div className="space-y-1.5">
                  {[
                    { label: 'Current', value: comp.current },
                    { label: 'No Action', value: comp.noAction },
                    { label: 'Intervened', value: comp.withIntervention },
                  ].map(bar => (
                    <div key={bar.label} className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-muted-foreground w-16 text-right">{bar.label}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
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
                  <div className="bg-secondary/10 border border-border/50 rounded-b-lg px-3 py-2 -mt-1">
                    <div className="flex items-start gap-2">
                      <Shield className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">Recommended Intervention</span>
                        <p className="text-xs font-mono text-primary mt-0.5">{comp.interventionName}</p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-muted-foreground">
                          <span className={getRiskTextColor(comp.noAction)}>{comp.noAction}%</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className={getRiskTextColor(comp.withIntervention)}>{comp.withIntervention}%</span>
                          <span className="text-risk-stable ml-1">(saves {((comp.noAction - comp.withIntervention) / comp.noAction * 100).toFixed(0)}% of projected risk)</span>
                        </div>
                      </div>
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
