import { dataSourceHealth } from '@/data/mockRiskData';
import { cn } from '@/lib/utils';

const statusConfig = {
  active: { color: 'bg-risk-stable', label: 'Active' },
  delayed: { color: 'bg-risk-medium', label: 'Delayed' },
  stale: { color: 'bg-risk-critical', label: 'Stale' },
};

export const DataSourceHealthBar = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-3">Data Source Health</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {dataSourceHealth.map(source => {
          const config = statusConfig[source.status];
          return (
            <div key={source.name} className="flex items-center gap-2 bg-secondary/30 rounded-md px-2.5 py-2">
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.color, source.status === 'stale' && 'animate-pulse-risk')} />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-foreground truncate">{source.name}</div>
                <div className="text-[9px] font-mono text-muted-foreground">{source.lastUpdate}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
