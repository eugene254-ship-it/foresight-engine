import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockMapZones, type MapZone } from '@/data/mockRiskData';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter';
import { TrendChip } from '@/components/shared/TrendChip';
import { cn } from '@/lib/utils';

const severityBg: Record<string, string> = {
  critical: 'bg-risk-critical/30 border-risk-critical/50 hover:bg-risk-critical/40',
  high: 'bg-risk-high/20 border-risk-high/40 hover:bg-risk-high/30',
  medium: 'bg-risk-medium/15 border-risk-medium/30 hover:bg-risk-medium/25',
  low: 'bg-risk-low/10 border-risk-low/20 hover:bg-risk-low/20',
  stable: 'bg-risk-stable/10 border-risk-stable/20 hover:bg-risk-stable/20',
};

interface Props {
  onSelectZone: (zone: MapZone) => void;
  selectedZoneId?: string;
}

export const RiskMapPanel = ({ onSelectZone, selectedZoneId }: Props) => {
  const [hoveredZone, setHoveredZone] = useState<MapZone | null>(null);

  const rows = 3;
  const cols = 6;

  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      mockMapZones.find(z => z.row === r + 1 && z.col === c + 1) || null
    )
  );

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Risk Heat Map — Nairobi Metro</h3>
        <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-risk-critical" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-risk-high" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-risk-medium" /> Watch</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-risk-low" /> Low</span>
        </div>
      </div>

      <div className="relative">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {grid.flat().map((zone, i) => (
            <div key={i} className="aspect-square relative">
              {zone ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectZone(zone)}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className={cn(
                    'w-full h-full rounded-md border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer',
                    severityBg[zone.severity],
                    selectedZoneId === zone.id && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                    zone.severity === 'critical' && 'animate-pulse-risk'
                  )}
                >
                  <span className="text-[9px] font-mono font-semibold text-foreground leading-tight text-center px-1">{zone.name}</span>
                  <span className={cn('text-sm font-mono font-bold',
                    zone.severity === 'critical' ? 'text-risk-critical' :
                    zone.severity === 'high' ? 'text-risk-high' :
                    zone.severity === 'medium' ? 'text-risk-medium' : 'text-risk-low'
                  )}>{zone.riskScore}</span>
                </motion.button>
              ) : (
                <div className="w-full h-full rounded-md bg-muted/30 border border-border/30" />
              )}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredZone && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover border border-border rounded-lg p-3 shadow-lg z-10 min-w-[200px]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground">{hoveredZone.name}</span>
                <SeverityBadge severity={hoveredZone.severity} />
              </div>
              <div className="space-y-1 text-[10px] font-mono text-muted-foreground">
                <div className="flex justify-between"><span>Risk Score</span><span className="text-foreground">{hoveredZone.riskScore}/100</span></div>
                <div className="flex justify-between"><span>Population</span><span className="text-foreground">{(hoveredZone.population / 1000).toFixed(0)}K</span></div>
                <div className="flex justify-between"><span>Top Risk</span><span className="text-foreground">{hoveredZone.topRisk}</span></div>
                <div className="flex justify-between items-center"><span>Confidence</span><ConfidenceMeter level={hoveredZone.confidence} /></div>
                <div className="flex justify-between items-center"><span>Trend</span><TrendChip direction={hoveredZone.trend} /></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
