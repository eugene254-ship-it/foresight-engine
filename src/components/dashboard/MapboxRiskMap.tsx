import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { SeverityBadge } from '@/components/shared/SeverityBadge';
import type { RiskSeverity, ConfidenceLevel, TrendDirection } from '@/data/mockRiskData';
import type { LiveRiskEvent } from '@/hooks/useRealtimeRisks';

// Nairobi risk zones with real coordinates
const riskZones = [
  { id: 'z1', name: 'Nairobi Central', lat: -1.2864, lng: 36.8172, riskScore: 82, severity: 'critical' as RiskSeverity, population: 1200000, topRisk: 'Grid Overload', eventKey: 'r2' },
  { id: 'z2', name: 'Eastlands', lat: -1.2850, lng: 36.8600, riskScore: 91, severity: 'critical' as RiskSeverity, population: 840000, topRisk: 'Flooding', eventKey: 'r1' },
  { id: 'z3', name: 'Kibera', lat: -1.3133, lng: 36.7876, riskScore: 68, severity: 'high' as RiskSeverity, population: 320000, topRisk: 'Vaccine Supply', eventKey: 'r3' },
  { id: 'z4', name: 'Westlands', lat: -1.2672, lng: 36.8058, riskScore: 35, severity: 'low' as RiskSeverity, population: 180000, topRisk: 'None Critical', eventKey: null },
  { id: 'z5', name: 'Industrial Area', lat: -1.3050, lng: 36.8500, riskScore: 74, severity: 'high' as RiskSeverity, population: 95000, topRisk: 'Grid Cascade', eventKey: 'r2' },
  { id: 'z6', name: 'Kasarani', lat: -1.2300, lng: 36.8900, riskScore: 56, severity: 'medium' as RiskSeverity, population: 520000, topRisk: 'Road Degradation', eventKey: 'r5' },
  { id: 'z7', name: "Lang'ata", lat: -1.3500, lng: 36.7600, riskScore: 42, severity: 'medium' as RiskSeverity, population: 280000, topRisk: 'Supply Chain', eventKey: null },
  { id: 'z8', name: 'Embakasi', lat: -1.3200, lng: 36.9100, riskScore: 65, severity: 'high' as RiskSeverity, population: 680000, topRisk: 'Flooding', eventKey: 'r1' },
  { id: 'z9', name: 'Dagoretti', lat: -1.2900, lng: 36.7400, riskScore: 28, severity: 'low' as RiskSeverity, population: 350000, topRisk: 'None Critical', eventKey: null },
  { id: 'z10', name: 'Ruaraka', lat: -1.2400, lng: 36.8600, riskScore: 48, severity: 'medium' as RiskSeverity, population: 410000, topRisk: 'Grid Stress', eventKey: 'r2' },
  { id: 'z11', name: 'Makadara', lat: -1.2950, lng: 36.8500, riskScore: 58, severity: 'medium' as RiskSeverity, population: 290000, topRisk: 'Infrastructure', eventKey: null },
  { id: 'z12', name: 'Starehe', lat: -1.2700, lng: 36.8300, riskScore: 44, severity: 'medium' as RiskSeverity, population: 210000, topRisk: 'Finance Stress', eventKey: null },
  { id: 'z13', name: 'Mathare', lat: -1.2600, lng: 36.8600, riskScore: 79, severity: 'critical' as RiskSeverity, population: 390000, topRisk: 'Flooding', eventKey: 'r1' },
  { id: 'z14', name: 'Kayole', lat: -1.2700, lng: 36.9100, riskScore: 71, severity: 'high' as RiskSeverity, population: 450000, topRisk: 'Road Network', eventKey: 'r5' },
  { id: 'z15', name: 'Pipeline', lat: -1.3100, lng: 36.8800, riskScore: 61, severity: 'high' as RiskSeverity, population: 260000, topRisk: 'Grid Cascade', eventKey: 'r2' },
];

const severityColors: Record<RiskSeverity, string> = {
  critical: '#e63946',
  high: '#f77f00',
  medium: '#f4c430',
  low: '#29b6f6',
  stable: '#4caf86',
};

interface Props {
  mapboxToken: string;
  liveEvents?: LiveRiskEvent[];
  onSelectZone?: (zoneId: string) => void;
}

