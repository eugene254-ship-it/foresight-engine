import { useState } from 'react';
import { Shield, Radio, Filter, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { SettingsPanel } from './SettingsPanel';
import { cn } from '@/lib/utils';

const timeRanges = ['Now', '24h', '7d', '30d'] as const;
const sectorFilters = ['All', 'Flood', 'Finance', 'Health', 'Energy', 'Food', 'Logistics'] as const;
const scenarioModes = ['Live Risk', 'Simulated', 'Historical'] as const;

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const { config, saveConfig } = useDashboardConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const update = (partial: Partial<typeof config>) => {
    saveConfig({ ...config, ...partial });
  };

  return (
    <>
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
                <button key={t} onClick={() => update({ timeRange: t })}
                  className={cn('px-2.5 py-1 text-[11px] font-mono rounded-sm transition-all',
                    config.timeRange === t ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {t}
                </button>
              ))}
            </div>

            {/* Sector */}
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
              {sectorFilters.map(s => (
                <button key={s} onClick={() => update({ sector: s })}
                  className={cn('px-2 py-1 text-[11px] font-mono rounded-sm transition-all',
                    config.sector === s ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {s}
                </button>
              ))}
            </div>

            {/* Scenario */}
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
              {scenarioModes.map(m => (
                <button key={m} onClick={() => update({ scenarioMode: m })}
                  className={cn('px-2 py-1 text-[11px] font-mono rounded-sm transition-all',
                    config.scenarioMode === m ? (m === 'Live Risk' ? 'bg-risk-critical text-foreground' : 'bg-primary text-primary-foreground') : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {m === 'Live Risk' && <Radio className="w-3 h-3 mr-1 inline" />}
                  {m}
                </button>
              ))}
            </div>

            {/* Confidence toggle */}
            <button onClick={() => update({ highConfOnly: !config.highConfOnly })}
              className={cn('px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all',
                config.highConfOnly ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              )}>
              <Filter className="w-3 h-3 mr-1 inline" />
              {config.highConfOnly ? 'High Conf' : 'All Signals'}
            </button>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-risk-stable">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-stable animate-pulse" />
              LIVE
            </div>

            {/* Settings */}
            <button onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Sign out */}
            {user && (
              <button onClick={signOut}
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};
