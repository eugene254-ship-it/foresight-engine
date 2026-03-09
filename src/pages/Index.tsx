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
    // Find a matching risk event for the zone
    const match = mockRiskEvents.find(e => e.id === zoneId) || mockRiskEvents[0];
    setSelectedEvent(match);
  }, []);

  const handleSelectEvent = useCallback((event: RiskEvent) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Hero: Failure Outlook Cards — connected to live data */}
      <RiskOverviewCards liveEvents={liveEvents} />

      {/* Critical Alert Banner */}
      <CriticalAlertBanner liveEvents={liveEvents} />

      {/* Main Content: Map + Detail */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Map (3 cols) */}
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

        {/* Right: Cascade + Fragility (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <CascadeGraphPanel />
          <FragilityIndexPanel />
        </div>
      </div>

      {/* Simulation Playback + Counterfactual */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimulationPlayback />
        <CounterfactualComparison />
      </div>

      {/* Historical Timeline */}
      <div className="px-4 pb-4">
        <HistoricalTimeline />
      </div>

      {/* Risk Ranking Table */}
      <div className="px-4 pb-4">
        <RiskRankingTable onSelectEvent={handleSelectEvent} />
      </div>

      {/* Live Streaming Section */}
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

      {/* Data Source Health */}
      <div className="px-4 pb-6">
        <DataSourceHealthBar />
      </div>

      {/* Detail Drawer */}
      <RiskDetailDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};

export default Index;
