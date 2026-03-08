import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { mockRiskEvents, type RiskEvent } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { ProbabilityPill } from '@/components/shared/ProbabilityPill';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { TrendChip } from '@/components/shared/TrendChip';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortKey = 'probability' | 'severity' | 'exposure' | 'cascadePotential' | 'confidence';

const confOrder = { high: 3, medium: 2, low: 1 };

interface Props {
  onSelectEvent: (event: RiskEvent) => void;
}

export const RiskRankingTable = ({ onSelectEvent }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>('severity');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...mockRiskEvents].sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === 'confidence') {
        va = confOrder[a.confidence]; vb = confOrder[b.confidence];
      } else {
        va = a[sortKey]; vb = b[sortKey];
      }
      return sortAsc ? va - vb : vb - va;
    });
  }, [sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const columns: { key: SortKey; label: string }[] = [
    { key: 'probability', label: 'Prob' },
    { key: 'severity', label: 'Severity' },
    { key: 'exposure', label: 'Exposure' },
    { key: 'cascadePotential', label: 'Cascade' },
    { key: 'confidence', label: 'Conf' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Risk Ranking — Operational Queue</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-[10px] font-mono text-muted-foreground font-medium">#</th>
              <th className="text-left px-4 py-2 text-[10px] font-mono text-muted-foreground font-medium">Event</th>
              <th className="text-left px-4 py-2 text-[10px] font-mono text-muted-foreground font-medium">Status</th>
              {columns.map(col => (
                <th key={col.key} className="text-left px-3 py-2">
                  <button onClick={() => toggleSort(col.key)}
                    className={cn('flex items-center gap-1 text-[10px] font-mono font-medium transition-colors',
                      sortKey === col.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}>
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}
              <th className="text-left px-3 py-2 text-[10px] font-mono text-muted-foreground font-medium">Trend</th>
              <th className="text-left px-3 py-2 text-[10px] font-mono text-muted-foreground font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((event, i) => (
              <motion.tr key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onSelectEvent(event)}
                className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="font-semibold text-foreground">{event.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{event.region}</div>
                </td>
                <td className="px-4 py-2.5"><SeverityBadge severity={event.status} /></td>
                <td className="px-3 py-2.5"><ProbabilityPill value={event.probability} size="sm" /></td>
                <td className="px-3 py-2.5 font-mono text-foreground">{event.severity}/100</td>
                <td className="px-3 py-2.5 font-mono text-foreground">{(event.exposure / 1000).toFixed(0)}K</td>
                <td className="px-3 py-2.5 font-mono text-risk-high">{event.cascadePotential}%</td>
                <td className="px-3 py-2.5"><ConfidenceMeter level={event.confidence} /></td>
                <td className="px-3 py-2.5"><TrendChip direction={event.velocity} /></td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground text-[10px]">{event.lastUpdated}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
