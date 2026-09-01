// ─── CYCLONE AI SHARED MOCK DATA ────────────────────────────
// Single source of truth for all pages

export const ACTIVE_CYCLONES = [
  {
    id: 'TC-2026-ALPHA',
    name: 'Cyclone ALPHA',
    status: 'ACTIVE',
    risk: 'HIGH',
    classification: 'Developing Tropical Cyclone',
    basin: 'Bay of Bengal',
    lat: 15.4,
    lon: 87.8,
    windSpeed: 85,
    pressure: 980,
    movement: 'North-West',
    movementSpeed: 15,
    sst: 29.5,
    confidence: 94.2,
    lastUpdated: '2026-08-29 14:30 UTC',
  },
  {
    id: 'TC-2026-BETA',
    name: 'Depression BETA',
    status: 'MONITORING',
    risk: 'LOW',
    classification: 'Tropical Disturbance',
    basin: 'Arabian Sea',
    lat: 14.2,
    lon: 65.3,
    windSpeed: 45,
    pressure: 1002,
    movement: 'North',
    movementSpeed: 10,
    sst: 28.1,
    confidence: 78.1,
    lastUpdated: '2026-08-29 14:30 UTC',
  },
];

export const INTENSITY_FORECAST = [
  { time: 'NOW',   speed: 85,  lower: 80,  upper: 92  },
  { time: '+6h',   speed: 92,  lower: 85,  upper: 102 },
  { time: '+12h',  speed: 101, lower: 91,  upper: 115 },
  { time: '+24h',  speed: 115, lower: 101, upper: 132 },
  { time: '+48h',  speed: 105, lower: 88,  upper: 128 },
  { time: '+72h',  speed: 90,  lower: 70,  upper: 115 },
];

export const PRESSURE_FORECAST = [
  { time: 'NOW',  pressure: 980 },
  { time: '+6h',  pressure: 974 },
  { time: '+12h', pressure: 966 },
  { time: '+24h', pressure: 955 },
  { time: '+48h', pressure: 962 },
  { time: '+72h', pressure: 970 },
];

export const TRACK_HISTORY = [
  [11.8, 93.2], [12.5, 92.0], [13.3, 90.8],
  [14.1, 89.5], [14.8, 88.6], [15.4, 87.8],
];

export const TRACK_PREDICTED = [
  [15.4, 87.8], [16.1, 87.1], [16.9, 86.5],
  [18.2, 85.6], [20.1, 84.2], [22.0, 83.0],
];

export const DATA_SOURCES = [
  { name: 'INSAT-3DR (Visible)', status: 'ONLINE', latency: '45ms', lastSync: '14:30 UTC', quality: 98 },
  { name: 'INSAT-3D (Infrared)', status: 'ONLINE', latency: '52ms', lastSync: '14:30 UTC', quality: 97 },
  { name: 'Meteosat-9 (Water Vapour)', status: 'ONLINE', latency: '88ms', lastSync: '14:28 UTC', quality: 95 },
  { name: 'NOAA-20 (SST)', status: 'ONLINE', latency: '120ms', lastSync: '14:25 UTC', quality: 96 },
  { name: 'ASCAT (Wind Field)', status: 'ONLINE', latency: '95ms', lastSync: '14:20 UTC', quality: 94 },
  { name: 'GPM Core (Rainfall)', status: 'ONLINE', latency: '110ms', lastSync: '14:18 UTC', quality: 93 },
];

export const ALERTS = [
  {
    id: 'ALERT-001',
    severity: 'HIGH',
    cyclone: 'TC-2026-ALPHA',
    message: 'Rapid intensification detected. Wind speed expected to reach 115 km/h within 24 hours.',
    issuedAt: '2026-08-29 13:45 UTC',
    region: 'Coastal Andhra Pradesh & Odisha',
  },
  {
    id: 'ALERT-002',
    severity: 'MODERATE',
    cyclone: 'TC-2026-BETA',
    message: 'System developing in Arabian Sea. Monitoring initiated.',
    issuedAt: '2026-08-29 11:00 UTC',
    region: 'Gujarat Coast',
  },
];

export const HISTORICAL_CYCLONES = [
  { id: 'TC-2025-ZETA', year: 2025, basin: 'Bay of Bengal', maxWind: 185, category: 'Very Severe Cyclonic Storm', landfall: 'Odisha', casualties: 12 },
  { id: 'TC-2024-OMEGA', year: 2024, basin: 'Arabian Sea', maxWind: 165, category: 'Severe Cyclonic Storm', landfall: 'Gujarat', casualties: 5 },
  { id: 'TC-2023-DELTA', year: 2023, basin: 'Bay of Bengal', maxWind: 215, category: 'Super Cyclonic Storm', landfall: 'West Bengal', casualties: 48 },
  { id: 'TC-2022-SIGMA', year: 2022, basin: 'Bay of Bengal', maxWind: 110, category: 'Severe Cyclonic Storm', landfall: 'Tamil Nadu', casualties: 3 },
  { id: 'TC-2021-RHO',   year: 2021, basin: 'Arabian Sea', maxWind: 140, category: 'Very Severe Cyclonic Storm', landfall: 'Kerala', casualties: 8 },
  { id: 'TC-2020-PSI',   year: 2020, basin: 'Bay of Bengal', maxWind: 200, category: 'Super Cyclonic Storm', landfall: 'Odisha', casualties: 89 },
  { id: 'TC-2019-CHI',   year: 2019, basin: 'Bay of Bengal', maxWind: 175, category: 'Very Severe Cyclonic Storm', landfall: 'Andhra Pradesh', casualties: 64 },
];

export const CYCLONE_BY_YEAR = [
  { year: '2019', count: 8 },
  { year: '2020', count: 11 },
  { year: '2021', count: 9 },
  { year: '2022', count: 12 },
  { year: '2023', count: 10 },
  { year: '2024', count: 14 },
  { year: '2025', count: 11 },
];

export const MODEL_METRICS = {
  detection: { accuracy: 94.2, precision: 92.8, recall: 91.6, f1: 92.2, version: 'CycloneVision-CNN v2.1', dataset: '42,500 images' },
  classification: { accuracy: 89.7, precision: 88.1, recall: 87.4, f1: 87.7, version: 'PatternNet-ResNet50 v1.4', dataset: '38,200 images' },
  prediction: { trackMAE: 32.4, intensityMAE: 8.5, version: 'CycloneForecast-LSTM v3.0', dataset: '15 years RSMC data' },
};
