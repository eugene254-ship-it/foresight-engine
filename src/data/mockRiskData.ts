export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'stable';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type TrendDirection = 'rising' | 'falling' | 'stable';
export type ScenarioMode = 'live' | 'simulated' | 'historical';
export type GeoScope = 'Global' | 'Country' | 'County' | 'District' | 'Settlement';

export interface SparklinePoint {
  t: number;
  v: number;
}

export interface RiskCard {
  id: string;
  title: string;
  metric: number;
  unit: string;
  severity: RiskSeverity;
  trend: TrendDirection;
  trendDelta: number;
  confidence: ConfidenceLevel;
  sparkline: SparklinePoint[];
  previousPeriod: number;
  lastUpdated: string;
}

export interface InterventionDetail {
  name: string;
  riskReduction: number;
  timeToEffect: string;
  operationalCost: string;
  confidence: ConfidenceLevel;
}

export interface RiskDriver {
  name: string;
  contribution: number;
  direction: TrendDirection;
  evidence: string;
}

export interface RiskEvent {
  id: string;
  name: string;
  region: string;
  sector: string;
  probability: number;
  severity: number;
  exposure: number;
  velocity: TrendDirection;
  confidence: ConfidenceLevel;
  cascadePotential: number;
  mitigationLeverage: number;
  lastUpdated: string;
  status: RiskSeverity;
  drivers: string[];
  riskDrivers: RiskDriver[];
  failurePathway: string;
  interventions: string[];
  interventionDetails: InterventionDetail[];
  impactWindow: string;
  timeToFailure: string;
  interventionReadiness: 'ready' | 'partial' | 'unready';
  pinned?: boolean;
  explainability: string;
}

export interface MapZone {
  id: string;
  name: string;
  row: number;
  col: number;
  riskScore: number;
  severity: RiskSeverity;
  population: number;
  topRisk: string;
  confidence: ConfidenceLevel;
  trend: TrendDirection;
}

export interface CascadeNode {
  id: string;
  label: string;
  sector: string;
  stress: number;
  importance: number;
  x: number;
  y: number;
}

export interface CascadeEdge {
  source: string;
  target: string;
  strength: number;
}

export interface FragilityComponent {
  name: string;
  score: number;
  weight: number;
}

export interface FragilitySystem {
  id: string;
  name: string;
  score: number;
  trend: TrendDirection;
  components: FragilityComponent[];
}

export interface DataSource {
  name: string;
  status: 'active' | 'delayed' | 'stale';
  lastUpdate: string;
  confidence: number;
  warning?: string;
  coverage: number;
}

// ---- MOCK DATA ----

const spark = (base: number, volatility: number, points = 12): SparklinePoint[] =>
  Array.from({ length: points }, (_, i) => ({
    t: i,
    v: Math.max(0, Math.min(100, base + (Math.random() - 0.4) * volatility * 2)),
  }));

export const mockRiskCards: RiskCard[] = [
  {
    id: 'fragility', title: 'System Fragility Index', metric: 0.81, unit: '/ 1.0',
    severity: 'critical', trend: 'rising', trendDelta: 0.06, confidence: 'high',
    sparkline: spark(78, 8), previousPeriod: 0.75, lastUpdated: '30s ago',
  },
  {
    id: 'flood', title: 'Highest Probability Failure', metric: 78, unit: '%',
    severity: 'critical', trend: 'rising', trendDelta: 12, confidence: 'high',
    sparkline: spark(70, 12), previousPeriod: 66, lastUpdated: '2 min ago',
  },
  {
    id: 'grid', title: 'Fastest Rising Risk', metric: 63, unit: '%',
    severity: 'high', trend: 'rising', trendDelta: 18, confidence: 'medium',
    sparkline: spark(55, 10), previousPeriod: 45, lastUpdated: '8 min ago',
  },
  {
    id: 'exposure', title: 'Population Exposure', metric: 2.4, unit: 'M people',
    severity: 'high', trend: 'rising', trendDelta: 0.3, confidence: 'high',
    sparkline: spark(60, 8), previousPeriod: 2.1, lastUpdated: '1 min ago',
  },
  {
    id: 'disruption', title: 'Service Disruption Risk', metric: 72, unit: '%',
    severity: 'high', trend: 'rising', trendDelta: 9, confidence: 'medium',
    sparkline: spark(65, 10), previousPeriod: 63, lastUpdated: '5 min ago',
  },
  {
    id: 'model', title: 'Model Confidence', metric: 74, unit: '% avg',
    severity: 'low', trend: 'falling', trendDelta: -3, confidence: 'medium',
    sparkline: spark(76, 5), previousPeriod: 77, lastUpdated: '12 min ago',
  },
];

