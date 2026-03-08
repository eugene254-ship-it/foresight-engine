import { useState, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RiskOverviewCards } from '@/components/dashboard/RiskOverviewCards';
import { RiskMapPanel } from '@/components/dashboard/RiskMapPanel';
import { RiskDetailDrawer } from '@/components/dashboard/RiskDetailDrawer';
import { CascadeGraphPanel } from '@/components/dashboard/CascadeGraphPanel';
import { FragilityIndexPanel } from '@/components/dashboard/FragilityIndexPanel';
import { RiskRankingTable } from '@/components/dashboard/RiskRankingTable';
import { SimulationForecastPanel } from '@/components/dashboard/SimulationForecastPanel';
import { SimulationPlayback } from '@/components/dashboard/SimulationPlayback';
import { CounterfactualComparison } from '@/components/dashboard/CounterfactualComparison';
import { DataSourceHealthBar } from '@/components/dashboard/DataSourceHealthBar';
import { mockRiskEvents, type RiskEvent, type MapZone } from '@/data/mockRiskData';

const Index = () => {
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);

  const handleSelectZone = useCallback((zone: MapZone) => {
    // Find a matching risk event for the zone
    const match = mockRiskEvents.find(e =>
      e.region.toLowerCase().includes(zone.name.toLowerCase().split(' ')[0]) ||
      zone.topRisk.toLowerCase().includes(e.sector.toLowerCase())
    );
    setSelectedEvent(match || mockRiskEvents[0]);
  }, []);

  const handleSelectEvent = useCallback((event: RiskEvent) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Hero: Failure Outlook Cards */}
      <RiskOverviewCards />

      {/* Main Content: Map + Detail */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Map (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <RiskMapPanel
            onSelectZone={handleSelectZone}
            selectedZoneId={undefined}
          />
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

      {/* Risk Ranking Table */}
      <div className="px-4 pb-4">
        <RiskRankingTable onSelectEvent={handleSelectEvent} />
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
