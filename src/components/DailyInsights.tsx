import React from 'react';
import { Sparkles, ArrowRight, TrendingUp, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { DailyInsightCard } from '../services/aiInsightsService';

interface DailyInsightsProps {
  insights: DailyInsightCard[];
  onActionClick: (target: string) => void;
  onOpenAiChat: () => void;
}

export const DailyInsights: React.FC<DailyInsightsProps> = ({
  insights,
  onActionClick,
  onOpenAiChat
}) => {
  if (!insights || insights.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#9EDBD7]/30 flex items-center justify-center text-[#46B7B0]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              SMART INSIGHTS HARI INI
            </h2>
            <p className="text-xs text-[#5F6368]">
              Cerapan analitik berfakta yang dijana secara automatik daripada status pemantauan langsung terkini.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAiChat}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-[#171717] bg-white border border-[#46B7B0]/60 rounded-xl hover:bg-[#9EDBD7]/20 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#46B7B0]" />
          <span>Tanya Nogori AI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((card) => (
          <div
            key={card.id}
            className="card-premium p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#46B7B0] transition-all bg-white"
          >
            {/* Soft accent top edge */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5 transition-all"
              style={{ backgroundColor: card.accentColor }} 
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5F6368]">
                  {card.badge}
                </span>
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: card.accentColor }} 
                />
              </div>

              <h3 className="text-sm font-bold text-[#171717] leading-snug group-hover:text-[#46B7B0] transition-colors mb-2">
                {card.title}
              </h3>

              <p className="text-xs text-[#5F6368] leading-relaxed line-clamp-3">
                {card.description}
              </p>
            </div>

            {card.actionText && card.actionTarget && (
              <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => onActionClick(card.actionTarget!)}
                  className="text-xs font-bold text-[#46B7B0] hover:text-[#171717] inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