export const mockRiskEvents: RiskEvent[] = [
  {
    id: 'r1', name: 'Eastlands Flood Event', region: 'Nairobi - Eastlands', sector: 'Flood',
    probability: 78, severity: 92, exposure: 840000, velocity: 'rising', confidence: 'high',
    cascadePotential: 85, mitigationLeverage: 62, lastUpdated: '2 min ago', status: 'critical',
    timeToFailure: '12-36h', interventionReadiness: 'partial',
    drivers: ['Rainfall anomaly +32%', 'Drainage capacity at 61%', 'Informal settlement density high', 'Ground saturation index 0.89'],
    riskDrivers: [
      { name: 'Rainfall anomaly', contribution: 34, direction: 'rising', evidence: '32% above 10-year average for this period' },
      { name: 'Drainage blockage score', contribution: 28, direction: 'rising', evidence: '39% of drainage nodes reporting capacity <60%' },
      { name: 'Settlement density', contribution: 22, direction: 'stable', evidence: 'Informal structures within 50m of flood plain' },
      { name: 'Ground saturation index', contribution: 16, direction: 'rising', evidence: 'Index at 0.89 — near complete saturation' },
    ],
    failurePathway: 'Flooding risk in Eastlands is rising due to high rainfall probability, blocked drainage indicators, and dense settlement exposure. If the event triggers, likely secondary failures include road access loss, clinic disruptions, and food delivery delays.',
    interventions: ['Inspect drainage nodes in Sector 4-7', 'Preposition mobile clinics at Umoja', 'Activate flood response cache at Buruburu', 'Issue community early warning SMS'],
    interventionDetails: [
      { name: 'Clear drainage chokepoints S4-S7', riskReduction: 18, timeToEffect: '4-8 hours', operationalCost: '$12K', confidence: 'high' },
      { name: 'Deploy mobile clinics to Umoja', riskReduction: 8, timeToEffect: '2-4 hours', operationalCost: '$28K', confidence: 'high' },
      { name: 'Activate flood cache at Buruburu', riskReduction: 12, timeToEffect: '1-2 hours', operationalCost: '$6K', confidence: 'medium' },
      { name: 'Issue community early warning SMS', riskReduction: 5, timeToEffect: '30 minutes', operationalCost: '$800', confidence: 'high' },
    ],
    impactWindow: '12-36 hours',
    explainability: 'This risk score is high because the model detects a compound signal: rainfall forecast significantly exceeds seasonal norms while drainage infrastructure is simultaneously degraded. The model weights recent sensor data (last 6h) more heavily and sees accelerating ground saturation approaching the 0.9 threshold where historical flood events cluster. Key assumption: drainage capacity remains at current levels without intervention.',
  },
  {
    id: 'r2', name: 'Grid Cascade Failure', region: 'Central Grid Zone', sector: 'Energy',
    probability: 63, severity: 78, exposure: 1200000, velocity: 'rising', confidence: 'medium',
    cascadePotential: 72, mitigationLeverage: 45, lastUpdated: '8 min ago', status: 'high',
    timeToFailure: '6-18h', interventionReadiness: 'partial',
    drivers: ['Transformer load at 94%', 'Reserve margin below 6%', 'Peak demand surge predicted', 'Maintenance backlog on 3 substations'],
    riskDrivers: [
      { name: 'Transformer load', contribution: 32, direction: 'rising', evidence: 'Load at 94% of rated capacity across 6 substations' },
      { name: 'Reserve margin depletion', contribution: 26, direction: 'rising', evidence: 'Below 6% — threshold for emergency protocols' },
      { name: 'Peak demand surge', contribution: 24, direction: 'rising', evidence: 'Predicted 12% above baseline for next 12h' },
      { name: 'Maintenance backlog', contribution: 18, direction: 'stable', evidence: '3 substations overdue by >30 days' },
    ],
    failurePathway: 'Grid overload risk is elevated due to sustained high demand, depleted reserves, and deferred substation maintenance. Failure would cascade into water pumping disruption, cold chain breaks, and communication outages.',
    interventions: ['Activate load shedding plan B', 'Deploy mobile generators to hospitals', 'Reduce industrial allocation by 15%', 'Fast-track substation 7 maintenance'],
    interventionDetails: [
      { name: 'Activate load shedding Plan B', riskReduction: 22, timeToEffect: '1-2 hours', operationalCost: '$45K', confidence: 'high' },
      { name: 'Deploy mobile generators to hospitals', riskReduction: 14, timeToEffect: '3-6 hours', operationalCost: '$35K', confidence: 'high' },
      { name: 'Reduce industrial allocation 15%', riskReduction: 10, timeToEffect: '2-4 hours', operationalCost: '$120K (lost output)', confidence: 'medium' },
      { name: 'Fast-track substation 7 maintenance', riskReduction: 8, timeToEffect: '12-24 hours', operationalCost: '$18K', confidence: 'medium' },
    ],
    impactWindow: '6-18 hours',
    explainability: 'Risk is elevated because the grid model detects transformer load levels converging with depleted reserve margins during a predicted demand surge. The three-factor overlap historically correlates with cascade failure in 72% of similar scenarios. Key assumption: no unscheduled generation comes online within 6 hours.',
  },
  {
    id: 'r3', name: 'Vaccine Cold Chain Break', region: 'Kibera - Lang\'ata', sector: 'Health',
    probability: 41, severity: 65, exposure: 320000, velocity: 'stable', confidence: 'medium',
    cascadePotential: 58, mitigationLeverage: 71, lastUpdated: '15 min ago', status: 'medium',
    timeToFailure: '3-7d', interventionReadiness: 'ready',
    drivers: ['Refrigeration unit age >5yr on 40% of fleet', 'Power stability index declining', 'Supply route fragility increasing', 'Stock buffer at 4-day minimum'],
    riskDrivers: [
      { name: 'Refrigeration equipment age', contribution: 30, direction: 'stable', evidence: '40% of cold chain units >5 years old' },
      { name: 'Power stability index', contribution: 25, direction: 'falling', evidence: 'Grid reliability dropped to 0.82 in target area' },
      { name: 'Supply route fragility', contribution: 25, direction: 'rising', evidence: 'Single corridor dependency for 3 distribution hubs' },
      { name: 'Stock buffer depletion', contribution: 20, direction: 'rising', evidence: 'Buffer at 4-day minimum vs 7-day target' },
    ],
    failurePathway: 'Vaccine supply disruption risk stems from aging cold chain equipment, unstable power supply, and thinning stock buffers. If cold chain fails, downstream outbreak risk increases across 12 facilities serving 320K residents.',
    interventions: ['Reroute vaccine cold chain via alternative depot', 'Deploy backup solar refrigeration', 'Increase stock buffer to 7-day minimum', 'Schedule emergency equipment audit'],
    interventionDetails: [
      { name: 'Reroute cold chain via alternative depot', riskReduction: 24, timeToEffect: '6-12 hours', operationalCost: '$8K', confidence: 'high' },
      { name: 'Deploy solar backup refrigeration', riskReduction: 18, timeToEffect: '24-48 hours', operationalCost: '$22K', confidence: 'medium' },
      { name: 'Increase stock buffer to 7-day', riskReduction: 10, timeToEffect: '2-5 days', operationalCost: '$15K', confidence: 'high' },
      { name: 'Emergency equipment audit', riskReduction: 6, timeToEffect: '1-3 days', operationalCost: '$4K', confidence: 'medium' },
    ],
    impactWindow: '3-7 days',
    explainability: 'Risk is moderate because cold chain infrastructure is aging but still functional. The model sees compounding fragility from equipment age, power instability, and route concentration. Score would jump to 65%+ if any single power outage exceeds 4 hours in the target area.',
  },
  {
    id: 'r4', name: 'Microfinance Liquidity Crisis', region: 'Rift Valley', sector: 'Finance',
    probability: 34, severity: 55, exposure: 180000, velocity: 'rising', confidence: 'low',
    cascadePotential: 45, mitigationLeverage: 38, lastUpdated: '23 min ago', status: 'medium',
    timeToFailure: '2-4w', interventionReadiness: 'unready',
    drivers: ['Credit defaults rising in 3 nodes', 'Liquidity compression index at 0.67', 'Harvest yield forecast below average', 'Cross-border remittance delays'],
    riskDrivers: [
      { name: 'Default rate acceleration', contribution: 30, direction: 'rising', evidence: 'Defaults up 18% in 3 lending nodes' },
      { name: 'Liquidity compression', contribution: 28, direction: 'rising', evidence: 'Index at 0.67 — approaching stress threshold 0.55' },
      { name: 'Harvest yield forecast', contribution: 24, direction: 'falling', evidence: 'Below average yields expected in 2 regions' },
      { name: 'Remittance delays', contribution: 18, direction: 'rising', evidence: 'Cross-border processing times +40%' },
    ],
    failurePathway: 'Microfinance stress in Rift Valley is driven by rising defaults and agricultural underperformance. Liquidity squeeze could cascade into small business closures, food market disruption, and social instability.',
    interventions: ['Issue lender stress review', 'Activate emergency credit facility', 'Deploy financial counseling teams', 'Monitor cross-border payment corridors'],
    interventionDetails: [
      { name: 'Activate emergency credit facility', riskReduction: 14, timeToEffect: '3-7 days', operationalCost: '$200K', confidence: 'medium' },
      { name: 'Lender stress review & restructure', riskReduction: 10, timeToEffect: '1-2 weeks', operationalCost: '$25K', confidence: 'low' },
      { name: 'Deploy financial counseling', riskReduction: 6, timeToEffect: '1-3 weeks', operationalCost: '$12K', confidence: 'medium' },
      { name: 'Monitor payment corridors', riskReduction: 4, timeToEffect: '24-48 hours', operationalCost: '$3K', confidence: 'high' },
    ],
    impactWindow: '2-4 weeks',
    explainability: 'Confidence is low because financial network data has a 9-hour lag and the model relies on proxy indicators. The score reflects correlation between default rate trends and historical liquidity events. Assumption: cross-border remittance disruptions persist at current levels.',
  },
  {
    id: 'r5', name: 'Road Network Collapse', region: 'Mombasa Highway', sector: 'Logistics',
    probability: 52, severity: 70, exposure: 950000, velocity: 'rising', confidence: 'high',
    cascadePotential: 78, mitigationLeverage: 55, lastUpdated: '5 min ago', status: 'high',
    timeToFailure: '1-5d', interventionReadiness: 'partial',
    drivers: ['Surface degradation index 0.82', 'Heavy vehicle overload violations +45%', 'Rainfall-induced erosion predicted', 'Bridge stress on 2 critical crossings'],
    riskDrivers: [
      { name: 'Surface degradation', contribution: 30, direction: 'rising', evidence: 'Degradation index at 0.82 of failure threshold' },
      { name: 'Overload violations', contribution: 28, direction: 'rising', evidence: 'Heavy vehicle violations up 45% in 30 days' },
      { name: 'Erosion forecast', contribution: 24, direction: 'rising', evidence: 'Predicted rainfall will accelerate erosion on 3 segments' },
      { name: 'Bridge stress', contribution: 18, direction: 'stable', evidence: '2 crossings at 88% of rated load capacity' },
    ],
    failurePathway: 'Road network integrity on Mombasa Highway is deteriorating. Combined with predicted rainfall, 2 bridge crossings are at risk. Failure would sever primary supply corridor affecting food, fuel, and medical logistics for coastal region.',
    interventions: ['Restrict heavy vehicle loads on bridge segments', 'Deploy emergency road repair crews', 'Pre-stage alternative route signage', 'Coordinate with rail for contingency freight'],
    interventionDetails: [
      { name: 'Restrict loads on bridge segments', riskReduction: 16, timeToEffect: '2-4 hours', operationalCost: '$5K', confidence: 'high' },
      { name: 'Emergency road repair crews', riskReduction: 12, timeToEffect: '1-3 days', operationalCost: '$85K', confidence: 'medium' },
      { name: 'Pre-stage alternative routing', riskReduction: 8, timeToEffect: '4-8 hours', operationalCost: '$7K', confidence: 'high' },
      { name: 'Rail contingency freight coordination', riskReduction: 10, timeToEffect: '1-2 days', operationalCost: '$45K', confidence: 'low' },
    ],
    impactWindow: '1-5 days',
    explainability: 'Risk is high because road sensors show accelerating degradation coinciding with heavy vehicle overloading and an approaching rainfall event. The model sees this as a compound stress pattern that historically leads to surface failure. Key assumption: no emergency weight restrictions are enacted.',
  },
  {
    id: 'r6', name: 'Food Supply Chain Disruption', region: 'Western Kenya', sector: 'Food',
    probability: 29, severity: 60, exposure: 420000, velocity: 'stable', confidence: 'medium',
    cascadePotential: 52, mitigationLeverage: 64, lastUpdated: '31 min ago', status: 'low',
    timeToFailure: '1-3w', interventionReadiness: 'ready',
    drivers: ['Market price volatility +18%', 'Storage facility utilization at 91%', 'Transport route dependency on single corridor', 'Seasonal transition stress'],
    riskDrivers: [
      { name: 'Price volatility', contribution: 28, direction: 'rising', evidence: 'Wholesale prices +18% above seasonal average' },
      { name: 'Storage saturation', contribution: 26, direction: 'stable', evidence: 'Facility utilization at 91% of capacity' },
      { name: 'Route concentration', contribution: 26, direction: 'stable', evidence: 'Single corridor handles 78% of volume' },
      { name: 'Seasonal transition', contribution: 20, direction: 'stable', evidence: 'Normal seasonal pattern, not yet anomalous' },
    ],
    failurePathway: 'Food supply chain in Western Kenya faces moderate risk from storage saturation and transport route concentration. Price volatility could accelerate if logistics disruption occurs simultaneously.',
    interventions: ['Activate strategic grain reserves', 'Diversify transport routing', 'Negotiate emergency storage capacity', 'Monitor wholesale price indices daily'],
    interventionDetails: [
      { name: 'Activate strategic grain reserves', riskReduction: 15, timeToEffect: '2-5 days', operationalCost: '$50K', confidence: 'high' },
      { name: 'Diversify transport routing', riskReduction: 12, timeToEffect: '1-2 weeks', operationalCost: '$30K', confidence: 'medium' },
      { name: 'Negotiate emergency storage', riskReduction: 8, timeToEffect: '3-7 days', operationalCost: '$18K', confidence: 'medium' },
      { name: 'Daily wholesale price monitoring', riskReduction: 3, timeToEffect: '24 hours', operationalCost: '$1K', confidence: 'high' },
    ],
    impactWindow: '1-3 weeks',
    explainability: 'Risk is moderate because the compound signal of storage saturation + route concentration creates fragility, but actual disruption requires an external trigger (e.g., road failure, fuel shortage). Current volatility is elevated but not extreme.',
  },
];

