import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockRiskEvents, type RiskDriver } from '@/data/mockRiskData';
import { TrendChip } from '@/components/shared/TrendChip';
import { cn } from '@/lib/utils';

// Aggregate all risk drivers across events, sum contributions
function aggregateDrivers(): (RiskDriver & { sources: string[] })[] {
  const map = new Map<string, RiskDriver & { sources: string[]; total: number }>();
  for (const event of mockRiskEvents) {
    for (const d of event.riskDrivers) {
      const existing = map.get(d.name);
      if (existing) {
        existing.total += d.contribution * (event.probability / 100);
        existing.sources.push(event.name);
        if (d.direction === 'rising') existing.direction = 'rising';
      } else {
        map.set(d.name, {
          ...d,
          total: d.contribution * (event.probability / 100),
          sources: [event.name],
        });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map(d => ({ ...d, contribution: Math.round(d.total) }));
}

export const ContributingFactorsPanel = () => {
  const drivers = aggregateDrivers();
  const maxContribution = Math.max(...drivers.map(d => d.contribution), 1);
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">
        Top Contributing Factors — Cross-Risk Drivers
      </h3>

      <div className="space-y-2">
        {drivers.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => setExpandedDriver(expandedDriver === d.name ? null : d.name)}
              className="w-full text-left"
            >
              <div className="bg-secondary/20 hover:bg-secondary/40 rounded-md p-2.5 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono font-medium text-foreground">{d.name}</span>
                  <div className="flex items-center gap-2">
                    <TrendChip direction={d.direction} />
                    <span className={cn('text-[11px] font-mono font-bold tabular-nums',
                      d.contribution >= 25 ? 'text-risk-critical' : d.contribution >= 15 ? 'text-risk-high' : 'text-risk-medium'
                    )}>{d.contribution}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(d.contribution / maxContribution) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className={cn('h-full rounded-full',
                      d.contribution >= 25 ? 'bg-risk-critical' : d.contribution >= 15 ? 'bg-risk-high' : 'bg-risk-medium'
                    )}
                  />
                </div>
              </div>
            </button>

            {expandedDriver === d.name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-secondary/10 border border-border/50 rounded-b-md px-3 py-2 -mt-0.5 space-y-1.5"
              >
                <p className="text-[10px] font-mono text-muted-foreground">{d.evidence}</p>
                <div className="text-[9px] font-mono text-muted-foreground">
                  <span className="text-secondary-foreground">Affects:</span>{' '}
                  {d.sources.join(' · ')}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
