import React from 'react';
import { Zap, Eye, Building2, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { MasterInitiative } from '../types';
import { getComponentColor, getStatusStyle, normalizeComponent } from '../utils/formatters';

interface FastTrackSectionProps {
  initiatives: MasterInitiative[];
  onSelectInitiative: (initiative: MasterInitiative) => void;
}

export const FastTrackSection: React.FC<FastTrackSectionProps> = ({
  initiatives,
  onSelectInitiative
}) => {
  const ftList = initiatives.filter(i => i.isFastTrack);
  const ftSiap = ftList.filter(i => i.statusPelaksanaan === 'Siap').length;
  const ftDalam = ftList.filter(i => i.statusPelaksanaan === 'Dalam Pelaksanaan').length;
  const ftProgress = ftList.length > 0 
    ? Math.round(ftList.reduce((acc, i) => acc + (i.peratusKemajuan || 0), 0) / ftList.length)
    : 0;

  return (
    <section id="fast-track" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Title & Analytics Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600">
            <Zap className="w-4 h-4 fill-amber-500" />
            <span>Keutamaan Impak Pantas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            INISIATIF FAST TRACK
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Projek berimpak segera bagi mempercepat manfaat bandar pintar kepada rakyat dan komuniti perniagaan Negeri Sembilan.
          </p>
        </div>

        {/* Mini Analytics Badge */}
        <div className="flex items-center gap-4 bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Purata Kemajuan FT</span>
            <span className="text-2xl font-black text-amber-950">{ftProgress}%</span>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Status Siap</span>
            <span className="text-2xl font-black text-emerald-800">{ftSiap} / {ftList.length}</span>
          </div>
        </div>
      </div>

      {/* Fast Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ftList.map((item) => {
          const compColor = getComponentColor(item.komponen);
          const statusStyle = getStatusStyle(item.statusPelaksanaan);

          return (
            <div
              key={item.compositeKey}
              className="card-premium p-6 flex flex-col justify-between bg-white relative overflow-hidden group hover:border-amber-400"
            >
              {/* Top Golden Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#F3DB7B] to-amber-500" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider"
                    style={{ backgroundColor: `${compColor.lightHex}50`, color: compColor.hex }}
                  >
                    {item.kodInisiatif}
                  </span>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${statusStyle.badgeBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    <span>{statusStyle.text}</span>
                  </span>
                </div>

                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  {normalizeComponent(item.komponen)}
                </div>

                <h3 className="text-base font-extrabold text-[#171717] leading-snug group-hover:text-amber-700 transition-colors mb-2">
                  {item.inisiatif}
                </h3>

                {item.outcome && (
                  <p className="text-xs text-[#5F6368] leading-relaxed mb-4 line-clamp-2">
                    {item.outcome}
                  </p>
                )}

                {/* Lead Agency */}
                <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium mb-4">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{item.agensiUtama}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mb-5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-500">Kemajuan Pelaksanaan</span>
                    <span className="text-[#171717] font-bold">{item.peratusKemajuan ?? 0}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.peratusKemajuan ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  {item.fasaPelaksanaan}
                </span>

                <button
                  onClick={() => onSelectInitiative(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>LIHAT BUTIRAN</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
};
