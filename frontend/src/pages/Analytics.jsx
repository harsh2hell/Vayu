import React, { useState, useEffect } from 'react';
import { 
  Database, Search, Filter, Download, 
  MapPin, Wind, Gauge, Calendar, 
  ShieldCheck, Info, ChevronRight, ExternalLink
} from 'lucide-react';
import { fetchAllCyclones } from '../services/api';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';

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

  const getCategoryBadge = (cat = '') => {
    if (cat.includes('Super')) return 'badge-red';
    if (cat.includes('Extremely') || cat.includes('Very Severe')) return 'badge-orange';
    if (cat.includes('Severe')) return 'badge-amber';
    return 'badge-blue';
  };

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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Database className="w-6 h-6 text-[#003087]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Historical Storm Reference & IBTrACS Archive
            </h1>
            <DataTypeBadge type="historical" label="NOAA IBTrACS ARCHIVE" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Official North Indian Ocean tropical cyclone track records and meteorological ground truth database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="btn-secondary text-xs py-2 px-3.5 gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Storm List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Cyclone Database Table & Search (7 Cols) */}
        <div className="lg:col-span-7 card overflow-hidden flex flex-col">
          <div className="card-header bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ground Truth Records ({filtered.length})
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Basin Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                {['ALL', 'Bay of Bengal', 'Arabian Sea'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBasinFilter(b)}
                    className={`px-2.5 py-1 rounded font-medium transition-all ${
                      basinFilter === b ? 'bg-white text-[#003087] shadow-xs' : 'text-slate-500 hover:text-slate-800'
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
                  className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#003087] w-40"
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
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Cyclone Name</th>
                    <th className="py-2.5 px-4 font-semibold">Season</th>
                    <th className="py-2.5 px-4 font-semibold">Basin</th>
                    <th className="py-2.5 px-4 font-semibold">Classification</th>
                    <th className="py-2.5 px-4 font-semibold">Peak Winds</th>
                    <th className="py-2.5 px-4 font-semibold">Min MSLP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const isSelected = selectedStorm?.id === c.id;
                    return (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedStorm(c)}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-4 text-slate-900 font-bold flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#003087]" />}
                          {c.name}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{c.season}</td>
                        <td className="py-2.5 px-4 text-slate-600">{c.basin}</td>
                        <td className="py-2.5 px-4">
                          <span className={`badge ${getCategoryBadge(c.category)} text-[10px]`}>
                            {c.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-red-600 font-mono font-bold">
                          {c.peak_intensity_kmh} km/h
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-mono">
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
          
          <div className="card p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Historical Dossier Details</h3>
              </div>
              {selectedStorm && (
                <span className="badge badge-navy text-[10px] font-mono">
                  {selectedStorm.system_id}
                </span>
              )}
            </div>

            {selectedStorm ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedStorm.name}</h2>
                  <p className="text-xs text-slate-500">{selectedStorm.season} • {selectedStorm.basin}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official IMD Category:</span>
                    <span className="font-bold text-slate-900">{selectedStorm.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peak Sustained Winds:</span>
                    <span className="font-bold font-mono text-red-600">
                      {selectedStorm.peak_intensity_kmh} km/h ({selectedStorm.peak_intensity_knots} kt)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Central Pressure (MSLP):</span>
                    <span className="font-bold font-mono text-slate-800">{selectedStorm.lowest_mslp_hpa} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dvorak Intensity Rating:</span>
                    <span className="font-bold font-mono text-sky-800">{selectedStorm.dvorak_ci || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Landfall Location & Time:</span>
                      <p className="text-slate-600 mt-0.5">
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
                    <div className="flex justify-between py-1 border-t border-slate-100">
                      <span className="text-slate-500">Peak Coastal Storm Surge:</span>
                      <span className="font-bold font-mono text-red-700">{selectedStorm.surge_height_m}</span>
                    </div>
                  )}

                  {selectedStorm.description && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Meteorological Summary:</span>
                      <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
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

          <div className="card p-4 bg-slate-50 border-slate-200 text-xs text-slate-600 space-y-1.5">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Ground Truth Data Source
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Records are sourced from the International Best Track Archive for Climate Stewardship (IBTrACS v04r00) maintained by NOAA NCEI and validated against the India Meteorological Department (IMD) RSMC New Delhi archives.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;