export const mockMapZones: MapZone[] = [
  { id: 'z1', name: 'Nairobi Central', row: 2, col: 3, riskScore: 82, severity: 'critical', population: 1200000, topRisk: 'Grid Overload', confidence: 'high', trend: 'rising' },
  { id: 'z2', name: 'Eastlands', row: 2, col: 4, riskScore: 91, severity: 'critical', population: 840000, topRisk: 'Flooding', confidence: 'high', trend: 'rising' },
  { id: 'z3', name: 'Kibera', row: 3, col: 3, riskScore: 68, severity: 'high', population: 320000, topRisk: 'Vaccine Supply', confidence: 'medium', trend: 'stable' },
  { id: 'z4', name: 'Westlands', row: 1, col: 2, riskScore: 35, severity: 'low', population: 180000, topRisk: 'None Critical', confidence: 'high', trend: 'falling' },
  { id: 'z5', name: 'Industrial Area', row: 3, col: 4, riskScore: 74, severity: 'high', population: 95000, topRisk: 'Grid Cascade', confidence: 'medium', trend: 'rising' },
  { id: 'z6', name: 'Kasarani', row: 1, col: 4, riskScore: 56, severity: 'medium', population: 520000, topRisk: 'Road Degradation', confidence: 'medium', trend: 'rising' },
  { id: 'z7', name: 'Lang\'ata', row: 3, col: 2, riskScore: 42, severity: 'medium', population: 280000, topRisk: 'Supply Chain', confidence: 'low', trend: 'stable' },
  { id: 'z8', name: 'Embakasi', row: 2, col: 5, riskScore: 65, severity: 'high', population: 680000, topRisk: 'Flooding', confidence: 'high', trend: 'rising' },
  { id: 'z9', name: 'Dagoretti', row: 3, col: 1, riskScore: 28, severity: 'low', population: 350000, topRisk: 'None Critical', confidence: 'high', trend: 'falling' },
  { id: 'z10', name: 'Ruaraka', row: 1, col: 3, riskScore: 48, severity: 'medium', population: 410000, topRisk: 'Grid Stress', confidence: 'medium', trend: 'stable' },
  { id: 'z11', name: 'Makadara', row: 2, col: 2, riskScore: 58, severity: 'medium', population: 290000, topRisk: 'Infrastructure', confidence: 'medium', trend: 'rising' },
  { id: 'z12', name: 'Starehe', row: 1, col: 1, riskScore: 44, severity: 'medium', population: 210000, topRisk: 'Finance Stress', confidence: 'low', trend: 'stable' },
  { id: 'z13', name: 'Mathare', row: 1, col: 5, riskScore: 79, severity: 'critical', population: 390000, topRisk: 'Flooding', confidence: 'high', trend: 'rising' },
  { id: 'z14', name: 'Kayole', row: 2, col: 6, riskScore: 71, severity: 'high', population: 450000, topRisk: 'Road Network', confidence: 'medium', trend: 'rising' },
  { id: 'z15', name: 'Pipeline', row: 3, col: 5, riskScore: 61, severity: 'high', population: 260000, topRisk: 'Grid Cascade', confidence: 'medium', trend: 'stable' },
];

