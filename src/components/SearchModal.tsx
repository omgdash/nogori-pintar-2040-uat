import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Zap, ChevronRight, Building2, Layers } from 'lucide-react';
import { MasterInitiative } from '../types';
import { getComponentColor, getStatusStyle, normalizeComponent } from '../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiatives: MasterInitiative[];
  onSelectInitiative: (initiative: MasterInitiative) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  initiatives,
  onSelectInitiative
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open handled in parent
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return initiatives.slice(0, 6);
    }
    const q = query.toLowerCase();
    return initiatives.filter(i => {
      const matchCode = i.kodInisiatif.toLowerCase().includes(q);
      const matchName = i.inisiatif.toLowerCase().includes(q);
      const matchOutcome = i.outcome ? i.outcome.toLowerCase().includes(q) : false;
      const matchAgency = i.agensiUtama.toLowerCase().includes(q);
      const matchSupport = i.agensiSokongan ? i.agensiSokongan.toLowerCase().includes(q) : false;
      return matchCode || matchName || matchOutcome || matchAgency || matchSupport;
    }).slice(0, 15);
  }, [initiatives, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs p-4 sm:p-6 md:p-20 flex justify-center animate-in fade-in duration-150">
      
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 z-10 self-start">
        
        {/* Search Input Box */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50/50">
          <Search className="w-5 h-5 text-[#46B7B0]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari inisiatif, kod atau agensi... (cth: SG-01, MBS, CCTV)"
            className="w-full bg-transparent text-sm sm:text-base text-[#171717] focus:outline-none placeholder:text-stone-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-2 py-1 bg-stone-200 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[420px] overflow-y-auto p-3 divide-y divide-stone-100">
          <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            {query.trim() ? `Hasil Carian (${searchResults.length})` : 'Inisiatif Cadangan'}
          </div>

          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              Tiada inisiatif dijumpai untuk "{query}". Sila cuba kata kunci lain.
            </div>
          ) : (
            searchResults.map((item) => {
              const compColor = getComponentColor(item.komponen);
              const statusStyle = getStatusStyle(item.statusPelaksanaan);

              return (
                <div
                  key={item.compositeKey}
                  onClick={() => {
                    onSelectInitiative(item);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-[#9EDBD7]/15 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase"
                        style={{ backgroundColor: `${compColor.lightHex}50`, color: compColor.hex }}
                      >
                        {item.kodInisiatif}
                      </span>
                      <span className="text-[11px] font-bold text-stone-400">
                        {normalizeComponent(item.komponen)}
                      </span>
                      {item.isFastTrack && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          FT
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#46B7B0] transition-colors line-clamp-1">
                      {item.inisiatif}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="truncate max-w-[200px]">{item.agensiUtama}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-teal-800">{item.statusPelaksanaan}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 text-stone-400 group-hover:text-[#46B7B0]">
                    <span className="text-xs font-bold text-[#171717]">{item.peratusKemajuan ?? 0}%</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <span>Gunakan kekunci anak panah atau klik untuk memilih inisiatif.</span>
          <span className="font-semibold text-stone-700">Nogori Pintar 2040</span>
        </div>

      </div>

    </div>
  );
};
