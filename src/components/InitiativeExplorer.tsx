import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Zap, 
  ChevronDown, 
  ArrowUpDown, 
  Compass, 
  Eye, 
  Building2, 
  Layers, 
  X,
  RotateCcw
} from 'lucide-react';
import { MasterInitiative, ActiveFilters, SmartComponentType, ImplementationStatus } from '../types';
import { getComponentColor, getStatusStyle, normalizeComponent } from '../utils/formatters';

interface InitiativeExplorerProps {
  initiatives: MasterInitiative[];
  filters: ActiveFilters;
  onFilterChange: (newFilters: Partial<ActiveFilters>) => void;
  onResetFilters: () => void;
  onSelectInitiative: (initiative: MasterInitiative) => void;
  onViewOnMap: (initiative: MasterInitiative) => void;
}

export const InitiativeExplorer: React.FC<InitiativeExplorerProps> = ({
  initiatives,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectInitiative,
  onViewOnMap
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Senarai agensi unik untuk dropdown filter: MESTI SATU AGENSI PER OPTION (Requirement C)
  // Pisahkan rentetan pelbagai agensi melalui koma / baris baharu, buang placeholder generic, dan susun mengikut abjad
  const uniqueAgencies = useMemo(() => {
    const agencyMap = new Map<string, string>(); // lowerKey -> trimmedProperName
    const genericPlaceholders = new Set([
      'semua agensi',
      'semua pihak berkepentingan',
      'tiada',
      'tiada data',
      'tidak dinyatakan'
    ]);

    initiatives.forEach(i => {
      if (!i.agensiUtama) return;
      // Pisahkan melalui koma atau baris baharu
      const parts = i.agensiUtama.split(/[,\n\r]+/);
      parts.forEach(p => {
        const trimmed = p.trim();
        const lower = trimmed.toLowerCase();
        if (!trimmed || genericPlaceholders.has(lower)) return;
        if (!agencyMap.has(lower)) {
          agencyMap.set(lower, trimmed);
        }
      });
    });

    return Array.from(agencyMap.values()).sort((a, b) => a.localeCompare(b));
  }, [initiatives]);

  // Senarai fasa unik
  const uniquePhases = useMemo(() => {
    const set = new Set<string>();
    initiatives.forEach(i => {
      if (i.fasaPelaksanaan) set.add(i.fasaPelaksanaan);
    });
    return Array.from(set).sort();
  }, [initiatives]);

  // Senarai tahap penarafan unik
  const uniqueRatings = useMemo(() => {
    const set = new Set<string>();
    initiatives.forEach(i => {
      if (i.tahapPenarafan) set.add(i.tahapPenarafan);
    });
    return Array.from(set).sort();
  }, [initiatives]);

  // Tapis inisiatif berdasarkan keadaan aktif
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter(item => {
      // 1. Carian teks
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchCode = item.kodInisiatif.toLowerCase().includes(q);
        const matchName = item.inisiatif.toLowerCase().includes(q);
        const matchOutcome = item.outcome ? item.outcome.toLowerCase().includes(q) : false;
        const matchAgency = item.agensiUtama.toLowerCase().includes(q);
        const matchSupport = item.agensiSokongan ? item.agensiSokongan.toLowerCase().includes(q) : false;
        if (!matchCode && !matchName && !matchOutcome && !matchAgency && !matchSupport) {
          return false;
        }
      }

      // 2. Komponen
      if (filters.selectedComponent && normalizeComponent(item.komponen) !== normalizeComponent(filters.selectedComponent)) {
        return false;
      }

      // 3. Status Pelaksanaan
      if (filters.selectedStatus && item.statusPelaksanaan !== filters.selectedStatus) {
        return false;
      }

      // 4. Fast Track
      if (filters.fastTrackOnly && !item.isFastTrack) {
        return false;
      }

      // 5. Agensi Utama (Tapis inisiatif di mana agensi yang dipilih adalah ahli dalam DATA.Agensi Utama)
      if (filters.selectedMainAgency) {
        const selLower = filters.selectedMainAgency.toLowerCase().trim();
        const itemAgencies = (item.agensiUtama || '')
          .split(/[,\n\r]+/)
          .map(a => a.toLowerCase().trim());
        if (!itemAgencies.includes(selLower)) {
          return false;
        }
      }

      // 6. Fasa Pelaksanaan
      if (filters.selectedPhase && item.fasaPelaksanaan !== filters.selectedPhase) {
        return false;
      }

      // 7. Tahap Penarafan
      if (filters.selectedRatingLevel && item.tahapPenarafan !== filters.selectedRatingLevel) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Susunan
      let compA: any = a[filters.sortBy === 'kod' ? 'kodInisiatif' : filters.sortBy === 'nama' ? 'inisiatif' : filters.sortBy === 'status' ? 'statusPelaksanaan' : filters.sortBy === 'komponen' ? 'komponen' : 'peratusKemajuan'];
      let compB: any = b[filters.sortBy === 'kod' ? 'kodInisiatif' : filters.sortBy === 'nama' ? 'inisiatif' : filters.sortBy === 'status' ? 'statusPelaksanaan' : filters.sortBy === 'komponen' ? 'komponen' : 'peratusKemajuan'];

      if (filters.sortBy === 'kemajuan') {
        compA = a.peratusKemajuan ?? -1;
        compB = b.peratusKemajuan ?? -1;
      }

      if (compA < compB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (compA > compB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [initiatives, filters]);

  const isFiltered = 
    filters.searchQuery !== '' || 
    filters.selectedComponent !== null || 
    filters.selectedStatus !== null || 
    filters.fastTrackOnly || 
    filters.selectedMainAgency !== null ||
    filters.selectedPhase !== null ||
    filters.selectedRatingLevel !== null;

  return (
    <section id="inisiatif" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
            Katalog Tindakan Negeri
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            INISIATIF PELAN INDUK
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Menunjukkan <span className="font-bold text-[#171717]">{filteredInitiatives.length}</span> daripada <span className="font-bold text-[#171717]">{initiatives.length}</span> inisiatif rasmi.
          </p>
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Tapisan</span>
          </button>
        )}
      </div>

      {/* Main Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8B6C8]/40 shadow-xs mb-8 space-y-4">
        
        {/* Top Search Input & Quick Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Cari kod, inisiatif, outcome atau agensi..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#46B7B0] transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Component Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={filters.selectedComponent || ''}
              onChange={(e) => onFilterChange({ selectedComponent: e.target.value || null })}
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#46B7B0] font-medium"
            >
              <option value="">Semua Komponen</option>
              <option value="Smart Government">Smart Government</option>
              <option value="Smart Economy">Smart Economy</option>
              <option value="Smart Environment">Smart Environment</option>
              <option value="Smart Mobility">Smart Mobility</option>
              <option value="Smart People">Smart People</option>
              <option value="Smart Digital Infrastructure">Smart Digital Infrastructure</option>
              <option value="Smart Living">Smart Living</option>
            </select>
          </div>

          {/* Quick Status Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={filters.selectedStatus || ''}
              onChange={(e) => onFilterChange({ selectedStatus: (e.target.value as ImplementationStatus) || null })}
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#46B7B0] font-medium"
            >
              <option value="">Semua Status</option>
              <option value="Siap">Siap</option>
              <option value="Dalam Pelaksanaan">Dalam Pelaksanaan</option>
              <option value="Belum Mula">Belum Mula</option>
              <option value="Ditangguh">Ditangguh</option>
            </select>
          </div>

          {/* Fast Track Toggle Button */}
          <button
            onClick={() => onFilterChange({ fastTrackOnly: !filters.fastTrackOnly })}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filters.fastTrackOnly
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${filters.fastTrackOnly ? 'fill-white' : 'text-amber-500'}`} />
            <span>Fast Track</span>
          </button>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50 border border-stone-200 rounded-xl transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Penapis Lanjutan</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Collapsible Advanced Filters & Sorting */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            {/* Filter Agensi Utama */}
            <div>
              <label className="block font-bold text-stone-600 mb-1">Agensi Utama</label>
              <select
                value={filters.selectedMainAgency || ''}
                onChange={(e) => onFilterChange({ selectedMainAgency: e.target.value || null })}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              >
                <option value="">Semua Agensi</option>
                {uniqueAgencies.map(ag => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>

            {/* Filter Fasa */}
            <div>
              <label className="block font-bold text-stone-600 mb-1">Fasa Pelaksanaan</label>
              <select
                value={filters.selectedPhase || ''}
                onChange={(e) => onFilterChange({ selectedPhase: e.target.value || null })}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              >
                <option value="">Semua Fasa</option>
                {uniquePhases.map(ph => (
                  <option key={ph} value={ph}>{ph}</option>
                ))}
              </select>
            </div>

            {/* Filter Tahap Penarafan */}
            <div>
              <label className="block font-bold text-stone-600 mb-1">Tahap Penarafan</label>
              <select
                value={filters.selectedRatingLevel || ''}
                onChange={(e) => onFilterChange({ selectedRatingLevel: e.target.value || null })}
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              >
                <option value="">Semua Penarafan</option>
                {uniqueRatings.map(rt => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </select>
            </div>

            {/* Susun Mengikut */}
            <div>
              <label className="block font-bold text-stone-600 mb-1">Susun Mengikut</label>
              <div className="flex items-center gap-1">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                >
                  <option value="kod">Kod Inisiatif</option>
                  <option value="nama">Nama Inisiatif</option>
                  <option value="kemajuan">Peratus Kemajuan</option>
                  <option value="status">Status Pelaksanaan</option>
                  <option value="komponen">Komponen</option>
                </select>
                <button
                  onClick={() => onFilterChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-100"
                  title="Tukar Arah Susunan"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Initiatives Card Grid */}
      {filteredInitiatives.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800">Tiada Inisiatif Dijumpai</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
            Tiada rekod inisiatif yang sepadan dengan tapisan semasa. Sila cuba tukar kata kunci carian atau tetapkan semula tapisan.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-[#46B7B0] hover:bg-[#369b95] text-white text-xs font-bold rounded-xl transition-all"
          >
            Reset Semua Tapisan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInitiatives.map((item) => {
            const compColor = getComponentColor(item.komponen);
            const statusStyle = getStatusStyle(item.statusPelaksanaan);

            return (
              <div
                key={item.compositeKey}
                className="card-premium p-6 flex flex-col justify-between bg-white relative overflow-hidden group hover:border-[#46B7B0]"
              >
                {/* Top Accent Strip */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5" 
                  style={{ backgroundColor: compColor.hex }} 
                />

                <div>
                  {/* Card Header: Code & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span 
                      className="text-xs font-black px-2.5 py-1 rounded-lg tracking-wider uppercase"
                      style={{ backgroundColor: `${compColor.lightHex}40`, color: compColor.hex }}
                    >
                      {item.kodInisiatif}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.isFastTrack && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                          <span>FT</span>
                        </span>
                      )}
                      
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusStyle.badgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        <span>{statusStyle.text}</span>
                      </span>
                    </div>
                  </div>

                  {/* Component Category */}
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                    {normalizeComponent(item.komponen)}
                  </div>

                  {/* Initiative Title */}
                  <h3 className="text-base font-extrabold text-[#171717] leading-snug group-hover:text-[#46B7B0] transition-colors mb-3 line-clamp-2">
                    {item.inisiatif}
                  </h3>

                  {/* Lead Agency */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium mb-4">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{item.agensiUtama}</span>
                  </div>

                  {/* Progress Bar (0%, 25%, 60%, 100%) */}
                  <div className="space-y-1 mb-5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-stone-500">Kemajuan</span>
                      <span className="text-[#171717]">
                        {item.peratusKemajuan !== null ? `${item.peratusKemajuan}%` : 'Belum Dikemas Kini'}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${item.peratusKemajuan ?? 0}%`,
                          backgroundColor: item.peratusKemajuan !== null ? compColor.hex : '#D1D5DB'
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400 font-medium">
                    {item.fasaPelaksanaan}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.hasCoordinates && (
                      <button
                        onClick={() => onViewOnMap(item)}
                        className="p-1.5 text-stone-500 hover:text-[#46B7B0] hover:bg-[#9EDBD7]/20 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Dalam Smart Map"
                      >
                        <Compass className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onSelectInitiative(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF9F3] hover:bg-[#9EDBD7]/30 text-[#171717] font-bold text-xs rounded-xl border border-[#46B7B0]/50 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#46B7B0]" />
                      <span>LIHAT BUTIRAN</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