export const mockCascadeNodes: CascadeNode[] = [
  { id: 'n1', label: 'Heavy Rainfall', sector: 'Environment', stress: 0.9, importance: 0.95, x: 80, y: 160 },
  { id: 'n2', label: 'Drainage Failure', sector: 'Infrastructure', stress: 0.75, importance: 0.8, x: 240, y: 100 },
  { id: 'n3', label: 'Road Flooding', sector: 'Logistics', stress: 0.7, importance: 0.85, x: 240, y: 220 },
  { id: 'n4', label: 'Clinic Access Loss', sector: 'Health', stress: 0.6, importance: 0.75, x: 420, y: 60 },
  { id: 'n5', label: 'Vaccine Spoilage', sector: 'Health', stress: 0.5, importance: 0.7, x: 580, y: 60 },
  { id: 'n6', label: 'Food Delivery Halt', sector: 'Food', stress: 0.55, importance: 0.7, x: 420, y: 180 },
  { id: 'n7', label: 'Power Disruption', sector: 'Energy', stress: 0.65, importance: 0.9, x: 420, y: 300 },
  { id: 'n8', label: 'Outbreak Risk', sector: 'Health', stress: 0.4, importance: 0.85, x: 720, y: 60 },
  { id: 'n9', label: 'Market Disruption', sector: 'Finance', stress: 0.35, importance: 0.6, x: 580, y: 180 },
  { id: 'n10', label: 'Water Pump Failure', sector: 'Infrastructure', stress: 0.55, importance: 0.8, x: 580, y: 300 },
];

