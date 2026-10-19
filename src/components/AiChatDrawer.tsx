import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  Layers, 
  Building2, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Bot, 
  User,
  RotateCcw
} from 'lucide-react';
import { PortalBootstrapData, ActiveFilters } from '../types';
import { queryAiInsights, AiResponse, AiActionButton } from '../services/aiInsightsService';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortalBootstrapData;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  onNavigateToSection: (sectionId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  responseObj?: AiResponse;
}

const SUGGESTED_PROMPTS = [
  'Bagaimana prestasi keseluruhan?',
  'Berapa inisiatif telah siap?',
  'Agensi mana belum menghantar data?',
  'Senaraikan Fast Track',
  'Komponen mana paling maju?',
  'Apakah inisiatif yang mempunyai isu?',
  'Cari inisiatif berkaitan CCTV',
  'Apakah projek di Smart Map?',
  'Agensi mana mempunyai paling banyak inisiatif?'
];

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  data,
  onFilterChange,
  onNavigateToSection
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Salam sejahtera! Saya ialah **Nogori Pintar AI**, pembantu analitik digital tempatan anda. Saya menganalisis data langsung Pelan Induk Bandar Pintar Negeri Sembilan 2040 secara tepat berasaskan rekod pemantauan rasmi. Sila pilih soalan cadangan di bawah atau ajukan sebarang pertanyaan anda.',
      timestamp: 'Terkini'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    // Simulasi kepantasan analitik tempatan (250ms)
    setTimeout(() => {
      const response = queryAiInsights(query, data);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        responseObj: response
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 250);
  };

  const handleActionButtonClick = (btn: AiActionButton) => {
    if (btn.actionType === 'navigate_section' && btn.sectionId) {
      onNavigateToSection(btn.sectionId);
      onClose();
    } else if (btn.actionType === 'filter_component' && btn.targetValue) {
      onFilterChange({ selectedComponent: btn.targetValue });
      onNavigateToSection('inisiatif');
      onClose();
    } else if (btn.actionType === 'filter_status' && btn.targetValue) {
      onFilterChange({ selectedStatus: btn.targetValue as any });
      onNavigateToSection('inisiatif');
      onClose();
    } else if (btn.actionType === 'filter_fast_track') {
      onFilterChange({ fastTrackOnly: true });
      onNavigateToSection('inisiatif');
      onClose();
    } else if (btn.actionType === 'filter_agency' && btn.targetValue) {
      onFilterChange({ selectedMainAgency: btn.targetValue });
      onNavigateToSection(btn.sectionId || 'prestasi-agensi');
      onClose();
    } else if (btn.actionType === 'search' && btn.targetValue) {
      onFilterChange({ searchQuery: btn.targetValue });
      onNavigateToSection('inisiatif');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-hidden flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#FFF9F3] border-b border-[#E8B6C8]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9EDBD7]/40 text-[#46B7B0] flex items-center justify-center border border-[#46B7B0]/30 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#171717]">NOGORI PINTAR AI</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Data Langsung
                </span>
              </div>
              <p className="text-xs text-[#5F6368]">
                Terokai prestasi Pelan Induk dengan lebih pintar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-stone-50/50">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-[#46B7B0] text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#171717] text-white rounded-tr-none'
                  : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none space-y-3'
              }`}>
                {/* Formatted Text */}
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Response Highlights Cards if available */}
                {msg.responseObj?.highlights && msg.responseObj.highlights.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                    {msg.responseObj.highlights.map((h, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-500 font-bold block">{h.title}</span>
                        <span className="text-base font-black text-[#171717]">{h.value}</span>
                        {h.desc && <span className="text-[10px] text-stone-400 block">{h.desc}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Action Buttons */}
                {msg.responseObj?.actionButtons && msg.responseObj.actionButtons.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {msg.responseObj.actionButtons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => handleActionButtonClick(btn)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9EDBD7]/25 hover:bg-[#9EDBD7]/50 text-teal-900 border border-[#46B7B0]/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>{btn.label}</span>
                        <ArrowRight className="w-3 h-3 text-[#46B7B0]" />
                      </button>
                    ))}
                  </div>
                )}

                <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-stone-400 text-right' : 'text-stone-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start items-center text-xs text-stone-500">
              <div className="w-8 h-8 rounded-xl bg-[#46B7B0] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#46B7B0] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#46B7B0] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#46B7B0] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-stone-500 ml-1">Menganalisis data langsung...</span>
              </div>
            </div>
          )}

        </div>

        {/* Suggested Quick Prompts Horizontal Scroll */}
        <div className="p-3 bg-white border-t border-stone-100 overflow-x-auto">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            Cadangan Soalan Eksekutif:
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-[#9EDBD7]/30 text-stone-700 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Tanya tentang Pelan Induk Bandar Pintar..."
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#46B7B0]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-[#46B7B0] hover:bg-[#369b95] text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
