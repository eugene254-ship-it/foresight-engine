import { dataSourceHealth } from '@/data/mockRiskData';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const statusConfig = {
  active: { color: 'bg-risk-stable', icon: CheckCircle, label: 'Active', textColor: 'text-risk-stable' },
  delayed: { color: 'bg-risk-medium', icon: Clock, label: 'Delayed', textColor: 'text-risk-medium' },
  stale: { color: 'bg-risk-critical', icon: AlertTriangle, label: 'Stale', textColor: 'text-risk-critical' },
};

export const DataSourceHealthBar = () => {
  const avgConfidence = Math.round(dataSourceHealth.reduce((s, d) => s + d.confidence, 0) / dataSourceHealth.length);
  const staleCount = dataSourceHealth.filter(d => d.status === 'stale').length;
  const delayedCount = dataSourceHealth.filter(d => d.status === 'delayed').length;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Data Confidence & Source Health</h3>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className={cn('font-bold tabular-nums', avgConfidence >= 70 ? 'text-risk-stable' : avgConfidence >= 50 ? 'text-risk-medium' : 'text-risk-critical')}>
            Model Confidence: {avgConfidence}%
          </span>
          {staleCount > 0 && (
            <span className="text-risk-critical flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {staleCount} stale
            </span>
          )}
          {delayedCount > 0 && (
            <span className="text-risk-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {delayedCount} delayed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {dataSourceHealth.map(source => {
          const config = statusConfig[source.status];
          const Icon = config.icon;
          return (
            <div key={source.name} className={cn(
              'rounded-md p-2.5 border transition-colors',
              source.status === 'stale' ? 'border-risk-critical/30 bg-risk-critical/5' :
              source.status === 'delayed' ? 'border-risk-medium/20 bg-risk-medium/5' :
              'border-border bg-secondary/20'
            )}>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('w-3 h-3 flex-shrink-0', config.textColor)} />
                  <span className="text-[10px] font-mono font-medium text-foreground leading-tight">{source.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono text-muted-foreground">{source.lastUpdate}</span>
                <span className={cn('text-[10px] font-mono font-bold tabular-nums', 
                  source.confidence >= 80 ? 'text-risk-stable' : source.confidence >= 50 ? 'text-risk-medium' : 'text-risk-critical'
                )}>{source.confidence}%</span>
              </div>

              {/* Confidence bar */}
              <div className="h-1 bg-muted rounded-full overflow-hidden mb-1">
                <div className={cn('h-full rounded-full transition-all',
                  source.confidence >= 80 ? 'bg-risk-stable' : source.confidence >= 50 ? 'bg-risk-medium' : 'bg-risk-critical'
                )} style={{ width: `${source.confidence}%` }} />
              </div>

              {/* Coverage */}
              <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                <span>Coverage</span>
                <span>{source.coverage}%</span>
              </div>

              {source.warning && (
                <div className="mt-1.5 text-[9px] font-mono text-risk-critical bg-risk-critical/5 rounded px-1.5 py-1 border border-risk-critical/10">
                  ⚠ {source.warning}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