export const MapboxRiskMap = ({ mapboxToken, liveEvents = [], onSelectZone }: Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Build live data lookup
  const liveDataMap = new Map<string, LiveRiskEvent>();
  for (const e of liveEvents) {
    const existing = liveDataMap.get(e.event_key);
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      liveDataMap.set(e.event_key, e);
    }
  }

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [36.8219, -1.2921],
      zoom: 11.5,
      pitch: 30,
      bearing: -10,
      antialias: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    map.current.on('load', () => {
      updateMarkers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update markers when live data changes
  useEffect(() => {
    if (map.current?.loaded()) {
      updateMarkers();
    }
  }, [liveEvents]);

  function updateMarkers() {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    riskZones.forEach(zone => {
      // Get live data if available
      const liveEvent = zone.eventKey ? liveDataMap.get(zone.eventKey) : null;
      const riskScore = liveEvent ? Math.round(Number(liveEvent.severity)) : zone.riskScore;
      const severity = liveEvent
        ? (Number(liveEvent.severity) >= 80 ? 'critical' : Number(liveEvent.severity) >= 60 ? 'high' : Number(liveEvent.severity) >= 40 ? 'medium' : 'low') as RiskSeverity
        : zone.severity;
      const color = severityColors[severity];

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'risk-marker';
      const size = 24 + (riskScore / 100) * 28;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = `${color}33`;
      el.style.border = `2px solid ${color}`;
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '10px';
      el.style.fontFamily = "'JetBrains Mono', monospace";
      el.style.fontWeight = '700';
      el.style.color = color;
      el.style.transition = 'all 0.3s ease';
      el.textContent = String(riskScore);

      if (severity === 'critical') {
        el.style.animation = 'pulse-risk 2s ease-in-out infinite';
        el.style.boxShadow = `0 0 20px ${color}66`;
      }

      // Popup
      const popupContent = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #e2e8f0; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px;">${zone.name}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">Risk Score</span>
            <span style="color: ${color}; font-weight: 700;">${riskScore}/100</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">Population</span>
            <span>${(zone.population / 1000).toFixed(0)}K</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">Top Risk</span>
            <span>${liveEvent ? liveEvent.name : zone.topRisk}</span>
          </div>
          ${liveEvent ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #94a3b8;">Probability</span>
            <span style="color: ${color};">${Number(liveEvent.probability).toFixed(0)}%</span>
          </div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #334155; color: #4caf86; font-size: 9px;">● LIVE DATA</div>
          ` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: size / 2,
        closeButton: false,
        maxWidth: '250px',
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([zone.lng, zone.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedZone(zone.id);
        onSelectZone?.(zone.id);
      });

      markersRef.current.push(marker);
    });

    // Add heatmap source/layer if not exists
    if (!map.current?.getSource('risk-heat')) {
      map.current?.addSource('risk-heat', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: riskZones.map(zone => {
            const liveEvent = zone.eventKey ? liveDataMap.get(zone.eventKey) : null;
            const intensity = liveEvent ? Number(liveEvent.severity) / 100 : zone.riskScore / 100;
            return {
              type: 'Feature' as const,
              geometry: { type: 'Point' as const, coordinates: [zone.lng, zone.lat] },
              properties: { intensity },
            };
          }),
        },
      });

      map.current?.addLayer({
        id: 'risk-heatmap',
        type: 'heatmap',
        source: 'risk-heat',
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          'heatmap-intensity': 0.6,
          'heatmap-radius': 50,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(41,182,246,0.3)',
            0.4, 'rgba(244,196,48,0.4)',
            0.6, 'rgba(247,127,0,0.5)',
            0.8, 'rgba(230,57,70,0.6)',
            1, 'rgba(230,57,70,0.8)',
          ],
          'heatmap-opacity': 0.7,
        },
      }, 'waterway-label');
    } else {
      // Update heatmap data
      (map.current?.getSource('risk-heat') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: riskZones.map(zone => {
          const liveEvent = zone.eventKey ? liveDataMap.get(zone.eventKey) : null;
          const intensity = liveEvent ? Number(liveEvent.severity) / 100 : zone.riskScore / 100;
          return {
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: [zone.lng, zone.lat] },
            properties: { intensity },
          };
        }),
      });
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full">
      <div className="flex items-center justify-between p-3 pb-0">
        <h3 className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Risk Heat Map — Nairobi Metro</h3>
        <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors.critical }} /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors.high }} /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors.medium }} /> Watch</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors.low }} /> Low</span>
        </div>
      </div>
      <div ref={mapContainer} className="w-full" style={{ height: '400px' }} />
    </div>
  );
};
