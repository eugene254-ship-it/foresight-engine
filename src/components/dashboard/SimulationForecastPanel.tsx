import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { mockForecastData } from '@/data/mockRiskData';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const scenarios = ['Optimistic', 'Baseline', 'Worst Case'] as const;

export const SimulationForecastPanel = () => {
  const [activeScenario, setActiveScenario] = useState<string>('Baseline');

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Prediction Forecast — 30 Day Risk Trajectory</h3>
        <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
          {scenarios.map(s => (
            <button key={s} onClick={() => setActiveScenario(s)}
              className={cn('px-2 py-1 text-[10px] font-mono rounded-sm transition-all',
                activeScenario === s ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground hover:text-foreground'
              )}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockForecastData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(0, 85%, 55%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(190, 80%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(190, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(220, 15%, 15%)" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'hsl(215, 12%, 50%)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 15%, 18%)', borderRadius: 8, fontSize: 11, fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: 'hsl(210, 20%, 90%)' }}
              itemStyle={{ color: 'hsl(210, 20%, 70%)' }}
            />

            {/* Uncertainty band */}
            <Area type="monotone" dataKey="upperBand" stroke="none" fill="url(#bandGrad)" />
            <Area type="monotone" dataKey="lowerBand" stroke="none" fill="transparent" />

            {/* Scenario lines */}
            <Area type="monotone" dataKey="worstCase" stroke="hsl(0, 85%, 55%)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false}
              hide={activeScenario === 'Optimistic'} />
            <Area type="monotone" dataKey="baseline" stroke="hsl(190, 80%, 50%)" strokeWidth={2} fill="url(#baselineGrad)" dot={false} />
            <Area type="monotone" dataKey="optimistic" stroke="hsl(160, 60%, 45%)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false}
              hide={activeScenario === 'Worst Case'} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 text-[9px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-cyan inline-block" /> Baseline</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-red inline-block opacity-70" style={{ borderTop: '1px dashed' }} /> Worst Case</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-green inline-block opacity-70" style={{ borderTop: '1px dashed' }} /> Optimistic</span>
        <span className="flex items-center gap-1"><span className="w-6 h-2 rounded-sm bg-chart-red/10 inline-block border border-chart-red/20" /> Uncertainty Band</span>
      </div>
    </div>
  );
};
