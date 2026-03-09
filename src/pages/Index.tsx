import { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RiskOverviewCards } from '@/components/dashboard/RiskOverviewCards';
import { MapboxRiskMap } from '@/components/dashboard/MapboxRiskMap';
import { RiskDetailDrawer } from '@/components/dashboard/RiskDetailDrawer';
import { CascadeGraphPanel } from '@/components/dashboard/CascadeGraphPanel';
import { FragilityIndexPanel } from '@/components/dashboard/FragilityIndexPanel';
import { RiskRankingTable } from '@/components/dashboard/RiskRankingTable';
import { SimulationForecastPanel } from '@/components/dashboard/SimulationForecastPanel';
import { SimulationPlayback } from '@/components/dashboard/SimulationPlayback';
import { CounterfactualComparison } from '@/components/dashboard/CounterfactualComparison';
import { ContributingFactorsPanel } from '@/components/dashboard/ContributingFactorsPanel';
import { DataSourceHealthBar } from '@/components/dashboard/DataSourceHealthBar';
import { LiveStreamIndicator } from '@/components/dashboard/LiveStreamIndicator';
import { LiveEventFeed } from '@/components/dashboard/LiveEventFeed';
import { CriticalAlertBanner } from '@/components/dashboard/CriticalAlertBanner';
import { HistoricalTimeline } from '@/components/dashboard/HistoricalTimeline';
import { useRealtimeRisks } from '@/hooks/useRealtimeRisks';
import { useTeamNotifications } from '@/hooks/useTeamNotifications';
import { supabase } from '@/integrations/supabase/client';
import { mockRiskEvents, type RiskEvent } from '@/data/mockRiskData';

const MAPBOX_TOKEN = '__MAPBOX_TOKEN__';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const { events: liveEvents, status: streamStatus } = useRealtimeRisks();
  useTeamNotifications();

  const handleTriggerSimulation = useCallback(async () => {
    setIsSimulating(true);
    try {
      await supabase.functions.invoke('simulate-risk-stream');
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setTimeout(() => setIsSimulating(false), 1000);
    }
  }, []);

  const handleSelectZone = useCallback((zoneId: string) => {
    const match = mockRiskEvents.find(e => e.id === zoneId) || mockRiskEvents[0];
    setSelectedEvent(match);
  }, []);

  const handleSelectEvent = useCallback((event: RiskEvent) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Global Control Bar */}
      <DashboardHeader />

      {/* 2. Failure Outlook Summary Cards */}
      <RiskOverviewCards liveEvents={liveEvents} />

      {/* 13. Alert Stream */}
      <CriticalAlertBanner liveEvents={liveEvents} />

      {/* 3. Risk Heat Map + 5. Simulation Forecast */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {MAPBOX_TOKEN !== '__MAPBOX_TOKEN__' ? (
            <MapboxRiskMap
              mapboxToken={MAPBOX_TOKEN}
              liveEvents={liveEvents}
              onSelectZone={handleSelectZone}
            />
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-xs font-mono text-muted-foreground mb-2">Mapbox GL map requires a token</p>
              <p className="text-[10px] font-mono text-muted-foreground">Share your Mapbox public token (pk.*) to activate the geospatial view</p>
            </div>
          )}
          <SimulationForecastPanel />
        </div>

        {/* 6. Cascading Failure Graph + 7. System Fragility Index */}
        <div className="lg:col-span-2 space-y-4">
          <CascadeGraphPanel />
          <FragilityIndexPanel />
        </div>
      </div>

      {/* 9. Contributing Factors + 10. Intervention Leverage */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ContributingFactorsPanel />
        <CounterfactualComparison />
      </div>

      {/* 12. Timeline Scrubber / Simulation Playback */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimulationPlayback />
        <HistoricalTimeline />
      </div>

      {/* 8. Ranked Risk Table */}
      <div className="px-4 pb-4">
        <RiskRankingTable onSelectEvent={handleSelectEvent} />
      </div>

      {/* 13. Live Streaming + Alert Feed */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LiveStreamIndicator
          status={streamStatus}
          onTriggerSimulation={handleTriggerSimulation}
          isSimulating={isSimulating}
        />
        <div className="lg:col-span-2">
          <LiveEventFeed events={liveEvents} />
        </div>
      </div>

      {/* 11. Data Confidence & Source Health */}
      <div className="px-4 pb-6">
        <DataSourceHealthBar />
      </div>

      {/* 4. Risk Detail Drawer */}
      <RiskDetailDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default Index;
