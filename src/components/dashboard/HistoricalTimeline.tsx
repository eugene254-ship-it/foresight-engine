import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveRiskEvent } from '@/hooks/useRealtimeRisks';
import { supabase } from '@/integrations/supabase/client';

interface HistoryPoint {
  timestamp: string;
  events: { event_key: string; name: string; probability: number; severity: number }[];
}

export const HistoricalTimeline = () => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch historical snapshots from DB
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('live_risk_events')
        .select('event_key, name, probability, severity, created_at')
        .order('created_at', { ascending: true })
        .limit(500);

      if (!data || data.length === 0) return;

      // Group by ~10s windows
      const windows = new Map<string, HistoryPoint>();
      for (const row of data) {
        const ts = new Date(row.created_at);
        const windowKey = new Date(Math.floor(ts.getTime() / 10000) * 10000).toISOString();
        if (!windows.has(windowKey)) {
          windows.set(windowKey, { timestamp: windowKey, events: [] });
        }
        windows.get(windowKey)!.events.push({
          event_key: row.event_key,
          name: row.name,
          probability: Number(row.probability),
          severity: Number(row.severity),
        });
      }

      const sorted = Array.from(windows.values()).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setHistory(sorted);
      setCurrentIdx(sorted.length - 1);
    };
    fetchHistory();
  }, []);

  // Playback logic
  useEffect(() => {
    if (isPlaying && history.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx(prev => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, history.length]);

  const currentPoint = history[currentIdx];

  // Build cumulative event state up to current index
  const cumulativeState = useMemo(() => {
    if (history.length === 0) return new Map<string, { name: string; probability: number; severity: number; points: number[] }>();
    const state = new Map<string, { name: string; probability: number; severity: number; points: number[] }>();
    for (let i = 0; i <= currentIdx; i++) {
      for (const ev of history[i].events) {
        if (!state.has(ev.event_key)) {
          state.set(ev.event_key, { name: ev.name, probability: ev.probability, severity: ev.severity, points: [] });
        }
        const s = state.get(ev.event_key)!;
        s.probability = ev.probability;
        s.severity = ev.severity;
        s.points.push(ev.probability);
      }
    }
    return state;
  }, [history, currentIdx]);

  if (history.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Historical Timeline</h3>
        </div>
        <p className="text-xs font-mono text-muted-foreground text-center py-6">
          No historical data yet. Start streaming to build timeline.
        </p>
      </div>
    );
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Historical Timeline — Risk Evolution
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">Speed:</span>
          {[0.5, 1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={cn('px-1.5 py-0.5 text-[10px] font-mono rounded transition-all',
                speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Controls + scrubber */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button onClick={() => { setCurrentIdx(0); setIsPlaying(false); }}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={history.length - 1}
            value={currentIdx}
            onChange={e => { setCurrentIdx(parseInt(e.target.value)); setIsPlaying(false); }}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
          />
          <div className="absolute top-0 left-0 h-1.5 rounded-full bg-primary/40 pointer-events-none"
            style={{ width: `${(currentIdx / Math.max(history.length - 1, 1)) * 100}%` }} />
        </div>

        <span className="text-xs font-mono text-foreground tabular-nums min-w-[80px] text-right">
          {currentPoint ? formatTime(currentPoint.timestamp) : '--:--:--'}
        </span>
      </div>

      {/* Sparkline-style probability tracks per event */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {Array.from(cumulativeState.entries()).map(([key, data]) => {
          const maxP = Math.max(...data.points, 1);
          const isCritical = data.probability >= 75;
          return (
            <motion.div key={key}
              layout
              className={cn(
                'flex items-center gap-3 p-2 rounded-md border transition-colors',
                isCritical ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 bg-secondary/20'
              )}>
              <div className="min-w-[120px]">
                <div className="text-[10px] font-mono font-medium text-foreground truncate">{data.name}</div>
                <div className={cn('text-xs font-mono font-bold tabular-nums', isCritical ? 'text-destructive' : 'text-primary')}>
                  {data.probability.toFixed(0)}%
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="flex-1 h-6 flex items-end gap-px">
                {data.points.slice(-30).map((p, i) => (
                  <div key={i}
                    className={cn('flex-1 rounded-t-sm min-w-[2px] transition-all',
                      p >= 75 ? 'bg-destructive/70' : p >= 50 ? 'bg-risk-high/60' : 'bg-primary/40'
                    )}
                    style={{ height: `${(p / 100) * 100}%` }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <TrendingUp className={cn('w-3 h-3', 
                  data.points.length > 1 && data.points[data.points.length - 1] > data.points[data.points.length - 2]
                    ? 'text-destructive' : 'text-risk-stable'
                )} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer: snapshot info */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        <span>Snapshot {currentIdx + 1} of {history.length}</span>
        <span>{cumulativeState.size} tracked risks</span>
      </div>
    </div>
  );
};
