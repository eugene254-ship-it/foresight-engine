import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockRiskEvents } from '@/data/mockRiskData';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

const readinessConfig = {
  ready: { 
    color: 'text-risk-stable', 
    bg: 'bg-risk-stable/10', 
    border: 'border-risk-stable/30',
    icon: CheckCircle,
    label: 'Ready',
  },
  partial: { 
    color: 'text-risk-medium', 
    bg: 'bg-risk-medium/10', 
    border: 'border-risk-medium/30',
    icon: Clock,
    label: 'Partial',
  },
  unready: { 
    color: 'text-risk-critical', 
    bg: 'bg-risk-critical/10', 
    border: 'border-risk-critical/30',
    icon: XCircle,
    label: 'Unready',
  },
};

export const InterventionReadinessPanel = () => {
  const stats = useMemo(() => {
    const counts = { ready: 0, partial: 0, unready: 0 };
    for (const e of mockRiskEvents) {
      counts[e.interventionReadiness]++;
    }
    const total = mockRiskEvents.length;
    const readinessScore = Math.round((counts.ready * 100 + counts.partial * 50) / total);
    
    // Aggregate intervention capacity
    const totalReduction = mockRiskEvents.reduce((sum, e) => 
      sum + e.interventionDetails.reduce((s, iv) => s + iv.riskReduction, 0), 0
    );
    const avgReduction = Math.round(totalReduction / mockRiskEvents.length);
    
    // Time to effect analysis
    const fastInterventions = mockRiskEvents.flatMap(e => e.interventionDetails)
      .filter(iv => iv.timeToEffect.includes('hour') || iv.timeToEffect.includes('minute')).length;
    
    return { counts, total, readinessScore, avgReduction, fastInterventions };
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-risk-stable';
    if (score >= 40) return 'text-risk-medium';
    return 'text-risk-critical';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Intervention Readiness Overview
          </h3>
        </div>
        <div className={cn('text-lg font-mono font-bold tabular-nums', getScoreColor(stats.readinessScore))}>
          {stats.readinessScore}%
        </div>
      </div>

      {/* Readiness distribution */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['ready', 'partial', 'unready'] as const).map(status => {
          const config = readinessConfig[status];
          const Icon = config.icon;
          const pct = Math.round((stats.counts[status] / stats.total) * 100);
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('rounded-lg border p-3 text-center', config.border, config.bg)}
            >
              <Icon className={cn('w-4 h-4 mx-auto mb-1', config.color)} />
              <div className={cn('text-xl font-mono font-bold tabular-nums', config.color)}>
                {stats.counts[status]}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground uppercase mt-0.5">
                {config.label} ({pct}%)
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Readiness bar visualization */}
      <div className="h-2 rounded-full overflow-hidden flex mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(stats.counts.ready / stats.total) * 100}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-risk-stable"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(stats.counts.partial / stats.total) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="h-full bg-risk-medium"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(stats.counts.unready / stats.total) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full bg-risk-critical"
        />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/30 rounded-md p-2.5">
          <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Avg Risk Reduction</div>
          <div className="text-lg font-mono font-bold text-risk-stable tabular-nums">
            −{stats.avgReduction}%
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">per intervention set</div>
        </div>
        <div className="bg-secondary/30 rounded-md p-2.5">
          <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Fast-Deploy</div>
          <div className="text-lg font-mono font-bold text-primary tabular-nums">
            {stats.fastInterventions}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">interventions &lt;12h</div>
        </div>
      </div>

      {/* Unready risks warning */}
      {stats.counts.unready > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex items-center gap-2 bg-risk-critical/10 border border-risk-critical/20 rounded-md px-3 py-2"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-risk-critical flex-shrink-0" />
          <span className="text-[10px] font-mono text-risk-critical">
            {stats.counts.unready} risk{stats.counts.unready > 1 ? 's' : ''} without ready interventions — requires immediate planning
          </span>
        </motion.div>
      )}
    </div>
  );
};
