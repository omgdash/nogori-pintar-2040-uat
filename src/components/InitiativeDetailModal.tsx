import React, { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Zap, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Award, 
  DollarSign, 
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';
import { MasterInitiative } from '../types';
import { getComponentColor, getStatusStyle, formatCurrency, normalizeComponent } from '../utils/formatters';

interface InitiativeDetailModalProps {
  initiative: MasterInitiative | null;
  onClose: () => void;
  onViewOnMap: (initiative: MasterInitiative) => void;
}

export const InitiativeDetailModal: React.FC<InitiativeDetailModalProps> = ({
  initiative,
  onClose,
  onViewOnMap
}) => {
  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!initiative) return null;

  const compColor = getComponentColor(initiative.komponen);
  const statusStyle = getStatusStyle(initiative.statusPelaksanaan);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container (Desktop: right-side drawer 650px, Mobile: full screen) */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-black px-2.5 py-1 rounded-lg tracking-wider uppercase"
              style={{ backgroundColor: `${compColor.lightHex}50`, color: compColor.hex }}
            >
              {initiative.kodInisiatif}
            </span>
            {initiative.isFastTrack && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>FAST TRACK</span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Tutup Paparan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Title & Component */}
          <div>
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              {normalizeComponent(initiative.komponen)}
            </div>
            <h2 className="text-2xl font-black text-[#171717] leading-tight mb-3">
              {initiative.inisiatif}
            </h2>
            {initiative.outcome && (
              <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F4C6A6]/60 text-sm text-stone-700 leading-relaxed">
                <span className="font-bold text-stone-900 block mb-1">Sasaran / Outcome:</span>
                {initiative.outcome}
              </div>
            )}
          </div>

          {/* Section 1: STATUS PELAKSANAAN TERKINI (Highlighted live information) */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#46B7B0]" />
                <span>STATUS PELAKSANAAN TERKINI</span>
              </span>
              <span className="text-[11px] text-stone-500">
                {initiative.tarikhKemasKini ? `Kemas kini: ${initiative.tarikhKemasKini}` : 'Data Langsung'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Status */}
              <div>
                <span className="text-xs text-stone-500 block">Status Pelaksanaan</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full mt-1 ${statusStyle.badgeBg}`}>
                  <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.text}
                </span>
              </div>

              {/* Progress */}
              <div>
                <span className="text-xs text-stone-500 block">Peratus Kemajuan</span>
                <span className="text-xl font-black text-[#171717] mt-0.5 block">
                  {initiative.peratusKemajuan !== null ? `${initiative.peratusKemajuan}%` : 'Belum Dikemas Kini'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {initiative.peratusKemajuan !== null && (
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#46B7B0] h-full rounded-full transition-all duration-700" 
                  style={{ width: `${initiative.peratusKemajuan}%` }} 
                />
              </div>
            )}

            {/* Project Cost if available */}
            {initiative.kosProjek && initiative.kosProjek > 0 ? (
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                <span className="text-stone-500">Anggaran Kos Projek:</span>
                <span className="font-extrabold text-[#171717]">{formatCurrency(initiative.kosProjek)}</span>
              </div>
            ) : null}
          </div>

          {/* Section 2: PEMANTAUAN (Isu & Catatan) */}
          {(initiative.isuMasalah || initiative.catatan) && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-stone-600" />
                <span>CATATAN & CABARAN PEMANTAUAN</span>
              </h3>

              {initiative.isuMasalah && (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Isu dan Halangan Semasa:</span>
                  </span>
                  <p className="leading-relaxed">{initiative.isuMasalah}</p>
                </div>
              )}

              {initiative.catatan && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
                  <span className="font-bold text-stone-900 block">Ulasan Pelaksanaan:</span>
                  <p className="leading-relaxed">{initiative.catatan}</p>
                </div>
              )}
            </div>
          )}

          {/* Section 3: AGENSI BERTANGGUNGJAWAB */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-stone-600" />
              <span>TANGGUNGJAWAB AGENSI</span>
            </h3>

            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3 text-xs">
              <div>
                <span className="text-stone-500 font-medium block">Agensi Utama:</span>
                <span className="font-black text-stone-900 text-sm mt-0.5 block">
                  {initiative.agensiUtama}
                </span>
              </div>

              {initiative.agensiSokongan && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-stone-500 font-medium block">Agensi Sokongan:</span>
                  <span className="text-stone-700 font-semibold mt-0.5 block">
                    {initiative.agensiSokongan}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: FASA & PENARAFAN PIAWAIAN */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-stone-600" />
              <span>FASA & PENARAFAN BANDAR PINTAR</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block mb-1">Fasa Pelaksanaan</span>
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  {initiative.fasaPelaksanaan}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block mb-1">Tahap Penarafan Malaysia</span>
                <span className="font-bold text-[#171717]">
                  {initiative.tahapPenarafan || 'Dalam Penilaian'}
                </span>
              </div>

              {initiative.indikatorIso && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 sm:col-span-2">
                  <span className="text-stone-500 block mb-1">Indikator MS ISO 37122</span>
                  <span className="font-semibold text-stone-900">
                    {initiative.indikatorIso}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: LOKASI & SMART MAP */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5F6368] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-stone-600" />
              <span>LOKASI & KOORDINAT GIS</span>
            </h3>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-3">
              {initiative.hasCoordinates ? (
                <>
                  <div className="text-stone-700">
                    <span className="font-bold block mb-1">Titik Koordinat Berdaftar:</span>
                    <ul className="space-y-1">
                      {initiative.coordinates.map((pt, idx) => (
                        <li key={idx} className="font-mono text-[11px] text-teal-800 bg-teal-50/80 px-2 py-1 rounded inline-block mr-2 mb-1">
                          {pt.label ? `${pt.label}: ` : ''}{pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      onViewOnMap(initiative);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#46B7B0] hover:bg-[#369b95] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>LIHAT DALAM SMART MAP</span>
                  </button>
                </>
              ) : (
                <div className="text-stone-500 italic">
                  Inisiatif ini merupakan program dasar negeri dan tidak mempunyai titik koordinat tapak fizikal khusus.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Drawer Footer Close */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
