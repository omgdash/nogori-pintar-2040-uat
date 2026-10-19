import React from 'react';
import { Compass, MapPin, ArrowRight, ShieldCheck, Activity, Award, Sparkles } from 'lucide-react';
import { PortalKpiSummary, PortalCmsConfig } from '../types';
import { OfficialNogoriPintarLogo } from './OfficialNogoriPintarLogo';

interface HeroProps {
  kpi: PortalKpiSummary;
  cms: PortalCmsConfig;
  onExploreClick: () => void;
  onMapClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ kpi, cms, onExploreClick, onMapClick }) => {
  return (
    <section id="utama" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Watercolour Decorative Blobs (Inspired by Cover Art) */}
      <div className="absolute top-[-80px] left-[-80px] w-96 h-96 watercolour-blob-1" aria-hidden="true" />
      <div className="absolute top-1/4 right-[-100px] w-[450px] h-[450px] watercolour-blob-2" aria-hidden="true" />
      <div className="absolute bottom-[-100px] left-1/3 w-[500px] h-[350px] watercolour-blob-3" aria-hidden="true" />

      {/* Subtle Minangkabau Architectural Line Art SVG overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 1200 600" className="w-full h-full object-cover">
          {/* Peaked roofs lines */}
          <path d="M 100 500 Q 300 200 500 480 Q 600 150 700 480 Q 900 200 1100 500" stroke="#171717" strokeWidth="2.5" fill="none" />
          <path d="M 250 480 L 250 550 M 450 480 L 450 550 M 600 450 L 600 550 M 750 480 L 750 550 M 950 480 L 950 550" stroke="#171717" strokeWidth="2" />
          <circle cx="600" cy="150" r="12" fill="#46B7B0" />
          <circle cx="300" cy="200" r="8" fill="#F4C6A6" />
          <circle cx="900" cy="200" r="8" fill="#F3DB7B" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* CMS Announcement Banner if available */}
        {cms?.heroAnnouncement && (
          <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-2 bg-white/80 border border-[#E8B6C8] rounded-full text-xs font-semibold text-[#171717] shadow-xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#46B7B0] animate-pulse" />
            <span className="text-[#46B7B0] font-bold">PENGUMUMAN:</span>
            <span className="truncate max-w-xl text-stone-700">{cms.heroAnnouncement}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Official Nogori Pintar Logo Asset */}
            <div className="flex justify-center lg:justify-start">
              <OfficialNogoriPintarLogo 
                className="h-20 sm:h-24 lg:h-28 w-auto max-w-full drop-shadow-xs" 
              />
            </div>

            {/* Header Badge Text */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-extrabold tracking-widest uppercase flex-wrap">
              <span className="text-[#46B7B0]">PLANMalaysia Negeri Sembilan</span>
              <span className="text-stone-300">·</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#9EDBD7]/40 text-[#171717] font-black text-[11px] border border-[#46B7B0]/30 shadow-2xs">
                UAT v1.0
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#171717] tracking-tight leading-[1.12]">
              PELAN INDUK <br />
              <span className="text-[#46B7B0]">BANDAR PINTAR</span> <br />
              NEGERI SEMBILAN 2040
            </h1>

            {/* Tagline */}
            <p className="font-serif italic text-xl sm:text-2xl text-[#D92D20] font-semibold">
              “{cms?.tagline || 'Memacu Inovasi, Menjamin Kelestarian'}”
            </p>

            {/* Call to Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreClick}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#171717] hover:bg-[#333333] text-white font-bold text-sm rounded-xl shadow-md transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#9EDBD7]" />
                <span>TEROKAI PELAN INDUK</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onMapClick}
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-[#FFF9F3] text-[#171717] font-bold text-sm rounded-xl border border-[#46B7B0] shadow-xs transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#46B7B0]" />
                <span>BUKA SMART MAP</span>
              </button>
            </div>

            {/* Live Data Note */}
            <p className="text-xs text-stone-500 flex items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Data dikemas kini secara langsung daripada Sistem Pemantauan.</span>
            </p>
          </div>

          {/* Hero Right Visual & Key Summary Card */}
          <div className="lg:col-span-5">
            <div className="card-premium p-6 sm:p-8 bg-white/90 backdrop-blur-md relative overflow-hidden border border-[#E8B6C8]/60">
              
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#F3DB7B] via-[#E8B6C8] to-[#46B7B0]" />

              <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                <div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pemantauan Masa Nyata</span>
                  <h3 className="text-lg font-extrabold text-[#171717]">Ringkasan Status Negeri</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#9EDBD7]/30 flex items-center justify-center text-[#46B7B0]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* 4 Mini KPI Previews (Recalculated dynamically from live DATA & LATEST_STATUS) */}
              <div className="grid grid-cols-2 gap-4 py-6">
                
                {/* Total Initiatives */}
                <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#F4C6A6]/40">
                  <div className="text-xs font-semibold text-stone-500">Jumlah Inisiatif</div>
                  <div className="text-3xl font-black text-[#171717] mt-1">{kpi.totalInitiatives}</div>
                  <div className="text-[11px] text-stone-500 mt-1">7 Komponen Pintar</div>
                </div>

                {/* Average Progress */}
                <div className="p-4 rounded-xl bg-[#9EDBD7]/15 border border-[#46B7B0]/30">
                  <div className="text-xs font-semibold text-teal-800">Purata Kemajuan</div>
                  <div className="text-3xl font-black text-[#1d6d68] mt-1">{kpi.averageProgress}%</div>
                  <div className="w-full bg-teal-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-[#46B7B0] h-full rounded-full transition-all duration-700" style={{ width: `${kpi.averageProgress}%` }} />
                  </div>
                </div>

                {/* Fast Track */}
                <div className="p-4 rounded-xl bg-[#F3DB7B]/20 border border-[#F3DB7B]/50">
                  <div className="text-xs font-semibold text-amber-800">Fast Track (FT)</div>
                  <div className="text-3xl font-black text-amber-900 mt-1">{kpi.fastTrackCount}</div>
                  <div className="text-[11px] text-amber-700 mt-1">Inisiatif Keutamaan</div>
                </div>

                {/* Completed */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-800">Inisiatif Siap</div>
                  <div className="text-3xl font-black text-emerald-950 mt-1">{kpi.completedCount}</div>
                  <div className="text-[11px] text-emerald-700 mt-1">Status Dihantar</div>
                </div>
              </div>

              {/* Bottom Card Summary */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#46B7B0]" />
                  <span>Sumber: LATEST_STATUS</span>
                </span>
                <span className="font-semibold text-[#171717]">{kpi.totalAgencies} Agensi Terlibat</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
