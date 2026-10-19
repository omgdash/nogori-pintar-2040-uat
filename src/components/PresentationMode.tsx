import React from 'react';
import { Minimize2, TrendingUp, CheckCircle2, Clock, Zap, Building2, Layers } from 'lucide-react';
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
  ResponsiveContainer 
} from 'recharts';
import { PortalBootstrapData } from '../types';
import { formatNumber, COMPONENT_COLORS } from '../utils/formatters';
import { OfficialNogoriPintarLogo } from './OfficialNogoriPintarLogo';

interface PresentationModeProps {
  data: PortalBootstrapData;
  onExit: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ data, onExit }) => {
  const kpi = data.kpi;
  const components = data.components;

  const compData = components.map(c => ({
    name: c.name.replace('Smart ', ''),
    inisiatif: c.total,
    kemajuan: c.averageProgress,
    color: COMPONENT_COLORS[c.name]?.hex || '#46B7B0'
  }));

  const statusPieData = [
    { name: 'Siap', value: kpi.completedCount, color: '#10B981' },
    { name: 'Dalam Pelaksanaan', value: kpi.inProgressCount, color: '#46B7B0' },
    { name: 'Belum Mula', value: kpi.notStartedCount, color: '#94A3B8' },
    { name: 'Ditangguh', value: kpi.delayedCount, color: '#F97316' }
  ].filter(d => d.value > 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#FFF9F3] overflow-y-auto p-6 sm:p-10 flex flex-col justify-between">
      
      {/* Top Presentation Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8B6C8]/60">
        <div className="flex items-center gap-4">
          <OfficialNogoriPintarLogo className="h-16 w-auto max-w-[240px]" />
          <div className="border-l border-stone-300 pl-4">
            <span className="text-xs font-black tracking-widest text-[#46B7B0] uppercase block">
              MOD PEMBENTANGAN EKSEKUTIF
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">
              PELAN INDUK BANDAR PINTAR NEGERI SEMBILAN 2040
            </h1>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#171717] hover:bg-[#333333] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" />
          <span>KELUAR MOD PEMBENTANGAN</span>
        </button>
      </div>

      {/* Center Presentation Stage: Massive KPIs */}
      <div className="py-8 space-y-8">
        
        {/* Giant Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          
          <div className="bg-white p-8 rounded-3xl border border-[#E8B6C8]/60 shadow-md">
            <div className="flex items-center justify-between text-stone-500 mb-2">
              <span className="text-sm font-black uppercase">Jumlah Inisiatif</span>
              <Layers className="w-6 h-6 text-[#46B7B0]" />
            </div>
            <div className="text-5xl sm:text-6xl font-black text-[#171717]">{kpi.totalInitiatives}</div>
            <span className="text-xs text-stone-500 mt-2 block font-medium">7 Komponen Pintar Negeri</span>
          </div>

          <div className="bg-gradient-to-br from-[#9EDBD7]/25 to-white p-8 rounded-3xl border border-[#46B7B0] shadow-md">
            <div className="flex items-center justify-between text-teal-800 mb-2">
              <span className="text-sm font-black uppercase">Purata Kemajuan</span>
              <TrendingUp className="w-6 h-6 text-[#46B7B0]" />
            </div>
            <div className="text-5xl sm:text-6xl font-black text-[#1d6d68]">{kpi.averageProgress}%</div>
            <div className="w-full bg-teal-100 rounded-full h-3 mt-4 overflow-hidden">
              <div className="bg-[#46B7B0] h-full rounded-full" style={{ width: `${kpi.averageProgress}%` }} />
            </div>
          </div>

          <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-300 shadow-md">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-sm font-black uppercase">Inisiatif Siap</span>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-5xl sm:text-6xl font-black text-emerald-950">{kpi.completedCount}</div>
            <span className="text-xs text-emerald-700 mt-2 block font-medium">100% Beroperasi Sepenuhnya</span>
          </div>

          <div className="bg-amber-50 p-8 rounded-3xl border border-amber-300 shadow-md">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-sm font-black uppercase">Fast Track</span>
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-5xl sm:text-6xl font-black text-amber-950">{kpi.fastTrackCount}</div>
            <span className="text-xs text-amber-700 mt-2 block font-medium">Impak Pantas & Strategik</span>
          </div>

        </div>

        {/* 2 Massive Charts for Executive Meeting Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-lg font-black text-[#171717] mb-6">
              Kemajuan Inisiatif Mengikut Komponen Bandar Pintar (%)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" fontSize={12} stroke="#374151" fontVariant="bold" />
                  <YAxis domain={[0, 100]} fontSize={12} stroke="#6B7280" />
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Kemajuan']}
                    contentStyle={{ borderRadius: 12, fontSize: 14 }}
                  />
                  <Bar dataKey="kemajuan" radius={[8, 8, 0, 0]}>
                    {compData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-black text-[#171717] mb-4 text-center">
              Pecahan Status Pelaksanaan
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val} inisiatif`, 'Jumlah']} 
                    contentStyle={{ borderRadius: 12, fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-stone-100 text-xs">
              {statusPieData.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="font-semibold text-stone-700">{s.name}: <b>{s.value}</b></span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
        <span>Sumber: Sistem Pemantauan Pelan Induk Bandar Pintar Negeri Sembilan 2040</span>
        <span className="font-semibold text-stone-800">Disediakan untuk Sidang Eksekutif Kerajaan Negeri</span>
      </div>

    </div>
  );
};
