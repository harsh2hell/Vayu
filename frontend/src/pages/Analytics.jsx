import React, { useState, useEffect } from 'react';
import { 
  Search, Download, 
  MapPin, ShieldCheck
} from 'lucide-react';
import { fetchAllCyclones } from '../services/api';
import PageHeader from '../components/PageHeader';

const Analytics = () => {
  const [cyclones, setCyclones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [basinFilter, setBasinFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStorm, setSelectedStorm] = useState(null);

  useEffect(() => {
    const loadCyclones = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllCyclones();
        if (data && Array.isArray(data)) {
          setCyclones(data);
          if (data.length > 0) {
            setSelectedStorm(data[0]);
          }
        }
      } catch (err) {
        console.error('[Archives Page Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCyclones();
  }, []);

  const filtered = cyclones.filter(c => {
    const matchesBasin = basinFilter === 'ALL' || c.basin === basinFilter;
    const matchesSearch = searchQuery === '' || 
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.season && c.season.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBasin && matchesSearch;
  });

  const handleExportCsv = () => {
    if (!filtered || filtered.length === 0) return;
    const headers = ['Name', 'Season', 'Basin', 'Category', 'Peak Winds (km/h)', 'Lowest MSLP (hPa)', 'Landfall Location'];
    const rows = filtered.map(c => [
      `"${c.name}"`,
      `"${c.season}"`,
      `"${c.basin}"`,
      `"${c.category}"`,
      c.peak_intensity_kmh,
      c.lowest_mslp_hpa,
      `"${c.landfall_location || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VAYU_IBTrACS_Storm_Reference_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12 font-sans">
      
      {/* Standard Unified Header */}
      <PageHeader
        categoryBadge="HISTORICAL • IBTrACS ARCHIVE"
        categoryColor="slate"
        modelBadge="NOAA / IMD Ground Truth"
        title="Historical Storm Reference & IBTrACS Archive"
        subtitle="Official North Indian Ocean tropical cyclone track records and meteorological ground truth database."
        actions={
          <button 
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Main Grid: Storm List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Cyclone Database Table & Search (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Ground Truth Records ({filtered.length})
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Basin Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
                {['ALL', 'Bay of Bengal', 'Arabian Sea'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBasinFilter(b)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      basinFilter === b 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {b === 'ALL' ? 'All Basins' : b}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, season..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white w-40"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {isLoading ? (
              <div className="p-10 text-center text-xs text-slate-500 font-mono">
                Querying IBTrACS database records...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No historical records match the selected query.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-medium">Cyclone Name</th>
                    <th className="py-3 px-4 font-medium">Season</th>
                    <th className="py-3 px-4 font-medium">Basin</th>
                    <th className="py-3 px-4 font-medium">Classification</th>
                    <th className="py-3 px-4 font-medium">Peak Winds</th>
                    <th className="py-3 px-4 font-medium">Min MSLP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {filtered.map((c) => {
                    const isSelected = selectedStorm?.id === c.id;
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedStorm(c)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-slate-100/60 dark:bg-slate-800/60 font-semibold' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-2.5 px-4 text-slate-900 dark:text-white font-semibold flex items-center gap-1.5 font-sans">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />}
                          {c.name}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-sans">{c.season}</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-sans">{c.basin}</td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-900 dark:text-white font-semibold">
                          {c.peak_intensity_kmh} km/h
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                          {c.lowest_mslp_hpa} hPa
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Detailed Storm Dossier Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Historical Dossier Details</h3>
              </div>
              {selectedStorm && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedStorm.system_id} • BEST TRACK
                </span>
              )}
            </div>

            {selectedStorm ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedStorm.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedStorm.season} • {selectedStorm.basin}</p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-semibold font-mono tracking-wider block text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-300/60 dark:border-slate-600 w-fit">
                    OBSERVED / BEST TRACK REFERENCE DATA
                  </span>
                  <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-slate-500 dark:text-slate-400">Official IMD Category:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedStorm.category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-slate-500 dark:text-slate-400">Peak Sustained Winds:</span>
                    <span className="font-semibold font-mono text-slate-900 dark:text-white">
                      {selectedStorm.peak_intensity_kmh} km/h ({selectedStorm.peak_intensity_knots} kt)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/40 dark:border-slate-700/40">
                    <span className="text-slate-500 dark:text-slate-400">Central Pressure (MSLP):</span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{selectedStorm.lowest_mslp_hpa} hPa</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Dvorak Intensity Rating:</span>
                    <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{selectedStorm.dvorak_ci || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Landfall Location & Time:</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                        {selectedStorm.landfall_location || 'Did not make landfall (open ocean dissipation)'}
                      </p>
                      {selectedStorm.landfall_time && (
                        <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                          Landfall Time: {selectedStorm.landfall_time}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedStorm.surge_height_m && (
                    <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Peak Coastal Storm Surge:</span>
                      <span className="font-semibold font-mono text-slate-900 dark:text-white">{selectedStorm.surge_height_m}</span>
                    </div>
                  )}

                  {selectedStorm.description && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Meteorological Summary:</span>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        {selectedStorm.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Select a cyclone record from the left table to inspect the historical ground truth dossier.
              </div>
            )}
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Ground Truth Data Source
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Records are sourced from the International Best Track Archive for Climate Stewardship (IBTrACS v04r00) maintained by NOAA NCEI and validated against the India Meteorological Department (IMD) RSMC New Delhi archives.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;
