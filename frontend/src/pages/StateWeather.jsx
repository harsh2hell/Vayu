import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, ShieldAlert, Wind, Waves, CloudRain, 
  MapPin, PhoneCall, AlertTriangle, CheckCircle2, Clock, 
  ExternalLink, Building2, Radio, Compass, Navigation2,
  ChevronRight, ArrowUpRight, Sun, Moon, Info, Bell
} from 'lucide-react';

const STATE_DATA = {
  odisha: {
    slug: 'odisha',
    name: 'Odisha',
    hindiName: 'ओडिशा',
    basin: 'Bay of Bengal',
    alertLevel: 'RED_ALERT',
    alertBadge: 'Red Alert',
    badgeColor: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900/60',
    headline: 'High Danger Cyclone Warning — Landfall Watch Activated',
    description: 'Severe gale force winds with torrential rainfall and dangerous tidal storm surges expected across northern and coastal Odisha corridors.',
    sdma: 'Odisha State Disaster Management Authority (OSDMA)',
    helpline: '1070 / 0674-2395398',
    emergencyNumber: '112',
    peakWind: '110-125 km/h',
    peakGusts: '140 km/h',
    pressure: '994 hPa',
    surge: '2.0 – 3.0 m',
    rainfall24h: 'Extremely Heavy (>204 mm)',
    eyeDistance: '210 km SSE of Dhamra Port',
    portSignal: 'Great Danger Signal No. 10 (Paradeep, Dhamra, Gopalpur)',
    sheltersActive: '1,240 Shelters Activated',
    evacuationCount: '650,000+ Citizens Sheltered',
    weatherSummary: 'Severe cyclonic circulation creating torrential rainfall bands, gale-force winds exceeding 110 km/h, and dangerous sea surface swells. Complete suspension of all offshore and near-shore operations.',
    districts: [
      {
        id: 'balasore',
        name: 'Balasore',
        alert: 'Red Alert',
        level: 'red',
        wind: '110-125 km/h',
        gusts: '140 km/h',
        rain: '240 mm',
        surge: '2.5 – 3.0 m',
        condition: 'Violent Gale & Heavy Inundation',
        status: 'Shelters 100% Operational',
        controlRoom: '06782-262261',
        stations: ['Chandipur Coast', 'Soro', 'Jaleswar', 'Remuna'],
        advisory: 'Low-lying areas within 5 km of coastline must complete mandatory evacuation before nightfall.'
      },
      {
        id: 'bhadrak',
        name: 'Bhadrak',
        alert: 'Red Alert',
        level: 'red',
        wind: '110-120 km/h',
        gusts: '135 km/h',
        rain: '220 mm',
        surge: '2.0 – 2.8 m',
        condition: 'Severe Gale & High Maritime Inflow',
        status: 'Evacuation in Progress',
        controlRoom: '06784-251201',
        stations: ['Dhamra Port', 'Basudevpur', 'Chandbali', 'Tihidi'],
        advisory: 'Dhamra port handling halted. NDRF battalion on round-the-clock patrol.'
      },
      {
        id: 'kendrapara',
        name: 'Kendrapara',
        alert: 'Red Alert',
        level: 'red',
        wind: '105-115 km/h',
        gusts: '130 km/h',
        rain: '210 mm',
        surge: '2.0 – 2.5 m',
        condition: 'Storm Surge Inundation Watch',
        status: 'Relocation Active',
        controlRoom: '06727-232145',
        stations: ['Rajnagar', 'Mahakalapada', 'Aul', 'Pattamundai'],
        advisory: 'Mangrove embankment breached areas fortified; backup diesel generators dispatched to medical centers.'
      },
      {
        id: 'jagatsinghpur',
        name: 'Jagatsinghpur',
        alert: 'Red Alert',
        level: 'red',
        wind: '100-115 km/h',
        gusts: '125 km/h',
        rain: '190 mm',
        surge: '1.8 – 2.3 m',
        condition: 'Rough Seas & High Astronomical Surge',
        status: 'Port Clear & High Vigil',
        controlRoom: '06722-220021',
        stations: ['Paradeep Port', 'Ersama', 'Naugaon', 'Balikuda'],
        advisory: 'Paradeep dock operations cleared; non-essential staff evacuated inland.'
      },
      {
        id: 'puri',
        name: 'Puri',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '85-100 km/h',
        gusts: '115 km/h',
        rain: '160 mm',
        surge: '1.2 – 1.8 m',
        condition: 'Heavy Rain & Maritime Squall',
        status: 'Beach Access Prohibited',
        controlRoom: '06752-223230',
        stations: ['Puri Town', 'Astaranga', 'Konark Marine Drive', 'Kakatpur'],
        advisory: 'Tourists ordered to remain in safe hotel shelters; sea bathing strictly banned.'
      },
      {
        id: 'ganjam',
        name: 'Ganjam',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '75-90 km/h',
        gusts: '105 km/h',
        rain: '140 mm',
        surge: '1.0 – 1.5 m',
        condition: 'Squally Winds & Downpours',
        status: 'Standby Rescue Boats',
        controlRoom: '06811-263700',
        stations: ['Gopalpur Port', 'Chhatrapur', 'Brahmapur', 'Khallikote'],
        advisory: 'Coastal roads monitored for flash flooding; relief stock pre-positioned.'
      },
      {
        id: 'cuttack',
        name: 'Cuttack',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '60-75 km/h',
        gusts: '90 km/h',
        rain: '110 mm',
        surge: 'Inland Drainage Watch',
        condition: 'Frequent Rain Gusts & Overcast',
        status: 'Municipal Drainage Monitored',
        controlRoom: '0671-2507842',
        stations: ['Cuttack City', 'Athagarh', 'Banki', 'Choudwar'],
        advisory: 'High-capacity dewatering pumps operational at river confluence points.'
      }
    ]
  },
  'west-bengal': {
    slug: 'west-bengal',
    name: 'West Bengal',
    hindiName: 'पश्चिम बंगाल',
    basin: 'Bay of Bengal',
    alertLevel: 'RED_ALERT',
    alertBadge: 'Red Alert',
    badgeColor: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900/60',
    headline: 'High Danger Coastal Alert — Sundarbans & Digha Corridor',
    description: 'Intense tidal surge and hurricane-gust patterns threatening coastal mud embankments in East Medinipur and South 24 Parganas.',
    sdma: 'West Bengal Disaster Management Department (WBDMA)',
    helpline: '1070 / 033-22143526',
    emergencyNumber: '112',
    peakWind: '90-110 km/h',
    peakGusts: '125 km/h',
    pressure: '996 hPa',
    surge: '1.5 – 2.5 m',
    rainfall24h: 'Heavy to Very Heavy (150-200 mm)',
    eyeDistance: '280 km South of Digha Coast',
    portSignal: 'Great Danger Signal No. 10 (Haldia & Kolkata Port)',
    sheltersActive: '820 Flood & Cyclone Centers Active',
    evacuationCount: '350,000+ Citizens Sheltered',
    weatherSummary: 'Heavy squalls sweeping across Gangetic delta with extreme sea swells. Flash flood risk along tidal rivers.',
    districts: [
      {
        id: 'east-medinipur',
        name: 'East Medinipur',
        alert: 'Red Alert',
        level: 'red',
        wind: '95-110 km/h',
        gusts: '125 km/h',
        rain: '200 mm',
        surge: '2.0 – 2.5 m',
        condition: 'Violent Sea Swells & Gale',
        status: 'Tourist Ban & Embankment Guard',
        controlRoom: '03228-263124',
        stations: ['Digha', 'Mandarmoni', 'Contai', 'Haldia Dock'],
        advisory: 'Sea wall patrolling active; coastal hotels instructed to shelter remaining visitors.'
      },
      {
        id: 'south-24-parganas',
        name: 'South 24 Parganas',
        alert: 'Red Alert',
        level: 'red',
        wind: '90-105 km/h',
        gusts: '120 km/h',
        rain: '180 mm',
        surge: '1.8 – 2.2 m',
        condition: 'Delta Inundation Alert',
        status: 'Sundarban Evacuation Active',
        controlRoom: '033-24791010',
        stations: ['Sagar Island', 'Gosaba', 'Kakdwip', 'Namkhana', 'Canning'],
        advisory: 'Ferry services across Muriganga completely suspended until further notice.'
      },
      {
        id: 'north-24-parganas',
        name: 'North 24 Parganas',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '75-90 km/h',
        gusts: '105 km/h',
        rain: '150 mm',
        surge: '1.0 – 1.5 m',
        condition: 'Heavy Rain & Strong Coastal Winds',
        status: 'Civil Defense Mobilized',
        controlRoom: '033-25846200',
        stations: ['Hingalganj', 'Sandeshkhali', 'Hasnabad', 'Basirhat'],
        advisory: 'River dyke reinforcement underway with geotextile sandbags.'
      },
      {
        id: 'howrah',
        name: 'Howrah',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '70-80 km/h',
        gusts: '95 km/h',
        rain: '130 mm',
        surge: 'River Hooghly High Swell',
        condition: 'Continuous Rain with Gusts',
        status: 'Pumping Stations on High Alert',
        controlRoom: '033-26383211',
        stations: ['Howrah City', 'Uluberia', 'Shyampur', 'Amta'],
        advisory: 'Low-lying urban wards monitored for water accumulation during high tide.'
      },
      {
        id: 'kolkata',
        name: 'Kolkata',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '65-80 km/h',
        gusts: '90 km/h',
        rain: '120 mm',
        surge: 'Urban Drainage Watch',
        condition: 'Intermittent Heavy Downpours',
        status: 'KMC Emergency Control Operational',
        controlRoom: '033-22861212',
        stations: ['Alipore IMD', 'Dum Dum', 'Salt Lake', 'Ballygunge'],
        advisory: 'Citizens advised to avoid parking vehicles under large roadside trees or hoardings.'
      }
    ]
  },
  'andhra-pradesh': {
    slug: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    hindiName: 'आंध्र प्रदेश',
    basin: 'Bay of Bengal',
    alertLevel: 'ORANGE_ALERT',
    alertBadge: 'Orange Alert',
    badgeColor: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-900/60',
    headline: 'Cyclone Preparedness Watch — North Coastal Corridor',
    description: 'Squally maritime winds with intense rainfall expected along Srikakulam, Vizianagaram, and Visakhapatnam coastal fringes.',
    sdma: 'Andhra Pradesh State Disaster Management Authority (APSDMA)',
    helpline: '1070 / 112 / 0863-2377018',
    emergencyNumber: '112',
    peakWind: '70-85 km/h',
    peakGusts: '100 km/h',
    pressure: '1001 hPa',
    surge: '0.8 – 1.5 m',
    rainfall24h: 'Heavy Rainfall (80-140 mm)',
    eyeDistance: '180 km East of Kalingapatnam',
    portSignal: 'Local Cautionary Signal No. 3 (Visakhapatnam, Gangavaram)',
    sheltersActive: '480 Multi-Hazard Shelters Ready',
    evacuationCount: '120,000+ Pre-positioned Relief Personnel',
    weatherSummary: 'Choppy seas with rising swell periods. Strong onshore gale squalls developing across northern sea boards.',
    districts: [
      {
        id: 'srikakulam',
        name: 'Srikakulam',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '75-85 km/h',
        gusts: '100 km/h',
        rain: '140 mm',
        surge: '1.0 – 1.5 m',
        condition: 'Squally Winds & High Surf',
        status: 'SDRF Teams Stationed',
        controlRoom: '08942-240557',
        stations: ['Kalingapatnam Port', 'Tekkali', 'Sompeta', 'Palasa', 'Ichchapuram'],
        advisory: 'Fishermen strictly advised not to venture into deep sea; all country craft moored.'
      },
      {
        id: 'vizianagaram',
        name: 'Vizianagaram',
        alert: 'Orange Alert',
        level: 'orange',
        wind: '70-80 km/h',
        gusts: '95 km/h',
        rain: '120 mm',
        surge: '0.8 – 1.2 m',
        condition: 'Heavy Rain & Wind Squall',
        status: 'Evacuation Routes Cleared',
        controlRoom: '08922-236947',
        stations: ['Bhogapuram', 'Pusapatirega', 'Vizianagaram Town'],
        advisory: 'Horticulture farmers advised to secure standing crops and nursery covers.'
      },
      {
        id: 'visakhapatnam',
        name: 'Visakhapatnam',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '60-70 km/h',
        gusts: '85 km/h',
        rain: '95 mm',
        surge: '0.5 – 1.0 m',
        condition: 'Choppy Seas & Rain Showers',
        status: 'Port Operations Calibrated',
        controlRoom: '0891-2560121',
        stations: ['RK Beach', 'Bheemunipatnam', 'Gangavaram Port', 'Gajuwaka'],
        advisory: 'Beach road vehicular movement restricted during high tide cycles.'
      },
      {
        id: 'anakapalli',
        name: 'Anakapalli',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '55-65 km/h',
        gusts: '80 km/h',
        rain: '80 mm',
        surge: '0.5 – 0.8 m',
        condition: 'Overcast & Rain Spells',
        status: 'Control Room on Standby',
        controlRoom: '08924-222300',
        stations: ['Nakkapalli', 'Atchutapuram SEZ', 'Payakaraopeta'],
        advisory: 'Industrial zones alerted to inspect backup power lines and drain paths.'
      },
      {
        id: 'kakinada',
        name: 'Kakinada',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '50-65 km/h',
        gusts: '75 km/h',
        rain: '70 mm',
        surge: '0.5 m',
        condition: 'Coastal Squall Watch',
        status: 'Deep Water Anchorage Monitored',
        controlRoom: '0884-2365506',
        stations: ['Kakinada Deepwater Port', 'Uppada Beach', 'Tallarevu'],
        advisory: 'Uppada geo-tube protection wall monitored by irrigation engineers.'
      }
    ]
  },
  gujarat: {
    slug: 'gujarat',
    name: 'Gujarat',
    hindiName: 'गुजरात',
    basin: 'Arabian Sea',
    alertLevel: 'YELLOW_WATCH',
    alertBadge: 'Yellow Watch',
    badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60',
    headline: 'Maritime Observation Watch — Saurashtra & Kutch',
    description: 'Precautionary surveillance active across Arabian Sea seaboard for localized convective squalls and sea roughness.',
    sdma: 'Gujarat State Disaster Management Authority (GSDMA)',
    helpline: '1070 / 079-23259283',
    emergencyNumber: '112',
    peakWind: '45-55 km/h',
    peakGusts: '65 km/h',
    pressure: '1005 hPa',
    surge: '0.5 m',
    rainfall24h: 'Light to Moderate (25-45 mm)',
    eyeDistance: '390 km SW of Jakhau Port',
    portSignal: 'Distant Cautionary Signal No. 1 (Kandla, Mundra, Okha)',
    sheltersActive: '210 Cyclone Shelters on Routine Standby',
    evacuationCount: 'Coastal Marine Police on High Alert',
    weatherSummary: 'Moderate sea conditions prevailing with periodic squally winds. Routine precautionary maritime advisories issued to ports and local salt-pan workers.',
    districts: [
      {
        id: 'kutch',
        name: 'Kutch Coast',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '45-55 km/h',
        gusts: '65 km/h',
        rain: '40 mm',
        surge: '0.5 m',
        condition: 'Moderate Swell & Gusty Breeze',
        status: 'Fishermen Advisory Active',
        controlRoom: '02832-250020',
        stations: ['Jakhau Port', 'Mandvi Beach', 'Mundra Port', 'Lakhpat'],
        advisory: 'Small fishing vessels advised not to proceed beyond 20 nautical miles from coastline.'
      },
      {
        id: 'devbhumi-dwarka',
        name: 'Devbhumi Dwarka',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '45-55 km/h',
        gusts: '60 km/h',
        rain: '35 mm',
        surge: '0.5 m',
        condition: 'Choppy Surf & Overcast Skies',
        status: 'Pilgrim & Port Advisory',
        controlRoom: '02833-232125',
        stations: ['Dwarka Temple Coast', 'Okha Port', 'Bet Dwarka Ferry'],
        advisory: 'Ferry boats between Okha and Bet Dwarka operated with reduced passenger caps.'
      },
      {
        id: 'porbandar',
        name: 'Porbandar',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '40-50 km/h',
        gusts: '58 km/h',
        rain: '30 mm',
        surge: '0.5 m',
        condition: 'Overcast & Occasional Showers',
        status: 'Harbour Vigil Maintained',
        controlRoom: '0286-2244860',
        stations: ['Porbandar Harbour', 'Madhavpur Ghed', 'Ranavav'],
        advisory: 'Signal hoists confirmed at all harbour watch towers.'
      },
      {
        id: 'jamnagar',
        name: 'Jamnagar',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '35-45 km/h',
        gusts: '50 km/h',
        rain: '20 mm',
        surge: 'Normal Tide',
        condition: 'Partly Cloudy with Coastal Breeze',
        status: 'Routine Coastal Monitoring',
        controlRoom: '0288-2553404',
        stations: ['Jamnagar City', 'Jodiya', 'Sikka Marine Port'],
        advisory: 'No immediate evacuation required; marine terminals under normal protocol.'
      },
      {
        id: 'gir-somnath',
        name: 'Gir Somnath',
        alert: 'Yellow Watch',
        level: 'yellow',
        wind: '35-45 km/h',
        gusts: '50 km/h',
        rain: '25 mm',
        surge: 'Normal Tide',
        condition: 'Moderate Coastal Breeze',
        status: 'Veraval Fishing Harbour Alert',
        controlRoom: '02876-285063',
        stations: ['Veraval Fishing Port', 'Somnath Beach', 'Kodinar'],
        advisory: 'Deep sea mechanized trawlers alerted via VHF radio channels.'
      }
    ]
  }
};

