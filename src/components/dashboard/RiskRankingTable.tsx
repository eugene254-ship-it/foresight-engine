import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { mockRiskEvents, type RiskEvent } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { ProbabilityPill } from '@/components/shared/ProbabilityPill';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { TrendChip } from '@/components/shared/TrendChip';
import { ArrowUpDown, Pin, PinOff, GitCompare, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortKey = 'probability' | 'severity' | 'exposure' | 'cascadePotential' | 'confidence';

const confOrder = { high: 3, medium: 2, low: 1 };
const readinessConfig = {
  ready: { label: 'READY', className: 'text-risk-stable bg-risk-stable/10 border-risk-stable/30' },
  partial: { label: 'PARTIAL', className: 'text-risk-medium bg-risk-medium/10 border-risk-medium/30' },
  unready: { label: 'UNREADY', className: 'text-risk-critical bg-risk-critical/10 border-risk-critical/30' },
};

interface Props {
  onSelectEvent: (event: RiskEvent) => void;
}

export const RiskRankingTable = ({ onSelectEvent }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>('severity');
  const [sortAsc, setSortAsc] = useState(false);
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  const sorted = useMemo(() => {
    return [...mockRiskEvents].sort((a, b) => {
      // Pinned always first
      const aPinned = pinned.has(a.id) ? 1 : 0;
      const bPinned = pinned.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      let va: number, vb: number;
      if (sortKey === 'confidence') {
        va = confOrder[a.confidence]; vb = confOrder[b.confidence];
      } else {
        va = a[sortKey]; vb = b[sortKey];
      }
      return sortAsc ? va - vb : vb - va;
    });
  }, [sortKey, sortAsc, pinned]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const togglePin = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinned(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleCompare = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparing(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Rank', 'Event', 'Region', 'Sector', 'Probability', 'Severity', 'Exposure', 'Cascade', 'Confidence', 'Time to Failure', 'Readiness', 'Trend'];
    const rows = sorted.map((e, i) => [
      i + 1, e.name, e.region, e.sector, e.probability, e.severity,
      e.exposure, e.cascadePotential, e.confidence, e.timeToFailure, e.interventionReadiness, e.velocity,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'risk-ranking.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const columns: { key: SortKey; label: string }[] = [
    { key: 'probability', label: 'Prob' },
    { key: 'severity', label: 'Severity' },
    { key: 'exposure', label: 'Exposure' },
    { key: 'cascadePotential', label: 'Cascade' },
    { key: 'confidence', label: 'Conf' },
  ];

  const displayEvents = showCompare && comparing.size >= 2
    ? sorted.filter(e => comparing.has(e.id))
    : sorted;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Risk Ranking — Operational Queue</h3>
        <div className="flex items-center gap-2">
          {comparing.size >= 2 && (
            <button onClick={() => setShowCompare(!showCompare)}
              className={cn('flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded-md border transition-all',
                showCompare ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              )}>
              <GitCompare className="w-3 h-3" />
              Compare ({comparing.size})
            </button>
          )}
          <button onClick={exportCSV}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-secondary transition-colors">
            <FileDown className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium w-8"></th>
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium">#</th>
              <th className="text-left px-3 py-2 text-[10px] font-mono text-muted-foreground font-medium">Event</th>
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium">Status</th>
              {columns.map(col => (
                <th key={col.key} className="text-left px-2 py-2">
                  <button onClick={() => toggleSort(col.key)}
                    className={cn('flex items-center gap-0.5 text-[10px] font-mono font-medium transition-colors',
                      sortKey === col.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}>
                    {col.label}
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </button>
                </th>
              ))}
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium">TTF</th>
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium">Ready</th>
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium">Trend</th>
              <th className="text-left px-2 py-2 text-[10px] font-mono text-muted-foreground font-medium w-8"></th>
            </tr>
          </thead>
          <tbody>
            {displayEvents.map((event, i) => {
              const isPinned = pinned.has(event.id);
              const isComparing = comparing.has(event.id);
              return (
                <motion.tr key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onSelectEvent(event)}
                  className={cn(
                    'border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors',
                    isPinned && 'bg-primary/5',
                    isComparing && showCompare && 'bg-accent/10'
                  )}
                >
                  <td className="px-2 py-2">
                    <button onClick={(e) => togglePin(event.id, e)}
                      className={cn('p-0.5 rounded transition-colors', isPinned ? 'text-primary' : 'text-muted-foreground/30 hover:text-muted-foreground')}>
                      {isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                    </button>
                  </td>
                  <td className="px-2 py-2 font-mono text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-foreground text-[11px]">{event.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{event.region}</div>
                  </td>
                  <td className="px-2 py-2"><SeverityBadge severity={event.status} /></td>
                  <td className="px-2 py-2"><ProbabilityPill value={event.probability} size="sm" /></td>
                  <td className="px-2 py-2 font-mono text-foreground">{event.severity}/100</td>
                  <td className="px-2 py-2 font-mono text-foreground">{(event.exposure / 1000).toFixed(0)}K</td>
                  <td className="px-2 py-2 font-mono text-risk-high">{event.cascadePotential}%</td>
                  <td className="px-2 py-2"><ConfidenceMeter level={event.confidence} /></td>
                  <td className="px-2 py-2 font-mono text-muted-foreground text-[10px]">{event.timeToFailure}</td>
                  <td className="px-2 py-2">
                    <span className={cn('text-[9px] font-mono px-1.5 py-0.5 rounded border', readinessConfig[event.interventionReadiness].className)}>
                      {readinessConfig[event.interventionReadiness].label}
                    </span>
                  </td>
                  <td className="px-2 py-2"><TrendChip direction={event.velocity} /></td>
                  <td className="px-2 py-2">
                    <button onClick={(e) => toggleCompare(event.id, e)}
                      className={cn('p-0.5 rounded transition-colors', isComparing ? 'text-accent' : 'text-muted-foreground/30 hover:text-muted-foreground')}>
                      <GitCompare className="w-3 h-3" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
