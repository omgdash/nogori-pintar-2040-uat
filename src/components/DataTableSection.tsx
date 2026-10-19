import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Search, 
  Zap, 
  ArrowUpDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Calendar,
  Eye
} from 'lucide-react';
import { MasterInitiative } from '../types';
import { formatCurrency, getStatusStyle, getComponentColor, normalizeComponent } from '../utils/formatters';

interface DataTableSectionProps {
  initiatives: MasterInitiative[];
  onSelectInitiative: (initiative: MasterInitiative) => void;
}

export const DataTableSection: React.FC<DataTableSectionProps> = ({
  initiatives,
  onSelectInitiative
}) => {
  const [tableSearch, setTableSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ftOnly, setFtOnly] = useState(false);
  const [sortField, setSortField] = useState<keyof MasterInitiative>('kodInisiatif');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number | 'Semua'>(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Tapis inisiatif
  const filteredData = useMemo(() => {
    return initiatives.filter(item => {
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        const mCode = item.kodInisiatif.toLowerCase().includes(q);
        const mTitle = item.inisiatif.toLowerCase().includes(q);
        const mAgency = item.agensiUtama.toLowerCase().includes(q);
        const mComp = item.komponen.toLowerCase().includes(q);
        if (!mCode && !mTitle && !mAgency && !mComp) return false;
      }

      if (componentFilter && normalizeComponent(item.komponen) !== normalizeComponent(componentFilter)) return false;
      if (statusFilter && item.statusPelaksanaan !== statusFilter) return false;
      if (ftOnly && !item.isFastTrack) return false;

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [initiatives, tableSearch, componentFilter, statusFilter, ftOnly, sortField, sortOrder]);

  // Pengiraan Pagination
  const totalItems = filteredData.length;
  const isAll = pageSize === 'Semua';
  const effectivePageSize = isAll ? totalItems : (pageSize as number);
  const totalPages = isAll ? 1 : Math.ceil(totalItems / effectivePageSize);

  const paginatedData = useMemo(() => {
    if (isAll) return filteredData;
    const start = (currentPage - 1) * effectivePageSize;
    return filteredData.slice(start, start + effectivePageSize);
  }, [filteredData, isAll, currentPage, effectivePageSize]);

  const handleSort = (field: keyof MasterInitiative) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Muat Turun Data CSV Ringkas
  const handleExportCsv = () => {
    const headers = [
      'Kod Inisiatif', 'FT', 'Inisiatif', 'Komponen', 'Agensi Utama', 
      'Fasa Pelaksanaan', 'Status', 'Kemajuan (%)', 'Anggaran Kos', 'Tarikh Kemas Kini'
    ];
    const rows = filteredData.map(i => [
      `"${i.kodInisiatif}"`,
      `"${i.isFastTrack ? 'YA' : 'TIDAK'}"`,
      `"${i.inisiatif.replace(/"/g, '""')}"`,
      `"${normalizeComponent(i.komponen)}"`,
      `"${i.agensiUtama}"`,
      `"${i.fasaPelaksanaan}"`,
      `"${i.statusPelaksanaan}"`,
      `"${i.peratusKemajuan ?? ''}"`,
      `"${i.kosProjek ?? ''}"`,
      `"${i.tarikhKemasKini ?? ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_PEMANTAUAN_NOGORI_PINTAR_2040_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="data-jadual" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
            <Table className="w-4 h-4" />
            <span>Pangkalan Data Pemantauan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            DATA PEMANTAUAN INISIATIF
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Paparan jadual komprehensif bagi memudahkan semakan silang status inisiatif dan rekod pelaksanaan.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border border-stone-200 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#46B7B0]" />
          <span>Eksport CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari dalam jadual..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
            />
          </div>

          {/* Component Filter */}
          <select
            value={componentFilter}
            onChange={(e) => {
              setComponentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium"
          >
            <option value="">Semua Status</option>
            <option value="Siap">Siap</option>
            <option value="Dalam Pelaksanaan">Dalam Pelaksanaan</option>
            <option value="Belum Mula">Belum Mula</option>
            <option value="Ditangguh">Ditangguh</option>
          </select>

          {/* Fast Track Toggle */}
          <button
            onClick={() => {
              setFtOnly(!ftOnly);
              setCurrentPage(1);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
              ftOnly 
                ? 'bg-amber-500 text-white border-amber-600' 
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast Track Sahaja</span>
          </button>

        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FFF9F3] text-stone-700 font-extrabold uppercase tracking-wider sticky top-0 z-10 border-b border-[#E8B6C8]/60 backdrop-blur-md">
              <tr>
                <th className="py-3.5 px-3 text-center w-12">BIL.</th>
                <th onClick={() => handleSort('kodInisiatif')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-100">
                  <div className="flex items-center gap-1">
                    <span>Kod</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">FT</th>
                <th onClick={() => handleSort('inisiatif')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-100 min-w-[260px]">
                  <div className="flex items-center gap-1">
                    <span>Inisiatif</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('komponen')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-100 min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <span>Komponen</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('agensiUtama')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-100 min-w-[160px]">
                  <div className="flex items-center gap-1">
                    <span>Agensi Utama</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 min-w-[120px]">Fasa</th>
                <th onClick={() => handleSort('statusPelaksanaan')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-100">
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('peratusKemajuan')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-100 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>Kemajuan</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right min-w-[120px]">Anggaran Kos</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-stone-400">
                    Tiada data pemantauan yang sepadan dengan kriteria carian.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const compColor = getComponentColor(item.komponen);
                  const statusStyle = getStatusStyle(item.statusPelaksanaan);
                  const bilNumber = isAll ? (idx + 1) : ((currentPage - 1) * effectivePageSize + idx + 1);

                  return (
                    <tr 
                      key={item.compositeKey}
                      onClick={() => onSelectInitiative(item)}
                      className="hover:bg-[#9EDBD7]/10 transition-colors cursor-pointer"
                    >
                      {/* Bilangan */}
                      <td className="py-3 px-3 text-center font-bold text-stone-500">
                        {bilNumber}
                      </td>

                      {/* Kod */}
                      <td className="py-3 px-4 font-black">
                        <span 
                          className="px-2 py-0.5 rounded text-[11px]"
                          style={{ backgroundColor: `${compColor.lightHex}50`, color: compColor.hex }}
                        >
                          {item.kodInisiatif}
                        </span>
                      </td>

                      {/* Fast Track */}
                      <td className="py-3 px-3 text-center">
                        {item.isFastTrack ? (
                          <span className="inline-block p-1 bg-amber-100 text-amber-900 rounded-full" title="Inisiatif Fast Track">
                            <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
                          </span>
                        ) : (
                          <span className="text-stone-300">-</span>
                        )}
                      </td>

                      {/* Nama Inisiatif */}
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {item.inisiatif}
                      </td>

                      {/* Komponen */}
                      <td className="py-3 px-4 text-stone-600 font-medium">
                        {normalizeComponent(item.komponen)}
                      </td>

                      {/* Agensi Utama */}
                      <td className="py-3 px-4 text-stone-700 font-semibold">
                        {item.agensiUtama}
                      </td>

                      {/* Fasa */}
                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {item.fasaPelaksanaan}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${statusStyle.badgeBg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span>{statusStyle.text}</span>
                        </span>
                      </td>

                      {/* Kemajuan */}
                      <td className="py-3 px-4 text-center font-extrabold text-[#171717]">
                        {item.peratusKemajuan !== null ? `${item.peratusKemajuan}%` : '-'}
                      </td>

                      {/* Kos */}
                      <td className="py-3 px-4 text-right font-medium text-stone-700">
                        {formatCurrency(item.kosProjek)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInitiative(item);
                          }}
                          className="p-1.5 text-stone-500 hover:text-[#46B7B0] hover:bg-[#9EDBD7]/20 rounded-lg transition-colors"
                          title="Lihat Butiran Penuh"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination & Page Size */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Baris setiap halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value === 'Semua' ? 'Semua' : Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="py-1 px-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="Semua">Semua</option>
            </select>
            <span className="text-stone-500 ml-2">
              Menunjukkan {paginatedData.length} daripada {totalItems} rekod
            </span>
          </div>

          {!isAll && totalPages > 1 && (
            <div className="flex items-center gap-2 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-stone-600 font-semibold px-2">
                Halaman {currentPage} daripada {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

    </section>
  );
};