const StateWeather = () => {
  const { stateSlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, RED, ORANGE, YELLOW

  // Normalize slug or default to 'odisha'
  const currentSlug = useMemo(() => {
    if (!stateSlug) return 'odisha';
    const clean = stateSlug.toLowerCase().trim();
    if (STATE_DATA[clean]) return clean;
    if (clean.includes('odisha') || clean.includes('orissa')) return 'odisha';
    if (clean.includes('bengal')) return 'west-bengal';
    if (clean.includes('andhra')) return 'andhra-pradesh';
    if (clean.includes('gujarat')) return 'gujarat';
    return 'odisha';
  }, [stateSlug]);

  const stateInfo = STATE_DATA[currentSlug] || STATE_DATA.odisha;

  // Filter districts based on search input and alert severity
  const filteredDistricts = useMemo(() => {
    let list = stateInfo.districts || [];

    if (selectedFilter !== 'ALL') {
      list = list.filter(d => d.level.toUpperCase() === selectedFilter.toUpperCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) ||
        d.condition.toLowerCase().includes(q) ||
        d.advisory.toLowerCase().includes(q) ||
        d.stations.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [stateInfo, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-500">
      
      {/* =========================================================================
           TOP NAVIGATION BAR (ALWAYS AT TOP)
           ========================================================================= */}
      <header className="sticky top-0 z-[1000] w-full bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-neutral-800/80 transition-colors duration-500">
        {/* 2px National Tricolor Stripe */}
        <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
              title="Return to National Cyclone Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to National Portal</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">State Focus:</span>
              {/* Quick State Switcher Pills */}
              <div className="flex items-center gap-1.5">
                {[
                  { slug: 'odisha', name: 'Odisha' },
                  { slug: 'west-bengal', name: 'West Bengal' },
                  { slug: 'andhra-pradesh', name: 'Andhra Pradesh' },
                  { slug: 'gujarat', name: 'Gujarat' }
                ].map((st) => (
                  <button
                    key={st.slug}
                    onClick={() => {
                      setSearchQuery('');
                      navigate(`/state/${st.slug}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      currentSlug === st.slug
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/city-tracker')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <span>All 110+ Coastal Places</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <a
              href={`tel:${stateInfo.emergencyNumber}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Emergency: 112 / 1070</span>
            </a>
          </div>

        </div>
      </header>

      {/* =========================================================================
           STATE HERO SECTION & EXECUTIVE METEOROLOGICAL BRIEF
           ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-100/50 to-transparent dark:from-slate-900/40 dark:to-transparent border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Breadcrumb & Live Threat Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-slate-950 dark:hover:text-white font-medium">National Portal</Link>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-white">{stateInfo.name} Disaster Early Warning</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs ${stateInfo.badgeColor}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-400"></span>
              </span>
              <span>{stateInfo.alertBadge}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>{stateInfo.basin}</span>
            </div>
          </div>

          {/* Main Title & Executive Description */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-slate-950 dark:text-white">
              {stateInfo.name} <span className="text-slate-400 dark:text-slate-500 font-light text-2xl sm:text-3xl">({stateInfo.hindiName})</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium mt-2 max-w-4xl">
              {stateInfo.headline}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-4xl leading-relaxed">
              {stateInfo.description}
            </p>
          </div>

          {/* Key Meteorological Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
            
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-500" />
                <span>Peak Wind</span>
              </div>
              <div className="text-xl font-heading font-black text-slate-950 dark:text-white">
                {stateInfo.peakWind}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Gusts: {stateInfo.peakGusts}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Waves className="w-3.5 h-3.5 text-cyan-500" />
                <span>Storm Surge</span>
              </div>
              <div className="text-xl font-heading font-black text-slate-950 dark:text-white">
                {stateInfo.surge}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Above High Tide</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                <span>Rainfall Intensity</span>
              </div>
              <div className="text-xl font-heading font-black text-slate-950 dark:text-white truncate">
                {stateInfo.rainfall24h}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">24h Cumulative</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Vortex Distance</span>
              </div>
              <div className="text-sm font-heading font-bold text-slate-950 dark:text-white mt-1 leading-tight">
                {stateInfo.eyeDistance}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Estimated Bearing</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cyclone Shelters</span>
              </div>
              <div className="text-sm font-heading font-bold text-slate-950 dark:text-white mt-1 leading-tight">
                {stateInfo.sheltersActive}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">{stateInfo.evacuationCount}</span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                <Radio className="w-3.5 h-3.5 text-red-500" />
                <span>Port Warning</span>
              </div>
              <div className="text-sm font-heading font-bold text-red-600 dark:text-red-400 mt-1 leading-tight">
                {stateInfo.portSignal}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">IMD Marine Signal</span>
            </div>

          </div>

          {/* State Disaster Management Authority Helpline Banner */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-slate-950 dark:text-white font-bold block text-sm">{stateInfo.sdma}</strong>
                <span className="text-slate-500 dark:text-slate-400">State Emergency Operations Centre (SEOC) • Active 24/7 Red Alert Mode</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Toll-Free Control Room:</span>
              <a
                href={`tel:${stateInfo.helpline.split('/')[0].trim()}`}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-500" />
                <span>{stateInfo.helpline}</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
           DISTRICT SEARCH & DETAILED WEATHER / CYCLONE INTELLIGENCE
           ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        
        {/* Section Title & Live Interactive Search Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-950 dark:text-white">
              District Weather & Cyclone Impact Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Search by district name, coastal radar station, port, or city for granular meteorological details.
            </p>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${stateInfo.name} (e.g., ${stateInfo.districts[0]?.name}, ${stateInfo.districts[1]?.name || 'Port'})...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Severity Filter Chips & Search Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Alert Filter:</span>
            {[
              { id: 'ALL', label: 'All Districts' },
              { id: 'RED', label: 'Red Alert Only' },
              { id: 'ORANGE', label: 'Orange Alert' },
              { id: 'YELLOW', label: 'Yellow Watch' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredDistricts.length}</strong> of {stateInfo.districts.length} districts
          </span>
        </div>

        {/* District Detail Cards Grid */}
        {filteredDistricts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDistricts.map((dist) => {
              const isRed = dist.level === 'red';
              const isOrange = dist.level === 'orange';
              
              const borderTheme = isRed
                ? 'border-red-200 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-800'
                : isOrange
                ? 'border-orange-200 dark:border-orange-900/60 hover:border-orange-300 dark:hover:border-orange-800'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';

              const badgeTheme = isRed
                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : isOrange
                ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

              return (
                <div
                  key={dist.id}
                  className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between gap-4 ${borderTheme}`}
                >
                  
                  {/* Card Header: District Name & Severity Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-heading font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{dist.name}</span>
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeTheme}`}>
                        {dist.alert}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                      {dist.condition}
                    </p>
                  </div>

                  {/* 4 Micro Weather Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Sustained Wind</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{dist.wind}</strong>
                      <span className="text-[10px] text-slate-500 block">Gusts {dist.gusts}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Storm Surge</span>
                      <strong className="text-cyan-700 dark:text-cyan-400 font-bold">{dist.surge}</strong>
                      <span className="text-[10px] text-slate-500 block">Inundation Model</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Rainfall 24h</span>
                      <strong className="text-blue-700 dark:text-blue-400 font-bold">{dist.rain}</strong>
                      <span className="text-[10px] text-slate-500 block">Forecast Model</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Readiness</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{dist.status}</strong>
                      <span className="text-[10px] text-slate-500 block">District Admin</span>
                    </div>
                  </div>

                  {/* Monitored Coastal Stations & Cities */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Key Monitored Stations / Ports:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dist.stations.map((st, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specific Action Directive */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                    <span className="font-bold text-amber-950 dark:text-amber-200 block text-[11px] mb-0.5">
                      Operational Directive:
                    </span>
                    <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-300">
                      {dist.advisory}
                    </p>
                  </div>

                  {/* Local Helpline Button */}
                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      DEOC Control:
                    </span>
                    <a
                      href={`tel:${dist.controlRoom.replace('-', '')}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3 text-sky-500" />
                      <span>{dist.controlRoom}</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching districts found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No district or coastal station in {stateInfo.name} matched your query "{searchQuery}". Try searching for another town or clear your search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

      </section>

      {/* =========================================================================
           PUBLIC SAFETY PROTOCOLS & ACTION GUIDELINES
           ========================================================================= */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong className="text-slate-900 dark:text-white font-bold block">{stateInfo.name} State Disaster Management Authority</strong>
            <span>In coordination with India Meteorological Department (IMD) & MoES Government of India</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-950 dark:hover:text-white font-semibold cursor-pointer"
            >
              Back to Top ↑
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/')}
              className="hover:text-slate-950 dark:hover:text-white font-semibold cursor-pointer"
            >
              National Portal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default StateWeather;