export const mockCascadeEdges: CascadeEdge[] = [
  { source: 'n1', target: 'n2', strength: 0.9 },
  { source: 'n1', target: 'n3', strength: 0.85 },
  { source: 'n2', target: 'n3', strength: 0.7 },
  { source: 'n3', target: 'n4', strength: 0.75 },
  { source: 'n3', target: 'n6', strength: 0.7 },
  { source: 'n3', target: 'n7', strength: 0.5 },
  { source: 'n4', target: 'n5', strength: 0.8 },
  { source: 'n5', target: 'n8', strength: 0.85 },
  { source: 'n6', target: 'n9', strength: 0.6 },
  { source: 'n7', target: 'n10', strength: 0.75 },
  { source: 'n7', target: 'n4', strength: 0.4 },
];

export const mockFragilitySystems: FragilitySystem[] = [
  {
    id: 'f1', name: 'Water Infrastructure', score: 0.72, trend: 'rising',
    components: [
      { name: 'Redundancy', score: 0.35, weight: 0.2 },
      { name: 'Reserve Cap.', score: 0.28, weight: 0.25 },
      { name: 'Dep. Density', score: 0.82, weight: 0.2 },
      { name: 'Recovery Lag', score: 0.65, weight: 0.15 },
      { name: 'Hist. Volatility', score: 0.71, weight: 0.2 },
    ],
  },
  {
    id: 'f2', name: 'Health Supply Chain', score: 0.84, trend: 'rising',
    components: [
      { name: 'Redundancy', score: 0.15, weight: 0.2 },
      { name: 'Reserve Cap.', score: 0.12, weight: 0.25 },
      { name: 'Dep. Density', score: 0.91, weight: 0.2 },
      { name: 'Recovery Lag', score: 0.78, weight: 0.15 },
      { name: 'Hist. Volatility', score: 0.88, weight: 0.2 },
    ],
  },
  {
    id: 'f3', name: 'Microfinance Network', score: 0.67, trend: 'stable',
    components: [
      { name: 'Redundancy', score: 0.42, weight: 0.2 },
      { name: 'Reserve Cap.', score: 0.38, weight: 0.25 },
      { name: 'Dep. Density', score: 0.72, weight: 0.2 },
      { name: 'Recovery Lag', score: 0.55, weight: 0.15 },
      { name: 'Hist. Volatility', score: 0.62, weight: 0.2 },
    ],
  },
  {
    id: 'f4', name: 'Power Grid', score: 0.76, trend: 'rising',
    components: [
      { name: 'Redundancy', score: 0.3, weight: 0.2 },
      { name: 'Reserve Cap.', score: 0.22, weight: 0.25 },
      { name: 'Dep. Density', score: 0.85, weight: 0.2 },
      { name: 'Recovery Lag', score: 0.7, weight: 0.15 },
      { name: 'Hist. Volatility', score: 0.75, weight: 0.2 },
    ],
  },
  {
    id: 'f5', name: 'Transport Corridors', score: 0.69, trend: 'rising',
    components: [
      { name: 'Redundancy', score: 0.22, weight: 0.2 },
      { name: 'Reserve Cap.', score: 0.35, weight: 0.25 },
      { name: 'Dep. Density', score: 0.78, weight: 0.2 },
      { name: 'Recovery Lag', score: 0.62, weight: 0.15 },
      { name: 'Hist. Volatility', score: 0.68, weight: 0.2 },
    ],
  },
];

