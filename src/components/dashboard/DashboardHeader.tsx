import { useState } from 'react';
import { Shield, Radio, Filter, LogOut, Settings, Download, ShieldAlert, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { SettingsPanel } from './SettingsPanel';
import { AdminPanel } from './AdminPanel';
import { ExportPanel } from './ExportPanel';
import { cn } from '@/lib/utils';

const timeRanges = ['Now', '24h', '7d', '30d'] as const;
const geoScopes = ['Global', 'Country', 'County', 'District', 'Settlement'] as const;
const sectorFilters = ['All', 'Flood', 'Finance', 'Health', 'Energy', 'Food', 'Logistics'] as const;
const scenarioModes = ['Live Risk', 'Forecast', 'Simulated', 'Historical'] as const;
const confidenceFilters = ['All', 'Medium+', 'High Only'] as const;

export const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { config, saveConfig } = useDashboardConfig();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [geoScope, setGeoScope] = useState<string>('Global');
  const [confFilter, setConfFilter] = useState<string>('All');

  const update = (partial: Partial<typeof config>) => {
    saveConfig({ ...config, ...partial });
  };

  return (
    <>
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">ATLAS SANCTUM</h1>
              <p className="text-[10px] font-mono text-muted-foreground tracking-wider">RISK & FAILURE PROBABILITY</p>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
            {/* Time Range */}
            <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
              {timeRanges.map(t => (
                <button key={t} onClick={() => update({ timeRange: t })}
                  className={cn('px-2 py-1 text-[10px] font-mono rounded-sm transition-all',
                    config.timeRange === t ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {t}
                </button>
              ))}
            </div>

            {/* Geographic Scope */}
            <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground ml-1" />
              {geoScopes.map(g => (
                <button key={g} onClick={() => setGeoScope(g)}
                  className={cn('px-1.5 py-1 text-[10px] font-mono rounded-sm transition-all',
                    geoScope === g ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {g}
                </button>
              ))}
            </div>

            {/* Sector */}
            <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
              {sectorFilters.map(s => (
                <button key={s} onClick={() => update({ sector: s })}
                  className={cn('px-1.5 py-1 text-[10px] font-mono rounded-sm transition-all',
                    config.sector === s ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {s}
                </button>
              ))}
            </div>

            {/* Scenario */}
            <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
              {scenarioModes.map(m => (
                <button key={m} onClick={() => update({ scenarioMode: m })}
                  className={cn('px-1.5 py-1 text-[10px] font-mono rounded-sm transition-all',
                    config.scenarioMode === m ? (m === 'Live Risk' ? 'bg-risk-critical text-foreground' : 'bg-primary text-primary-foreground') : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {m === 'Live Risk' && <Radio className="w-3 h-3 mr-0.5 inline" />}
                  {m}
                </button>
              ))}
            </div>

            {/* Confidence filter */}
            <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5">
              <Filter className="w-3 h-3 text-muted-foreground ml-1" />
              {confidenceFilters.map(c => (
                <button key={c} onClick={() => {
                  setConfFilter(c);
                  update({ highConfOnly: c === 'High Only' });
                }}
                  className={cn('px-1.5 py-1 text-[10px] font-mono rounded-sm transition-all',
                    confFilter === c ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
                  )}>
                  {c}
                </button>
              ))}
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-risk-stable">
              <span className="w-1.5 h-1.5 rounded-full bg-risk-stable animate-pulse" />
              LIVE
            </div>

            {/* Export */}
            <button onClick={() => setExportOpen(true)}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Export data">
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Settings */}
            <button onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Admin */}
            {isAdmin && (
              <button onClick={() => setAdminOpen(true)}
                className="p-1.5 rounded-md hover:bg-secondary text-destructive hover:text-destructive transition-colors"
                title="Admin panel">
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Sign out */}
            {user && (
              <button onClick={signOut}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
                <LogOut className="w-3 h-3" />
                Out
              </button>
            )}
          </div>
        </div>
      </header>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
      <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  );
};
