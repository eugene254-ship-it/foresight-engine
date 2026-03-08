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

export const FragilityIndexPanel = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-4">System Fragility Index</h3>

      <div className="space-y-5">
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

              {/* Main bar */}
              <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${system.score * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className={cn('h-full rounded-full', color.bar)}
                />
              </div>

              {/* Decomposition */}
              <div className="grid grid-cols-5 gap-1">
                {system.components.map(comp => {
                  const compColor = getFragilityColor(comp.score);
                  return (
                    <div key={comp.name} className="text-center">
                      <div className="h-1 bg-muted rounded-full overflow-hidden mb-0.5">
                        <div className={cn('h-full rounded-full', compColor.bar)} style={{ width: `${comp.score * 100}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground leading-tight block">{comp.name}</span>
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
