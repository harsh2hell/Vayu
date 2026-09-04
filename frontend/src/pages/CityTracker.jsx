import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowUpRight, Search, MapPin, 
  PhoneCall, Filter
} from 'lucide-react';
import { COASTAL_CITIES_DATA } from '../data/coastalCitiesData';

const STATE_OPTIONS = [
  { id: 'ALL', name: 'All States & UTs' },
  { id: 'Odisha', name: 'Odisha' },
  { id: 'West Bengal', name: 'West Bengal' },
  { id: 'Andhra Pradesh', name: 'Andhra Pradesh' },
  { id: 'Tamil Nadu', name: 'Tamil Nadu' },
  { id: 'Gujarat', name: 'Gujarat' },
  { id: 'Maharashtra', name: 'Maharashtra' },
  { id: 'Goa', name: 'Goa' },
  { id: 'Kerala', name: 'Kerala' },
  { id: 'Karnataka', name: 'Karnataka' },
  { id: 'Puducherry', name: 'Puducherry' },
  { id: 'Andaman & Nicobar Islands', name: 'Andaman & Nicobar' },
  { id: 'Lakshadweep', name: 'Lakshadweep' }
];

const CityTracker = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL'); // ALL, HOTSPOT, TRENDING, RED, ORANGE, PORTS

  // Filter 100+ cities based on search, state, and category
  const filteredCities = useMemo(() => {
    return COASTAL_CITIES_DATA.filter((place) => {
      // State filter
      if (selectedState !== 'ALL' && place.state !== selectedState) {
        return false;
      }

      // Category / Tag filter
      if (activeCategoryFilter === 'HOTSPOT' && !place.isDangerHotspot) {
        return false;
      }
      if (activeCategoryFilter === 'TRENDING' && !place.isTrending) {
        return false;
      }
      if (activeCategoryFilter === 'RED' && place.level !== 'red') {
        return false;
      }
      if (activeCategoryFilter === 'ORANGE' && place.level !== 'orange') {
        return false;
      }
      if (activeCategoryFilter === 'PORTS' && !place.category.toLowerCase().includes('port')) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = place.name.toLowerCase().includes(q);
        const matchesState = place.state.toLowerCase().includes(q);
        const matchesCategory = place.category.toLowerCase().includes(q);
        const matchesHistory = place.historicalEvent.toLowerCase().includes(q);
        return matchesName || matchesState || matchesCategory || matchesHistory;
      }

      return true;
    });
  }, [selectedState, activeCategoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-500">
      
      {/* =========================================================================
           TOP APEX NAVIGATION BAR (ALWAYS AT TOP)
           ========================================================================= */}
      <header className="sticky top-0 z-[1000] w-full bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-neutral-800/80 transition-colors duration-500">
        {/* 2px National Tricolor Stripe */}
        <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all text-xs font-semibold cursor-pointer shadow-2xs"
              title="Return to National Cyclone Portal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to National Portal</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                City & Coastal Watch
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                110+ Locations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Open Public Intelligence • Zero Login Required</span>
            </div>

            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>Helpline: 112</span>
            </a>
          </div>

        </div>
      </header>

      {/* =========================================================================
           SEARCH & BROWSE 100+ COASTAL CITIES & DANGER DIRECTORY
           ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        
        {/* Search & State Selector Controls Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-950 dark:text-white">
                National Coastal Directory (110+ Monitored Places)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Select your state or search below to inspect any city, port, island, or historical cyclone landfall hub.
              </p>
            </div>

            {/* Instant Search Box */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, port, beach (e.g. Balasore, Digha, Mundra, Puri)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* State Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>State:</span>
            </span>
            {STATE_OPTIONS.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedState(st.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedState === st.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>

          {/* Special Category & Severity Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter by:</span>
              {[
                { id: 'ALL', label: 'All Places' },
                { id: 'HOTSPOT', label: '🔥 Landfall Hotspots' },
                { id: 'TRENDING', label: '⚡ Trending Threat' },
                { id: 'RED', label: '🔴 Red Alert' },
                { id: 'ORANGE', label: '🟠 Orange Alert' },
                { id: 'PORTS', label: '⚓ Commercial & Fishing Ports' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveCategoryFilter(f.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeCategoryFilter === f.id
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <strong className="text-slate-900 dark:text-white">{filteredCities.length}</strong> locations
            </span>
          </div>

        </div>

        {/* Directory Grid of 100+ Coastal Places */}
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((item) => {
              const isRed = item.level === 'red';
              const isOrange = item.level === 'orange';
              const isSelected = item.id === selectedCityId;

              const borderTheme = isSelected
                ? 'border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 shadow-md'
                : isRed
                ? 'border-red-200 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-700'
                : isOrange
                ? 'border-orange-200 dark:border-orange-900/60 hover:border-orange-300 dark:hover:border-orange-700'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';

              const badgeTheme = isRed
                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : isOrange
                ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                : item.level === 'yellow'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/state/${item.stateSlug}`)}
                  className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 group ${borderTheme}`}
                  title={`Click to open full weather & cyclone intelligence for ${item.state}`}
                >
                  
                  {/* Card Header: Location Name & Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        <h3 className="text-lg font-heading font-black text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeTheme}`}>
                        {item.alert}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.state}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </div>
                  </div>

                  {/* Micro Weather Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Wind</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{item.wind}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Vortex Fix</span>
                      <strong className="text-slate-900 dark:text-white font-bold truncate block">{item.distToEye}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Surge</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{item.surge}</strong>
                    </div>
                  </div>

                  {/* Historical Landmark Cyclone Tag */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Cyclone Record: </span>
                    <span>{item.historicalEvent}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-sky-600 dark:text-sky-400 font-bold text-[11px] flex items-center gap-1">
                      <span>Click to Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/state/${item.stateSlug}`);
                      }}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold text-[11px] transition-colors"
                    >
                      {item.state} Page →
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching locations found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No coastal city or port matched your filter "{searchQuery}". Try selecting another state or clear your search input.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('ALL');
                setActiveCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </section>

      {/* =========================================================================
           PUBLIC FOOTER
           ========================================================================= */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong className="text-slate-900 dark:text-white font-bold block">
              National Coastal Cyclone & Weather Intelligence Directory
            </strong>
            <span>Government of India • Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)</span>
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

export default CityTracker;
