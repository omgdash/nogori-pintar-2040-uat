import React from 'react';
import { ShieldCheck, Database, Calendar } from 'lucide-react';
import { PortalCmsConfig } from '../types';
import { OfficialNogoriPintarLogo } from './OfficialNogoriPintarLogo';

interface FooterProps {
  lastUpdated: string;
  cms: PortalCmsConfig;
}

export const Footer: React.FC<FooterProps> = ({ lastUpdated, cms }) => {
  return (
    <footer className="bg-white border-t border-[#E8B6C8]/40 pt-14 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-stone-100">
          
          {/* Col 1: Official Logo & Brand Info */}
          <div className="md:col-span-6 space-y-5">
            <OfficialNogoriPintarLogo 
              className="h-24 sm:h-28 md:h-32 w-auto max-w-[340px] sm:max-w-[420px] md:max-w-[480px] object-contain select-none" 
            />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#171717]">
                PELAN INDUK BANDAR PINTAR NEGERI SEMBILAN 2040
              </h3>
              <p className="font-serif italic text-sm text-[#D92D20] font-semibold">
                “{cms?.tagline || 'Memacu Inovasi, Menjamin Kelestarian'}”
              </p>
            </div>
            <p className="text-xs text-stone-500 max-w-lg leading-relaxed">
              {cms?.aboutText || 'Pelan Induk Bandar Pintar Negeri Sembilan 2040 menggariskan hala tuju strategik meliputi 7 Komponen Utama bagi memacu pembangunan pintar di seluruh daerah.'}
            </p>
          </div>

          {/* Col 2: Agency & Authority */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#46B7B0] block">
              Agensi Peneraju
            </span>
            <div className="text-xs text-stone-700 font-bold space-y-1.5">
              <p>PLANMalaysia Negeri Sembilan</p>
              <p className="text-stone-500 font-medium">Jabatan Perancangan Bandar dan Desa Negeri Sembilan</p>
              <p className="text-stone-500 font-medium">Dengan Kerjasama Kerajaan Negeri Sembilan & Pihak Berkuasa Tempatan (PBT)</p>
            </div>
          </div>

          {/* Col 3: Data Provenance & Updates */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#46B7B0] block">
              Integriti Data
            </span>
            <div className="text-xs text-stone-600 space-y-2">
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  Sumber Data: <b>Sistem Pemantauan Pelan Induk Bandar Pintar Negeri Sembilan 2040</b>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                <span>
                  Dikemas kini: <b className="text-stone-900">{lastUpdated}</b>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            Hak Cipta Terpelihara © 2026 PLANMalaysia Negeri Sembilan.
          </p>
          <div className="flex items-center gap-2 text-stone-400 text-[11px]">
            <span>NOGORI PINTAR 2040 — UAT v1.0</span>
            <span aria-hidden="true">·</span>
            <span>Semua Hak Terpelihara</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
