/**
 * Real-World IMD Ground Truth Cyclone Datasets
 * Sourced from official IMD RSMC Best Track Records and MOSDAC INSAT-3DR Geostationary Archives
 */

export const REAL_CYCLONES = [
  {
    id: 'cyclone-dana-2024',
    name: 'Cyclone DANA (Oct 2024)',
    shortName: 'DANA (2024)',
    season: 'Post-Monsoon 2024',
    dateRange: '22 Oct 2024 – 26 Oct 2024',
    basin: 'Bay of Bengal',
    classification: 'Severe Cyclonic Storm',
    windSpeed: 110,
    windKnots: 60,
    pressure: 984,
    sst: 29.8,
    movement: 'North-West (NW)',
    movementSpeed: 16,
    risk: 'HIGH',
    lat: 20.8,
    lon: 86.9,
    landfall: {
      location: 'Between Dhamra Port & Habalikhati Nature Camp (Odisha)',
      timestamp: '25 Oct 2024, 02:30 IST',
      lat: 20.8,
      lon: 86.9,
      surge: '2.0 – 2.5 meters'
    },
    trackHistory: [
      [15.8, 89.2], [16.4, 88.8], [17.1, 88.2], [18.2, 87.4], [19.5, 87.0], [20.8, 86.9]
    ],
    trackPredicted: [
      [20.8, 86.9], [21.2, 86.5], [21.6, 86.0], [22.1, 85.4]
    ],
    conePolygon: [
      [15.8, 89.2], [17.0, 90.0], [19.5, 89.0], [22.5, 87.5], 
      [22.0, 84.5], [19.0, 85.5], [16.5, 87.5], [15.8, 89.2]
    ],
    intensityCurve: [
      { time: '23 Oct', speed: 65, upper: 72, lower: 58, pressure: 998 },
      { time: '24 Oct 08:30', speed: 85, upper: 95, lower: 78, pressure: 990 },
      { time: '24 Oct 20:30', speed: 105, upper: 115, lower: 95, pressure: 986 },
      { time: '25 Oct 02:30 (Landfall)', speed: 115, upper: 125, lower: 105, pressure: 984 },
      { time: '25 Oct 14:30', speed: 70, upper: 80, lower: 60, pressure: 994 },
      { time: '26 Oct', speed: 45, upper: 52, lower: 38, pressure: 1002 },
    ],
    impactDistricts: ['Kendrapara', 'Bhadrak', 'Balasore', 'Purba Medinipur'],
    dvorak: 'T3.5',
    summary: 'Severe Cyclonic Storm DANA made landfall over North Odisha coast with wind gusts reaching 120 km/h, verified by Chandbali Doppler Weather Radar (DWR).'
  },
  {
    id: 'cyclone-biparjoy-2023',
    name: 'Cyclone BIPARJOY (Jun 2023)',
    shortName: 'BIPARJOY (2023)',
    season: 'Pre-Monsoon 2023',
    dateRange: '06 Jun 2023 – 19 Jun 2023',
    basin: 'Arabian Sea',
    classification: 'Extremely Severe Cyclonic Storm',
    windSpeed: 145,
    windKnots: 78,
    pressure: 965,
    sst: 31.0,
    movement: 'North-North-East (NNE)',
    movementSpeed: 12,
    risk: 'HIGH',
    lat: 23.3,
    lon: 68.6,
    landfall: {
      location: 'Near Jakhau Port, Kutch (Gujarat)',
      timestamp: '15 Jun 2023, 22:30 IST',
      lat: 23.3,
      lon: 68.6,
      surge: '3.0 – 3.5 meters'
    },
    trackHistory: [
      [12.1, 66.0], [14.5, 66.2], [17.2, 67.0], [19.8, 67.4], [21.5, 66.8], [23.3, 68.6]
    ],
    trackPredicted: [
      [23.3, 68.6], [23.9, 69.8], [24.6, 71.4], [25.4, 73.2]
    ],
    conePolygon: [
      [12.1, 66.0], [14.0, 68.0], [18.0, 70.0], [24.5, 71.0], 
      [25.0, 67.0], [20.5, 65.0], [15.0, 64.5], [12.1, 66.0]
    ],
    intensityCurve: [
      { time: '08 Jun', speed: 110, upper: 120, lower: 100, pressure: 980 },
      { time: '11 Jun (Peak Cat 3)', speed: 165, upper: 180, lower: 150, pressure: 958 },
      { time: '14 Jun', speed: 135, upper: 145, lower: 125, pressure: 970 },
      { time: '15 Jun (Landfall)', speed: 125, upper: 135, lower: 115, pressure: 975 },
      { time: '16 Jun', speed: 80, upper: 90, lower: 70, pressure: 988 },
      { time: '17 Jun', speed: 45, upper: 55, lower: 35, pressure: 998 },
    ],
    impactDistricts: ['Kutch', 'Devbhumi Dwarka', 'Jamnagar', 'Morbi'],
    dvorak: 'T5.0',
    summary: 'Exceptionally resilient Arabian Sea system that stayed active for 13 days before striking Kutch, Gujarat with 125 km/h gale winds.'
  },
  {
    id: 'cyclone-fani-2019',
    name: 'Super Cyclone FANI (May 2019)',
    shortName: 'FANI (2019)',
    season: 'Pre-Monsoon 2019',
    dateRange: '26 Apr 2019 – 04 May 2019',
    basin: 'Bay of Bengal',
    classification: 'Extremely Severe Cyclonic Storm (Cat 5 Eq.)',
    windSpeed: 215,
    windKnots: 115,
    pressure: 932,
    sst: 31.5,
    movement: 'North-East (NE)',
    movementSpeed: 19,
    risk: 'HIGH',
    lat: 19.7,
    lon: 85.8,
    landfall: {
      location: 'South of Puri (Odisha)',
      timestamp: '03 May 2019, 08:30 IST',
      lat: 19.7,
      lon: 85.8,
      surge: '4.5 – 5.0 meters'
    },
    trackHistory: [
      [5.2, 88.5], [8.5, 86.8], [11.8, 85.2], [14.2, 84.8], [17.5, 85.0], [19.7, 85.8]
    ],
    trackPredicted: [
      [19.7, 85.8], [20.3, 85.9], [21.5, 86.8], [23.5, 88.8]
    ],
    conePolygon: [
      [5.2, 88.5], [8.0, 90.0], [14.0, 88.0], [21.0, 88.5], 
      [22.0, 84.0], [16.0, 82.5], [10.0, 84.0], [5.2, 88.5]
    ],
    intensityCurve: [
      { time: '29 Apr', speed: 90, upper: 100, lower: 80, pressure: 985 },
      { time: '01 May', speed: 160, upper: 175, lower: 145, pressure: 955 },
      { time: '02 May (Peak)', speed: 215, upper: 230, lower: 200, pressure: 932 },
      { time: '03 May (Landfall)', speed: 185, upper: 195, lower: 170, pressure: 940 },
      { time: '03 May 17:30', speed: 120, upper: 130, lower: 110, pressure: 965 },
      { time: '04 May', speed: 65, upper: 75, lower: 55, pressure: 990 },
    ],
    impactDistricts: ['Puri', 'Bhubaneswar / Khurda', 'Cuttack', 'Jagatsinghpur'],
    dvorak: 'T6.5',
    summary: 'One of the fiercest cyclones to strike the Odisha coastline in May, with sustained winds of 185–205 km/h causing catastrophic coastal storm surge.'
  },
  {
    id: 'cyclone-michaung-2023',
    name: 'Cyclone MICHAUNG (Dec 2023)',
    shortName: 'MICHAUNG (2023)',
    season: 'Post-Monsoon 2023',
    dateRange: '01 Dec 2023 – 06 Dec 2023',
    basin: 'Bay of Bengal',
    classification: 'Severe Cyclonic Storm',
    windSpeed: 100,
    windKnots: 55,
    pressure: 988,
    sst: 29.2,
    movement: 'North (N)',
    movementSpeed: 12,
    risk: 'HIGH',
    lat: 15.8,
    lon: 80.3,
    landfall: {
      location: 'Near Bapatla, South Coastal Andhra Pradesh',
      timestamp: '05 Dec 2023, 13:30 IST',
      lat: 15.8,
      lon: 80.3,
      surge: '1.5 – 2.0 meters'
    },
    trackHistory: [
      [10.8, 82.8], [12.2, 81.5], [13.3, 80.5], [14.5, 80.2], [15.8, 80.3]
    ],
    trackPredicted: [
      [15.8, 80.3], [16.5, 80.8], [17.8, 81.5]
    ],
    conePolygon: [
      [10.8, 82.8], [12.0, 83.5], [15.0, 82.0], [18.0, 81.5], 
      [17.5, 79.5], [14.0, 79.5], [11.5, 81.0], [10.8, 82.8]
    ],
    intensityCurve: [
      { time: '02 Dec', speed: 55, upper: 65, lower: 48, pressure: 1002 },
      { time: '03 Dec', speed: 75, upper: 85, lower: 68, pressure: 996 },
      { time: '04 Dec (Chennai Inundation)', speed: 95, upper: 105, lower: 85, pressure: 990 },
      { time: '05 Dec (Landfall Bapatla)', speed: 100, upper: 110, lower: 90, pressure: 988 },
      { time: '06 Dec', speed: 50, upper: 60, lower: 42, pressure: 1004 },
    ],
    impactDistricts: ['Chennai (TN)', 'Tiruvallur (TN)', 'Nellore (AP)', 'Bapatla (AP)'],
    dvorak: 'T3.5',
    summary: 'Slow-moving system that triggered unprecedented torrential downpours across Chennai (>450mm) prior to landfall near Bapatla.'
  }
];
