import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart3, RotateCcw } from 'lucide-react';
import { 
  MasterInitiative, 
  ComponentStatistic, 
  AgencySummary, 
  ActiveFilters, 
  ImplementationStatus 
} from '../types';
import { 
  formatCurrency, 
  formatNumber, 
  COMPONENT_COLORS, 
  getOfficialComponentName,
  normalizeComponent
} from '../utils/formatters';

interface AnalyticsSectionProps {
  initiatives: MasterInitiative[];
  components: ComponentStatistic[];
  agencies: AgencySummary[];
  agencyStatusSummary: {
    telahHantar: number;
    draf: number;
    belumHantar?: number;
    totalAgencies: number;
  };
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onResetFilters: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  initiatives,
  components,
  agencies,
  agencyStatusSummary,
  onFilterChange,
  onResetFilters,
  onNavigateToSection
}) => {
  const totalMaster = initiatives.length || 85;

  // 1. Inisiatif Mengikut Komponen (Horizontal Bar: Bilangan + Peratusan dengan Nama Rasmi Penuh)
  const compInitiativesData = useMemo(() => {
    return components.map(c => {
      const pct = totalMaster > 0 ? Math.round((c.total / totalMaster) * 100) : 0;
      const officialName = getOfficialComponentName(c.name);
      return {
        name: officialName,
        displayName: officialName,
        fullName: c.name,
        inisiatif: c.total,
        percentage: pct,
        color: COMPONENT_COLORS[officialName]?.hex || COMPONENT_COLORS[c.name]?.hex || '#46B7B0'
      };
    });
  }, [components, totalMaster]);

  // 2. Status Pelaksanaan Inisiatif (Donut dengan warna semantik tepat: Siap #16A34A, Ditangguh #EAB308, Belum Mula #DC2626, Dalam Pelaksanaan #2563EB, Tiada Data #94A3B8)
  const statusData = useMemo(() => {
    const map: Record<string, number> = {
      'Siap': 0,
      'Dalam Pelaksanaan': 0,
      'Belum Mula': 0,
      'Ditangguh': 0,
      'Tiada Data': 0
    };
    initiatives.forEach(i => {
      const st = i.statusPelaksanaan;
      if (st && map[st] !== undefined) {
        map[st]++;
      } else {
        map['Tiada Data']++;
      }
    });

    const items = [
      { name: 'Siap', value: map['Siap'], color: '#16A34A' },
      { name: 'Dalam Pelaksanaan', value: map['Dalam Pelaksanaan'], color: '#2563EB' },
      { name: 'Belum Mula', value: map['Belum Mula'], color: '#DC2626' },
      { name: 'Ditangguh', value: map['Ditangguh'], color: '#EAB308' },
      { name: 'Tiada Data', value: map['Tiada Data'], color: '#94A3B8' }
    ].filter(d => d.value > 0);

    return items.map(d => ({
      ...d,
      percent: totalMaster > 0 ? Math.round((d.value / totalMaster) * 100) : 0
    }));
  }, [initiatives, totalMaster]);

  // 3. Purata Kemajuan Mengikut Komponen (Bar dengan Nama Rasmi Penuh)
  const compProgressData = useMemo(() => {
    return components.map(c => {
      const officialName = getOfficialComponentName(c.name);
      return {
        name: officialName,
        displayName: officialName,
        fullName: c.name,
        kemajuan: c.averageProgress ?? 0,
        color: COMPONENT_COLORS[officialName]?.hex || COMPONENT_COLORS[c.name]?.hex || '#46B7B0'
      };
    });
  }, [components]);

  // 4. Fasa Pelaksanaan (Bar: Bilangan + % daripada 85 inisiatif)
  const phaseData = useMemo(() => {
    const map: Record<string, number> = {};
    initiatives.forEach(i => {
      const f = i.fasaPelaksanaan || 'Fasa 1';
      map[f] = (map[f] || 0) + 1;
    });
    return Object.keys(map).map(k => ({
      name: k,
      jumlah: map[k],
      percent: totalMaster > 0 ? Math.round((map[k] / totalMaster) * 100) : 0
    }));
  }, [initiatives, totalMaster]);

  // 5. Tahap Penarafan (Bilangan + %)
  const ratingData = useMemo(() => {
    const map: Record<string, number> = {};
    initiatives.forEach(i => {
      const r = i.tahapPenarafan || 'Dalam Penilaian';
      map[r] = (map[r] || 0) + 1;
    });
    const colors = ['#46B7B0', '#F3DB7B', '#A8CDE3', '#C7B9DB', '#E8B6C8'];
    return Object.keys(map).map((k, idx) => ({
      name: k,
      value: map[k],
      percent: totalMaster > 0 ? Math.round((map[k] / totalMaster) * 100) : 0,
      color: colors[idx % colors.length]
    }));
  }, [initiatives, totalMaster]);

  // 6. Purata Kemajuan Agensi Telah Hantar (%) (Requirement M: HANYA agensi yang FORM_STATUS berstatus DIHANTAR)
  const submittedAgenciesProgressData = useMemo(() => {
    return agencies
      .filter(a => {
        const s = (a.sourceStatus || '').toUpperCase().trim();
        const f = (a.formStatus || '').toLowerCase().trim();
        const isDraft = s === 'DRAF' || f.includes('draf');
        return !isDraft && (s === 'DIHANTAR' || f.includes('telah hantar') || f.includes('dihantar')) && a.submittedPerformance?.averageProgress !== null;
      })
      .map(a => ({
        agency: a,
        name: a.name.length > 20 ? a.name.substring(0, 18) + '...' : a.name,
        fullName: a.name,
        kemajuan: a.submittedPerformance.averageProgress ?? 0
      }))
      .sort((a, b) => b.kemajuan - a.kemajuan)
      .slice(0, 8);
  }, [agencies]);

  // 7. Status Pengisian Agensi (Requirement N: HANYA Telah Hantar & Draf berasaskan FORM_STATUS, Bilangan + %)
  const submissionStatusData = useMemo(() => {
    const totalMonitored = agencyStatusSummary.totalAgencies || (agencyStatusSummary.telahHantar + agencyStatusSummary.draf) || 1;
    const thPct = Math.round((agencyStatusSummary.telahHantar / totalMonitored) * 100);
    const drafPct = Math.round((agencyStatusSummary.draf / totalMonitored) * 100);

    return [
      { name: 'Telah Hantar', value: agencyStatusSummary.telahHantar, percent: thPct, color: '#16A34A' },
      { name: 'Draf', value: agencyStatusSummary.draf, percent: drafPct, color: '#EAB308' }
    ].filter(d => d.value > 0);
  }, [agencyStatusSummary]);

  // 8. Kos Projek Mengikut Komponen (Requirement O: Sumber LATEST_STATUS, dedup mengikut Initiative Key, paparkan RM & % sumbangan)
  const compCostData = useMemo(() => {
    const costMap = new Map<string, number>();
    const seenKeys = new Set<string>();
    let totalSubmittedCost = 0;

    initiatives.forEach(i => {
      if (i.kosProjek && i.kosProjek > 0 && i.hasSubmittedUpdate && !seenKeys.has(i.compositeKey)) {
        seenKeys.add(i.compositeKey);
        const compNorm = normalizeComponent(i.komponen) || i.komponen;
        const curr = costMap.get(compNorm) || 0;
        costMap.set(compNorm, curr + i.kosProjek);
        totalSubmittedCost += i.kosProjek;
      }
    });

    const result: { name: string; displayName: string; fullName: string; kosJuta: number; rawKos: number; percent: number; color: string }[] = [];
    costMap.forEach((val, comp) => {
      const officialName = getOfficialComponentName(comp);
      result.push({
        name: officialName,
        displayName: officialName,
        fullName: officialName,
        kosJuta: Number((val / 1_000_000).toFixed(2)),
        rawKos: val,
        percent: totalSubmittedCost > 0 ? Math.round((val / totalSubmittedCost) * 100) : 0,
        color: COMPONENT_COLORS[officialName]?.hex || COMPONENT_COLORS[comp]?.hex || '#10B981'
      });
    });

    return result.sort((a, b) => b.rawKos - a.rawKos);
  }, [initiatives]);

  // Handler klik carta untuk penapisan bersilang
  const handleComponentClick = (compFullName: string) => {
    const canonicalName = normalizeComponent(compFullName) || compFullName;
    onFilterChange({ selectedComponent: canonicalName });
    onNavigateToSection('inisiatif');
  };

  const handleStatusClick = (statusName: string) => {
    onFilterChange({ selectedStatus: statusName as ImplementationStatus });
    onNavigateToSection('inisiatif');
  };

  return (
    <section id="analitik" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Title & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
            <BarChart3 className="w-4 h-4" />
            <span>Visualisasi Pintar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            ANALITIK BANDAR PINTAR NEGERI SEMBILAN 2040
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Klik pada mana-mana bahagian carta untuk menapis inisiatif atau agensi yang berkaitan secara langsung.
          </p>
        </div>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Semua Tapisan</span>
        </button>
      </div>

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CARTA 1: Inisiatif Mengikut Komponen (Bilangan + % Master) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 1</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Inisiatif Mengikut Komponen</h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">Bilangan &amp; % daripada 85 inisiatif</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={compInitiativesData}
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" fontSize={11} stroke="#9CA3AF" />
                <YAxis 
                  dataKey="displayName" 
                  type="category" 
                  width={180} 
                  fontSize={11} 
                  stroke="#4B5563"
                  tick={{ fill: '#374151', fontWeight: 600 }}
                />
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} inisiatif (${item?.payload?.percentage ?? 0}%)`, 
                    item?.payload?.displayName || 'Jumlah'
                  ]} 
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                />
                <Bar 
                  dataKey="inisiatif" 
                  radius={[0, 6, 6, 0]}
                  onClick={(entry: any) => {
                    const fullName = entry?.fullName || entry?.payload?.fullName;
                    if (fullName) handleComponentClick(fullName);
                  }}
                  cursor="pointer"
                >
                  {compInitiativesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTA 2: Status Pelaksanaan Inisiatif (Warna Semantik & Bilangan + %) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 2</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Status Pelaksanaan Inisiatif</h3>
            </div>
            <span className="text-xs text-stone-500 font-medium">Klik segmen untuk tapis</span>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  label={({ percent }) => `${percent}%`}
                  onClick={(entry: any) => {
                    const name = entry?.name || entry?.payload?.name;
                    if (name) handleStatusClick(name);
                  }}
                  cursor="pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} inisiatif (${item?.payload?.percent ?? 0}%)`, 
                    'Status'
                  ]} 
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTA 3: Purata Kemajuan Mengikut Komponen (%) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 3</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Purata Kemajuan Mengikut Komponen (%)</h3>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compProgressData}
                margin={{ top: 10, right: 10, left: -20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="displayName" 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0} 
                  fontSize={10} 
                  height={65}
                  stroke="#4B5563" 
                />
                <YAxis domain={[0, 100]} fontSize={11} stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${val}%`, 
                    item?.payload?.displayName || 'Purata Kemajuan'
                  ]} 
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                />
                <Bar 
                  dataKey="kemajuan" 
                  radius={[6, 6, 0, 0]}
                  onClick={(entry: any) => {
                    const fullName = entry?.fullName || entry?.payload?.fullName;
                    if (fullName) handleComponentClick(fullName);
                  }}
                  cursor="pointer"
                >
                  {compProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTA 4: Fasa Pelaksanaan (Bilangan + % Master dengan Nota) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 4</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Inisiatif Mengikut Fasa Pelaksanaan</h3>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 mb-2 italic">
            * Satu inisiatif boleh melibatkan lebih daripada satu fasa.
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={phaseData}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" fontSize={11} stroke="#4B5563" />
                <YAxis fontSize={11} stroke="#9CA3AF" />
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} inisiatif (${item?.payload?.percent ?? 0}%)`, 
                    'Jumlah'
                  ]} 
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                />
                <Bar dataKey="jumlah" fill="#A8CDE3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTA 5: Tahap Penarafan Bandar Pintar Malaysia (Bilangan + %) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 5</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Tahap Penarafan Bandar Pintar Malaysia</h3>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ percent }) => `${percent}%`}
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} inisiatif (${item?.payload?.percent ?? 0}%)`, 
                    'Penarafan'
                  ]} 
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTA 6: Purata Kemajuan Agensi Telah Hantar (%) (Requirement M) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 6</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Purata Kemajuan Agensi Telah Hantar (%)</h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">Sumber: LATEST_STATUS</span>
          </div>
          <div className="h-64">
            {submittedAgenciesProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={submittedAgenciesProgressData}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" domain={[0, 100]} fontSize={11} stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" width={120} fontSize={10} stroke="#4B5563" />
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Purata Kemajuan']} 
                    contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                  />
                  <Bar dataKey="kemajuan" fill="#46B7B0" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Tiada agensi berstatus Telah Hantar dengan data kemajuan pada masa ini.
              </div>
            )}
          </div>
        </div>

        {/* CARTA 7: Status Pengisian Agensi (Requirement N: Telah Hantar vs Draf Sahaja) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 7</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Status Pengisian Agensi</h3>
            </div>
            <span className="text-[11px] text-stone-500 font-medium">Berasaskan FORM_STATUS</span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={submissionStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  label={({ percent }) => `${percent}%`}
                >
                  {submissionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} agensi (${item?.payload?.percent ?? 0}%)`, 
                    'Status'
                  ]} 
                  contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTA 8: Kos Projek Mengikut Komponen (Requirement O: RM & % Sumbangan) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-stone-400 uppercase">Carta 8</span>
              <h3 className="text-sm font-extrabold text-[#171717]">Kos Projek Mengikut Komponen (RM Juta &amp; %)</h3>
            </div>
            <span className="text-[11px] text-stone-500 font-medium">Dideduplikasi mengikut Initiative Key</span>
          </div>
          <div className="h-72">
            {compCostData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={compCostData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="displayName" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0} 
                    fontSize={10} 
                    height={65}
                    stroke="#4B5563" 
                  />
                  <YAxis fontSize={11} stroke="#9CA3AF" />
                  <Tooltip 
                    formatter={(val: any, _name: any, item: any) => [
                      `RM ${val} Juta (${item?.payload?.percent ?? 0}% daripada jumlah kos)`, 
                      item?.payload?.displayName || 'Anggaran Kos'
                    ]} 
                    contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                  />
                  <Bar 
                    dataKey="kosJuta" 
                    radius={[6, 6, 0, 0]}
                    onClick={(entry: any) => {
                      const fullName = entry?.fullName || entry?.payload?.fullName;
                      if (fullName) handleComponentClick(fullName);
                    }}
                    cursor="pointer"
                  >
                    {compCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">
                Tiada maklumat kos yang sah tersedia dalam rekod status yang dihantar.
              </div>
            )}
          </div>
        </div>

      </div>

    </section>
  );
};