export const mockForecastData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  baseline: 55 + Math.sin(i / 5) * 15 + (i / 30) * 20,
  optimistic: 45 + Math.sin(i / 5) * 10 + (i / 30) * 8,
  worstCase: 65 + Math.sin(i / 5) * 18 + (i / 30) * 30,
  upperBand: 70 + Math.sin(i / 5) * 20 + (i / 30) * 35,
  lowerBand: 40 + Math.sin(i / 5) * 8 + (i / 30) * 5,
}));

export const dataSourceHealth: DataSource[] = [
  { name: 'Satellite Rainfall Feed', status: 'active', lastUpdate: '2 min ago', confidence: 94, coverage: 98 },
  { name: 'Grid Load Sensors', status: 'active', lastUpdate: '45 sec ago', confidence: 91, coverage: 85 },
  { name: 'Financial Stress Model', status: 'delayed', lastUpdate: '23 min ago', confidence: 68, warning: 'Processing backlog — data may be stale', coverage: 72 },
  { name: 'Road Condition Sensors', status: 'active', lastUpdate: '5 min ago', confidence: 87, coverage: 78 },
  { name: 'Health Facility Reports', status: 'active', lastUpdate: '12 min ago', confidence: 82, coverage: 91 },
  { name: 'Mobile Money Flows', status: 'stale', lastUpdate: '2 hr ago', confidence: 34, warning: 'Feed outage — last data 2 hours old', coverage: 45 },
  { name: 'Settlement Sensors', status: 'delayed', lastUpdate: '18 min ago', confidence: 56, warning: 'Coverage incomplete — 55% of sensors reporting', coverage: 55 },
  { name: 'Weather Station Network', status: 'active', lastUpdate: '1 min ago', confidence: 96, coverage: 92 },
];
