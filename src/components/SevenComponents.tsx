import React from 'react';
import { 
  Building, 
  Coins, 
  Leaf, 
  Car, 
  Users, 
  Wifi, 
  HeartHandshake,
  ArrowRight,
  Layers
} from 'lucide-react';
import { ComponentStatistic } from '../types';
import { getComponentColor, normalizeComponent } from '../utils/formatters';

interface SevenComponentsProps {
  components: ComponentStatistic[];
  selectedComponent: string | null;
  onSelectComponent: (componentName: string | null) => void;
  onNavigateToInitiatives: () => void;
}

export const SevenComponents: React.FC<SevenComponentsProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  onNavigateToInitiatives
}) => {
  // Padanan Ikon Komponen
  const getComponentIcon = (name: string) => {
    switch (name) {
      case 'Smart Government':
        return <Building className="w-6 h-6" />;
      case 'Smart Economy':
        return <Coins className="w-6 h-6" />;
      case 'Smart Environment':
        return <Leaf className="w-6 h-6" />;
      case 'Smart Mobility':
        return <Car className="w-6 h-6" />;
      case 'Smart People':
        return <Users className="w-6 h-6" />;
      case 'Smart Digital Infrastructure':
      case 'Smart Digital Infrastruktur':
        return <Wifi className="w-6 h-6" />;
      case 'Smart Living':
        return <HeartHandshake className="w-6 h-6" />;
      default:
        return <Layers className="w-6 h-6" />;
    }
  };

  const handleCardClick = (name: string) => {
    const canonicalName = normalizeComponent(name) || name;
    if (selectedComponent === canonicalName) {
      onSelectComponent(null);
    } else {
      onSelectComponent(canonicalName);
      onNavigateToInitiatives();
    }
  };

  return (
    <section id="komponen" className="py-12 border-b border-[#E8B6C8]/30">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
            Struktur Strategik Pelan Induk
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            7 KOMPONEN BANDAR PINTAR
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
            Klik mana-mana komponen untuk menapis dan melihat inisiatif serta kemajuan langsung yang berkaitan.
          </p>
        </div>

        {selectedComponent && (
          <button
            onClick={() => onSelectComponent(null)}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 bg-stone-100 rounded-lg self-start sm:self-auto cursor-pointer"
          >
            Tunjukkan Semua Komponen
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {components.map((comp) => {
          const isSelected = selectedComponent === comp.name;
          const col = getComponentColor(comp.name);

          return (
            <div
              key={comp.name}
              onClick={() => handleCardClick(comp.name)}
              className={`card-premium p-6 cursor-pointer flex flex-col justify-between relative overflow-hidden transition-all ${
                isSelected 
                  ? 'ring-3 ring-[#46B7B0] bg-white shadow-lg' 
                  : 'hover:border-[#46B7B0] bg-white'
              }`}
            >
              {/* Top Accent Strip */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5" 
                style={{ backgroundColor: col.hex }} 
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${col.lightHex}40`, color: col.hex }}
                  >
                    {getComponentIcon(comp.name)}
                  </div>
                  <span className="text-xs font-bold text-stone-500">
                    {comp.total} Inisiatif
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#171717] leading-snug mb-3">
                  {normalizeComponent(comp.name) || comp.name}
                </h3>

                {/* Progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-xs text-stone-600 font-medium">
                    <span>Kemajuan Langsung</span>
                    <span className="font-bold text-[#171717]">{comp.averageProgress}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${comp.averageProgress}%`,
                        backgroundColor: col.hex
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Breakdown */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="text-emerald-700 font-semibold">
                  {comp.completed} Siap
                </span>
                <span className="text-amber-700 font-semibold">
                  {comp.fastTrackCount} Fast Track
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
