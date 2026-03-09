import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockFragilitySystems } from '@/data/mockRiskData';
import { TrendChip } from '@/components/shared/TrendChip';
import { cn } from '@/lib/utils';

const getFragilityColor = (score: number) => {
  if (score >= 0.8) return { bar: 'bg-risk-critical', text: 'text-risk-critical', label: 'Critical' };
  if (score >= 0.6) return { bar: 'bg-risk-high', text: 'text-risk-high', label: 'High' };
  if (score >= 0.4) return { bar: 'bg-risk-medium', text: 'text-risk-medium', label: 'Elevated' };
  return { bar: 'bg-risk-stable', text: 'text-risk-stable', label: 'Stable' };
};

const getBandLabel = (score: number) => {
  if (score >= 0.85) return 'NONLINEAR FAILURE ZONE';
  if (score >= 0.7) return 'HIGH FRAGILITY';
  if (score >= 0.5) return 'ELEVATED';
  return 'MANAGEABLE';
};

export const FragilityIndexPanel = () => {
  const composite = useMemo(() => {
    const weighted = mockFragilitySystems.reduce((s, sys) => s + sys.score, 0) / mockFragilitySystems.length;
    return weighted;
  }, []);

  const compositeColor = getFragilityColor(composite);
  const risingCount = mockFragilitySystems.filter(s => s.trend === 'rising').length;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">System Fragility Index</h3>

      {/* Composite Score */}
      <div className={cn('rounded-lg border p-4 mb-4', 
        composite >= 0.8 ? 'border-risk-critical/40 bg-risk-critical/5' : 
        composite >= 0.6 ? 'border-risk-high/30 bg-risk-high/5' : 'border-border'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Composite Index</span>
            <div className={cn('text-3xl font-mono font-bold tabular-nums', compositeColor.text)}>
              {composite.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className={cn('text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
              composite >= 0.8 ? 'text-risk-critical border-risk-critical/40 bg-risk-critical/10' :
              composite >= 0.6 ? 'text-risk-high border-risk-high/30 bg-risk-high/10' :
              'text-risk-medium border-risk-medium/30 bg-risk-medium/10'
            )}>
              {getBandLabel(composite)}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground block mt-1">
              {risingCount}/{mockFragilitySystems.length} systems rising
            </span>
          </div>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${composite * 100}%` }}
            transition={{ duration: 1 }}
            className={cn('h-full rounded-full', compositeColor.bar)}
          />
        </div>
        {/* Band markers */}
        <div className="flex justify-between mt-1 text-[8px] font-mono text-muted-foreground">
          <span>0.0 Stable</span>
          <span>0.4</span>
          <span>0.6</span>
          <span>0.8 Critical</span>
          <span>1.0</span>
        </div>
      </div>

      {/* Subsystems */}
      <div className="space-y-4">
        {mockFragilitySystems.map((system, i) => {
          const color = getFragilityColor(system.score);
          return (
            <motion.div key={system.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">{system.name}</span>
                <div className="flex items-center gap-2">
                  <TrendChip direction={system.trend} />
                  <span className={cn('text-lg font-mono font-bold tabular-nums', color.text)}>
                    {system.score.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${system.score * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={cn('h-full rounded-full', color.bar)}
                />
              </div>

              <div className="grid grid-cols-5 gap-1">
                {system.components.map(comp => {
                  const compColor = getFragilityColor(comp.score);
                  return (
                    <div key={comp.name} className="text-center">
                      <div className="h-1 bg-muted rounded-full overflow-hidden mb-0.5">
                        <div className={cn('h-full rounded-full', compColor.bar)} style={{ width: `${comp.score * 100}%` }} />
                      </div>
                      <span className="text-[7px] font-mono text-muted-foreground leading-tight block">{comp.name}</span>
                      <span className={cn('text-[9px] font-mono font-semibold', compColor.text)}>{comp.score.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
