import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Generate time-series cascade propagation data
const generatePropagationFrames = (totalFrames: number) => {
  const nodes = [
    { id: 'n1', label: 'Heavy Rainfall', activationTime: 0, peakStress: 0.92 },
    { id: 'n2', label: 'Drainage Failure', activationTime: 3, peakStress: 0.78 },
    { id: 'n3', label: 'Road Flooding', activationTime: 4, peakStress: 0.73 },
    { id: 'n4', label: 'Clinic Access Loss', activationTime: 7, peakStress: 0.65 },
    { id: 'n5', label: 'Vaccine Spoilage', activationTime: 10, peakStress: 0.55 },
    { id: 'n6', label: 'Food Delivery Halt', activationTime: 8, peakStress: 0.58 },
    { id: 'n7', label: 'Power Disruption', activationTime: 6, peakStress: 0.68 },
    { id: 'n8', label: 'Outbreak Risk', activationTime: 14, peakStress: 0.45 },
    { id: 'n9', label: 'Market Disruption', activationTime: 12, peakStress: 0.38 },
    { id: 'n10', label: 'Water Pump Failure', activationTime: 9, peakStress: 0.52 },
  ];

  return Array.from({ length: totalFrames }, (_, frame) => {
    const hour = (frame / totalFrames) * 48; // 48-hour simulation
    return {
      hour: Math.round(hour),
      frame,
      nodes: nodes.map(node => {
        const timeSinceActivation = hour - node.activationTime * (48 / 18);
        let stress = 0;
        if (timeSinceActivation > 0) {
          // Sigmoid activation curve
          stress = node.peakStress * (1 / (1 + Math.exp(-0.5 * (timeSinceActivation - 4))));
        }
        return { ...node, currentStress: Math.min(stress, node.peakStress) };
      }),
      overallRisk: Math.min(95, 15 + frame * (80 / totalFrames) + Math.sin(frame / 5) * 5),
      populationExposed: Math.round(Math.min(2400000, 180000 + frame * (2200000 / totalFrames))),
      activeSystems: nodes.filter(n => {
        const t = hour - n.activationTime * (48 / 18);
        return t > 2;
      }).length,
    };
  });
};

const TOTAL_FRAMES = 60;
const propagationData = generatePropagationFrames(TOTAL_FRAMES);

export const SimulationPlayback = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const frameData = propagationData[currentFrame];

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
  }, []);

  const skipToEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(TOTAL_FRAMES - 1);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= TOTAL_FRAMES - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 150 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  const getRiskColor = (stress: number) => {
    if (stress >= 0.7) return 'hsl(0, 85%, 55%)';
    if (stress >= 0.5) return 'hsl(25, 95%, 55%)';
    if (stress >= 0.3) return 'hsl(45, 95%, 55%)';
    if (stress > 0) return 'hsl(190, 80%, 50%)';
    return 'hsl(220, 15%, 25%)';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Simulation Playback — Cascade Propagation</h3>
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

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button onClick={reset} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={isPlaying ? pause : play}
            className="p-2 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition-colors">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={skipToEnd} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline scrubber */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={TOTAL_FRAMES - 1}
            value={currentFrame}
            onChange={e => { setCurrentFrame(parseInt(e.target.value)); setIsPlaying(false); }}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
          />
          {/* Progress fill */}
          <div className="absolute top-0 left-0 h-1.5 rounded-full bg-primary/40 pointer-events-none"
            style={{ width: `${(currentFrame / (TOTAL_FRAMES - 1)) * 100}%` }} />
        </div>

        <span className="text-xs font-mono text-foreground tabular-nums min-w-[60px] text-right">
          T+{frameData.hour}h
        </span>
      </div>

      {/* Propagation visualization */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {frameData.nodes.map(node => (
          <motion.div key={node.id}
            animate={{ 
              borderColor: getRiskColor(node.currentStress),
              backgroundColor: `${getRiskColor(node.currentStress)}10`,
            }}
            transition={{ duration: 0.15 }}
            className="rounded-md border p-2 text-center"
          >
            <div className="text-[9px] font-mono text-muted-foreground leading-tight mb-1 truncate">{node.label}</div>
            <motion.div
              animate={{ color: getRiskColor(node.currentStress) }}
              className="text-sm font-mono font-bold tabular-nums"
            >
              {node.currentStress > 0.01 ? `${(node.currentStress * 100).toFixed(0)}%` : '—'}
            </motion.div>
            {/* Mini stress bar */}
            <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
              <motion.div
                animate={{ width: `${node.currentStress * 100}%` }}
                transition={{ duration: 0.15 }}
                className="h-full rounded-full"
                style={{ backgroundColor: getRiskColor(node.currentStress) }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary/30 rounded-md p-2 text-center">
          <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Overall Risk</div>
          <motion.div
            animate={{ color: frameData.overallRisk >= 70 ? 'hsl(0, 85%, 55%)' : frameData.overallRisk >= 40 ? 'hsl(25, 95%, 55%)' : 'hsl(190, 80%, 50%)' }}
            className="text-lg font-mono font-bold tabular-nums"
          >
            {frameData.overallRisk.toFixed(0)}%
          </motion.div>
        </div>
        <div className="bg-secondary/30 rounded-md p-2 text-center">
          <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Pop. Exposed</div>
          <div className="text-lg font-mono font-bold text-foreground tabular-nums">
            {(frameData.populationExposed / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="bg-secondary/30 rounded-md p-2 text-center">
          <div className="text-[9px] font-mono text-muted-foreground uppercase mb-0.5">Active Cascades</div>
          <div className="text-lg font-mono font-bold text-risk-high tabular-nums">
            {frameData.activeSystems}/10
          </div>
        </div>
      </div>
    </div>
  );
};
