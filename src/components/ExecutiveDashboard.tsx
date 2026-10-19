import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PauseCircle, 
  Zap, 
  Building2, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  FileCheck2, 
  FileText, 
  RotateCcw
} from 'lucide-react';
import { PortalKpiSummary, ActiveFilters, ImplementationStatus } from '../types';
import { formatCurrency, formatCurrencyCompact, formatNumber } from '../utils/formatters';

interface ExecutiveDashboardProps {
  kpi: PortalKpiSummary;
  agencyStatusSummary: {
    telahHantar: number;
    draf: number;
    belumHantar?: number;
    totalAgencies: number;
  };
  filters: ActiveFilters;
  onFilterChange: (newFilters: Partial<ActiveFilters>) => void;
  onResetFilters: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  kpi,
  agencyStatusSummary,
  filters,
  onFilterChange,
  onResetFilters,
  onNavigateToSection
}) => {
  const isFiltered = 
    filters.selectedStatus !== null || 
    filters.selectedComponent !== null || 
    filters.fastTrackOnly || 
    filters.selectedMainAgency !== null ||
    filters.searchQuery !== '';

  const handleStatusClick = (status: ImplementationStatus) => {
    if (filters.selectedStatus === status) {
      onFilterChange({ selectedStatus: null });
    } else {
      onFilterChange({ selectedStatus: status });
      onNavigateToSection('inisiatif');
    }
  };

  const handleFastTrackClick = () => {
    onFilterChange({ fastTrackOnly: !filters.fastTrackOnly });
    onNavigateToSection('inisiatif');
  };

  const handleAgencyStatusClick = () => {
    onNavigateToSection('prestasi-agensi');
  };

  return (
    <section id="ringkasan" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Header & Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Papan Pemuka Prestasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            RINGKASAN EKSEKUTIF
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Petunjuk Prestasi Utama (KPI) pelaksanaan Pelan Induk Bandar Pintar Negeri Sembilan 2040.
          </p>
        </div>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TAPISAN</span>
          </button>
        )}
      </div>

      {/* Row 1: Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        
        {/* Total Initiatives */}
        <div 
          onClick={() => onNavigateToSection('inisiatif')}
          className="card-premium p-5 cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase">Jumlah Inisiatif</span>
            <Layers className="w-4 h-4 text-[#46B7B0]" />
          </div>
          <div className="text-3xl font-black text-[#171717]">{formatNumber(kpi.totalInitiatives)}</div>
          <div className="text-[11px] text-[#5F6368] mt-1 font-medium">Merentasi 7 Komponen</div>
        </div>

        {/* Average Progress */}
        <div 
          className="card-premium p-5 bg-gradient-to-br from-[#9EDBD7]/20 to-white border-[#46B7B0]/40"
          title={`Berdasarkan ${kpi.totalInitiatives - (kpi.noDataCount || 0)} inisiatif yang mempunyai data kemajuan sah dalam LATEST_STATUS.`}
        >
          <div className="flex items-center justify-between text-teal-800 mb-2">
            <span className="text-xs font-bold uppercase">Purata Kemajuan</span>
            <TrendingUp className="w-4 h-4 text-[#46B7B0]" />
          </div>
          <div className="text-3xl font-black text-[#1d6d68]">{kpi.averageProgress}%</div>
          <div className="w-full bg-teal-100/60 rounded-full h-2 mt-2 overflow-hidden">
            <div 
              className="bg-[#46B7B0] h-full rounded-full transition-all duration-700" 
              style={{ width: `${kpi.averageProgress}%` }} 
            />
          </div>
          <div className="text-[10px] text-teal-700 mt-2 font-medium">
            Berdasarkan inisiatif dengan data kemajuan sah dalam LATEST_STATUS
          </div>
        </div>

        {/* Fast Track Clickable */}
        <div 
          onClick={handleFastTrackClick}
          className={`card-premium p-5 cursor-pointer transition-all ${
            filters.fastTrackOnly 
              ? 'ring-2 ring-amber-500 bg-amber-50/50' 
              : 'hover:border-amber-400 bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase">Fast Track (FT)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-900">{formatNumber(kpi.fastTrackCount)}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">Inisiatif Fast Track</div>
        </div>

        {/* Total Agencies - JUMLAH AGENSI DALAM PEMANTAUAN (Requirement 4 & 16) */}
        <div 
          onClick={() => onNavigateToSection('prestasi-agensi')}
          className="card-premium p-5 cursor-pointer bg-white"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-tight text-stone-600">Jumlah Agensi Dalam Pemantauan</span>
            <Building2 className="w-4 h-4 text-[#C7B9DB]" />
          </div>
          <div className="text-3xl font-black text-[#171717]">{formatNumber(kpi.totalAgencies)}</div>
          <div className="text-[11px] text-[#5F6368] mt-1 font-medium">Telah Hantar & Draf</div>
        </div>

        {/* Total Cost with Compact formatting & No Overflow (Requirement 9 & 10) */}
        <div className="card-premium p-5 bg-white col-span-2 sm:col-span-1 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-tight text-stone-600">Jumlah Anggaran Kos</span>
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div 
              className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight truncate"
              title={kpi.totalCost ? formatCurrency(kpi.totalCost) : 'Tiada Data'}
            >
              {formatCurrencyCompact(kpi.totalCost)}
            </div>
            {kpi.totalCost !== null && kpi.totalCost > 0 && (
              <div className="text-[10px] text-stone-500 font-bold truncate mt-0.5">
                {formatCurrency(kpi.totalCost)}
              </div>
            )}
          </div>
          <div className="text-[10px] text-stone-500 mt-2 font-medium leading-tight">
            Berdasarkan kos terkini yang telah dihantar
          </div>
        </div>
      </div>

      {/* Row 2: Implementation Status Cards (All Clickable to Filter) */}
      <div className="mb-6">
        <div className="text-xs font-extrabold uppercase tracking-wider text-[#5F6368] mb-3">
          Status Pelaksanaan Inisiatif (Klik untuk Tapis)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Siap */}
          <button
            onClick={() => handleStatusClick('Siap')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              filters.selectedStatus === 'Siap'
                ? 'bg-emerald-100 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                : 'bg-white hover:bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-xs font-bold uppercase">Siap</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950">{formatNumber(kpi.completedCount)}</div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">100% Selesai Dilaksana</div>
          </button>

          {/* Dalam Pelaksanaan */}
          <button
            onClick={() => handleStatusClick('Dalam Pelaksanaan')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              filters.selectedStatus === 'Dalam Pelaksanaan'
                ? 'bg-teal-100 border-teal-500 shadow-md ring-2 ring-teal-400'
                : 'bg-white hover:bg-teal-50/50 border-teal-200'
            }`}
          >
            <div className="flex items-center justify-between text-teal-700 mb-1">
              <span className="text-xs font-bold uppercase">Dalam Pelaksanaan</span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-teal-950">{formatNumber(kpi.inProgressCount)}</div>
            <div className="text-[11px] text-teal-700 mt-1 font-medium">Sedang Giat Berjalan</div>
          </button>

          {/* Belum Mula */}
          <button
            onClick={() => handleStatusClick('Belum Mula')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              filters.selectedStatus === 'Belum Mula'
                ? 'bg-stone-200 border-stone-500 shadow-md ring-2 ring-stone-400'
                : 'bg-white hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between text-stone-600 mb-1">
              <span className="text-xs font-bold uppercase">Belum Mula</span>
              <AlertCircle className="w-4 h-4 text-stone-500" />
            </div>
            <div className="text-3xl font-black text-stone-900">{formatNumber(kpi.notStartedCount)}</div>
            <div className="text-[11px] text-stone-600 mt-1 font-medium">Peringkat Perancangan</div>
          </button>

          {/* Ditangguh */}
          <button
            onClick={() => handleStatusClick('Ditangguh')}
            className={`p-4 rounded-2xl text-left transition-all border cursor-pointer ${
              filters.selectedStatus === 'Ditangguh'
                ? 'bg-amber-100 border-amber-500 shadow-md ring-2 ring-amber-400'
                : 'bg-white hover:bg-amber-50/50 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-xs font-bold uppercase">Ditangguh</span>
              <PauseCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-950">{formatNumber(kpi.delayedCount)}</div>
            <div className="text-[11px] text-amber-700 mt-1 font-medium">Perlu Semakan Semula</div>
          </button>
        </div>
      </div>

      {/* Row 3: Agency Submission Monitoring (FORM_STATUS - Requirement 2, 3, 16) */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-wider text-[#5F6368] mb-3">
          Status Pengisian Laporan Agensi (FORM_STATUS)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div 
            onClick={handleAgencyStatusClick}
            className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <div>
              <div className="text-xs font-bold uppercase text-emerald-800">Agensi Telah Hantar</div>
              <div className="text-2xl font-black text-emerald-950 mt-1">
                {agencyStatusSummary.telahHantar} <span className="text-xs font-normal text-emerald-700">agensi</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div 
            onClick={handleAgencyStatusClick}
            className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-colors"
          >
            <div>
              <div className="text-xs font-bold uppercase text-amber-800">Agensi Berstatus Draf</div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {agencyStatusSummary.draf} <span className="text-xs font-normal text-amber-700">agensi</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
