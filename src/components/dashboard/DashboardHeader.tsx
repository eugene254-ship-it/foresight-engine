import { useState } from 'react';
import { Shield, Radio, Clock, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const timeRanges = ['Now', '24h', '7d', '30d'] as const;
const geoFilters = ['Global', 'Country', 'County', 'Settlement'] as const;
const sectorFilters = ['All', 'Flood', 'Finance', 'Health', 'Energy', 'Food', 'Logistics'] as const;
const scenarioModes = ['Live Risk', 'Simulated', 'Historical'] as const;

export const DashboardHeader = () => {
  const [timeRange, setTimeRange] = useState<string>('Now');
  const [sector, setSector] = useState<string>('All');
  const [scenario, setScenario] = useState<string>('Live Risk');
  const [highConfOnly, setHighConfOnly] = useState(false);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">ATLAS SANCTUM</h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-wider">RISK & FAILURE PROBABILITY</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap flex-1 justify-end">
          {/* Time Range */}
          <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
            {timeRanges.map(t => (
              <button key={t} onClick={() => setTimeRange(t)}
                className={cn('px-2.5 py-1 text-[11px] font-mono rounded-sm transition-all',
                  timeRange === t ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                )}>
                {t}
              </button>
            ))}
          </div>

          {/* Sector */}
          <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
            {sectorFilters.map(s => (
              <button key={s} onClick={() => setSector(s)}
                className={cn('px-2 py-1 text-[11px] font-mono rounded-sm transition-all',
                  sector === s ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                )}>
                {s}
              </button>
            ))}
          </div>

          {/* Scenario */}
          <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
            {scenarioModes.map(m => (
              <button key={m} onClick={() => setScenario(m)}
                className={cn('px-2 py-1 text-[11px] font-mono rounded-sm transition-all',
                  scenario === m ? (m === 'Live Risk' ? 'bg-risk-critical text-foreground' : 'bg-primary text-primary-foreground') : 'text-secondary-foreground hover:text-foreground'
                )}>
                {m === 'Live Risk' && <Radio className="w-3 h-3 mr-1 inline" />}
                {m}
              </button>
            ))}
          </div>

          {/* Confidence toggle */}
          <button onClick={() => setHighConfOnly(!highConfOnly)}
            className={cn('px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all',
              highConfOnly ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            )}>
            <Filter className="w-3 h-3 mr-1 inline" />
            {highConfOnly ? 'High Conf' : 'All Signals'}
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-risk-stable">
            <span className="w-1.5 h-1.5 rounded-full bg-risk-stable animate-pulse" />
            LIVE
          </div>
        </div>
      </div>
    </header>
  );
};
