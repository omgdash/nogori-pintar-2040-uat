import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Maximize2, 
  RotateCw, 
  Menu, 
  X, 
  Layers, 
  MapPin, 
  BarChart3, 
  Building2, 
  Zap, 
  Table
} from 'lucide-react';
import { OfficialNogoriPintarLogo } from './OfficialNogoriPintarLogo';

interface NavbarProps {
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSearch: () => void;
  onOpenAi: () => void;
  onTogglePresentation: () => void;
  isPresentationMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  onOpenSearch,
  onOpenAi,
  onTogglePresentation,
  isPresentationMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Utama', href: '#utama' },
    { label: 'Ringkasan', href: '#ringkasan' },
    { label: 'Komponen', href: '#komponen' },
    { label: 'Inisiatif', href: '#inisiatif' },
    { label: 'Prestasi Agensi', href: '#prestasi-agensi' },
    { label: 'Fast Track', href: '#fast-track' },
    { label: 'Analitik', href: '#analitik' },
    { label: 'Smart Map', href: '#smart-map' },
    { label: 'Data', href: '#data-jadual' },
  ];

  if (isPresentationMode) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9F3]/90 backdrop-blur-md border-b border-[#E8B6C8]/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Logo Brand - Saiz diperbesarkan secara berkadar (1.5x - 1.8x) tanpa gangguan susun atur */}
          <a href="#utama" className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#46B7B0] rounded-lg p-1 shrink-0" title="Utama - Nogori Pintar 2040">
            <OfficialNogoriPintarLogo 
              className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto max-w-[230px] sm:max-w-[300px] md:max-w-[340px] object-contain transition-transform group-hover:scale-[1.02]" 
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold text-[#171717]">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-2.5 py-1.5 rounded-lg text-[#5F6368] hover:text-[#171717] hover:bg-[#9EDBD7]/20 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-2">
            
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#5F6368] bg-white border border-[#E8B6C8]/50 rounded-xl hover:border-[#46B7B0] hover:text-[#171717] shadow-xs transition-all cursor-pointer"
              title="Cari Inisiatif & Agensi (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#46B7B0]" />
              <span>Carian</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-stone-100 rounded text-stone-500 font-mono">⌘K</kbd>
            </button>

            {/* Smart AI Drawer Trigger */}
            <button
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#171717] bg-[#9EDBD7]/40 hover:bg-[#9EDBD7]/70 border border-[#46B7B0]/40 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#46B7B0]" />
              <span>Nogori AI</span>
            </button>

            {/* Presentation Mode */}
            <button
              onClick={onTogglePresentation}
              className="p-2 text-[#5F6368] hover:text-[#171717] hover:bg-white rounded-xl border border-transparent hover:border-[#E8B6C8]/40 transition-all cursor-pointer"
              title="Mod Pembentangan Mesyuarat Eksekutif"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Live Data Trust Indicator (Requirement 31) */}
            <div 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs"
              title="Sumber: Sistem Pemantauan Pelan Induk Bandar Pintar Negeri Sembilan 2040"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-emerald-900 tracking-tight text-[11px]">DATA LANGSUNG</span>
              {lastUpdated && (
                <span className="text-[11px] text-emerald-700 font-medium border-l border-emerald-200 pl-2">
                  {lastUpdated}
                </span>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-950 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
              title="Sumber: Sistem Pemantauan Pelan Induk Bandar Pintar Negeri Sembilan 2040. Klik untuk muat semula."
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#46B7B0] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>MUAT SEMULA</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Carian"
            >
              <Search className="w-5 h-5 text-[#46B7B0]" />
            </button>
            <button
              onClick={onOpenAi}
              className="p-2 rounded-lg text-stone-800 bg-[#9EDBD7]/40"
              aria-label="Nogori AI"
            >
              <Sparkles className="w-5 h-5 text-[#46B7B0]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100 focus:outline-none"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 border-b border-[#E8B6C8]/60 shadow-lg px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-stone-100">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-stone-700 hover:bg-[#9EDBD7]/20 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onTogglePresentation();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 rounded-lg"
            >
              <Maximize2 className="w-4 h-4 text-stone-600" />
              <span>Mod Pembentangan</span>
            </button>
            <button
              onClick={() => {
                onRefresh();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-800 bg-[#9EDBD7]/40 rounded-lg"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Muat Semula Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
