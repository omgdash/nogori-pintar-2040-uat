/**
 * PELAN INDUK BANDAR PINTAR NEGERI SEMBILAN 2040 (NOGORI PINTAR 2040)
 * Papan Pemuka Pemantauan Langsung & Portal Digital Rasmi
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RotateCw, AlertTriangle, Key, CheckCircle2 } from 'lucide-react';
import { CONFIG, isApiConfigured } from './config';
import { PortalBootstrapData, MasterInitiative, ActiveFilters } from './types';
import { fetchPortalData, getActiveApiUrl, saveCustomApiUrl, syncUrlToConfigFile } from './services/apiService';
import { generateDailyInsights } from './services/aiInsightsService';

import { ErrorBoundary } from './components/ErrorBoundary';
import { SetupBanner } from './components/SetupBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DailyInsights } from './components/DailyInsights';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { SevenComponents } from './components/SevenComponents';
import { InitiativeExplorer } from './components/InitiativeExplorer';
import { InitiativeDetailModal } from './components/InitiativeDetailModal';
import { AgencyPerformance } from './components/AgencyPerformance';
import { FastTrackSection } from './components/FastTrackSection';
import { AnalyticsSection } from './components/AnalyticsSection';
import { SmartMap } from './components/SmartMap';
import { DataTableSection } from './components/DataTableSection';
import { AiChatDrawer } from './components/AiChatDrawer';
import { SearchModal } from './components/SearchModal';
import { PresentationMode } from './components/PresentationMode';
import { Footer } from './components/Footer';
import { OfficialNogoriPintarLogo } from './components/OfficialNogoriPintarLogo';

export default function App() {
  const [data, setData] = useState<PortalBootstrapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [isDevelopmentPreview, setIsDevelopmentPreview] = useState<boolean>(false);
  const [isStaleFallback, setIsStaleFallback] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDataNotification, setShowDataNotification] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>(() => getActiveApiUrl() || '');

  // Safety timeout: Jangan biarkan skrin memuatkan tergantung lebih daripada 5 saat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Semak dan segerakkan URL daripada storan pratonton jika src/config.ts belum dikemas kini
  useEffect(() => {
    if (!isApiConfigured()) {
      try {
        const stored = localStorage.getItem('nogori_pintar_custom_api_url');
        if (stored && stored.startsWith('https://script.google.com/') && stored.includes('/exec')) {
          syncUrlToConfigFile(stored).then(saved => {
            if (saved) {
              console.info('URL Google Apps Script telah disegerakkan secara kekal ke src/config.ts');
            }
          });
        }
      } catch (e) {}
    }
  }, []);

  const handleSaveUrlAndConnect = async () => {
    if (customUrlInput.trim()) {
      saveCustomApiUrl(customUrlInput.trim());
      await syncUrlToConfigFile(customUrlInput.trim());
      loadData(true);
    }
  };

  // Keadaan Penapisan Global
  const [filters, setFilters] = useState<ActiveFilters>({
    searchQuery: '',
    selectedComponent: null,
    selectedStatus: null,
    fastTrackOnly: false,
    selectedMainAgency: null,
    selectedPhase: null,
    selectedRatingLevel: null,
    sortBy: 'kod',
    sortOrder: 'asc'
  });

  // Modal / Laci
  const [selectedInitiative, setSelectedInitiative] = useState<MasterInitiative | null>(null);
  const [selectedInitiativeForMap, setSelectedInitiativeForMap] = useState<MasterInitiative | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Guard rujukan untuk mengelakkan panggilan serentak berganda
  const isFetchingRef = useRef<boolean>(false);

  // Muat Data Utama
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current && !isManualRefresh) {
      // Auto-refresh diabaikan jika satu fetch sedang berlangsung
      return;
    }

    isFetchingRef.current = true;
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      const res = await fetchPortalData(isManualRefresh);
      
      // Jika data sah dikembalikan, kemas kini keadaan dashboard
      if (res.data) {
        setData(res.data);
      }
      // Jika res.data tiada (cth. pembatalan AbortController tanpa cache baharu), kekalkan data sedia ada!
      
      if (res.lastLoadedTime) {
        setLastUpdatedTime(res.lastLoadedTime);
      }
      setIsDevelopmentPreview(Boolean(res.isDevelopmentPreview));
      setIsStaleFallback(res.isStaleFallback);
      
      // Hanya kemas kini mesej ralat jika ralat tulen berlaku
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setErrorMessage(null);
      }

      if (isManualRefresh && !res.isStaleFallback && res.data) {
        setShowDataNotification(true);
        setTimeout(() => setShowDataNotification(false), 4000);
      }
    } catch (err: any) {
      const isAbort = 
        err?.name === 'AbortError' || 
        (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError');

      if (!isAbort) {
        console.error('Ralat memuatkan data portal:', err);
        setErrorMessage(err.message || 'Gagal memuatkan data.');
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Muat data kali pertama
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto Refresh setiap 2 minit di latar belakang (Requirement 8)
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(false);
    }, CONFIG.REFRESH_INTERVAL || 120000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Navigasi ke bahagian tertentu dengan animasi lancar
  const handleNavigateToSection = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Kemas kini penapis
  const handleFilterChange = (newFilters: Partial<ActiveFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Reset penapis
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedComponent: null,
      selectedStatus: null,
      fastTrackOnly: false,
      selectedMainAgency: null,
      selectedPhase: null,
      selectedRatingLevel: null,
      sortBy: 'kod',
      sortOrder: 'asc'
    });
  };

  // Paparkan inisiatif dalam peta dan tatal ke Smart Map
  const handleViewOnMap = (initiative: MasterInitiative) => {
    setSelectedInitiativeForMap(initiative);
    handleNavigateToSection('smart-map');
  };

  // Tindakan daripada Cerapan Harian (Daily Insights)
  const handleDailyInsightAction = (target: string) => {
    if (target.startsWith('status:')) {
      const st = target.replace('status:', '') as any;
      handleFilterChange({ selectedStatus: st });
      handleNavigateToSection('inisiatif');
    } else if (target.startsWith('comp:')) {
      const cp = target.replace('comp:', '');
      handleFilterChange({ selectedComponent: cp });
      handleNavigateToSection('inisiatif');
    } else if (target === 'fast_track') {
      handleFilterChange({ fastTrackOnly: true });
      handleNavigateToSection('inisiatif');
    } else if (target.startsWith('section:')) {
      const sec = target.replace('section:', '');
      handleNavigateToSection(sec);
    }
  };

  // Cerapan Harian Dinamik
  const dailyInsights = useMemo(() => {
    if (!data) return [];
    return generateDailyInsights(data);
  }, [data]);

  // Skrin Memuatkan Awal (Requirement 64)
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-[#FFF9F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-sm">
          <div className="flex justify-center">
            <OfficialNogoriPintarLogo className="h-28 w-auto max-w-xs drop-shadow-sm animate-pulse" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-[#171717]">
              Memuatkan Pelan Induk Bandar Pintar Negeri Sembilan 2040...
            </p>
            <div className="w-48 h-1.5 bg-stone-200 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#46B7B0] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paparan Keadaan Ralat / Menunggu Sambungan (Requirement 3 & 4: Tidak sesekali paparkan skrin kosong)
  if (!data) {
    return (
      <div className="min-h-screen bg-[#FFF9F3] text-[#171717] flex flex-col font-sans selection:bg-[#9EDBD7]">
        {/* Bar Pengepala Rasmi */}
        <header className="sticky top-0 z-40 w-full bg-[#FFF9F3]/90 backdrop-blur-md border-b border-[#E8B6C8]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <OfficialNogoriPintarLogo className="h-11 sm:h-12 w-auto max-w-[220px]" />
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-black tracking-widest text-[#46B7B0] uppercase block">
                PELAN INDUK BANDAR PINTAR
              </span>
              <span className="text-sm font-extrabold text-[#171717]">
                NEGERI SEMBILAN 2040
              </span>
            </div>
          </div>
        </header>

        {/* Kad Ralat / Status Sambungan Tengah */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-[#E8B6C8] shadow-xl p-6 sm:p-10 text-center space-y-6">
            
            <div className="flex justify-center">
              <OfficialNogoriPintarLogo className="h-20 sm:h-24 w-auto max-w-[260px] drop-shadow-xs" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold tracking-wider uppercase">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                STATUS SAMBUNGAN DATA LANGSUNG
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
                Data langsung tidak dapat dimuatkan buat sementara waktu.
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                {errorMessage || 'Sistem sedia menerima data langsung daripada Google Apps Script Web App rasmi untuk menyegerakkan lembaran DATA, FORM_STATUS, DRAFT, dan LATEST_STATUS.'}
              </p>
            </div>

            {/* Borang Input URL Web App bagi Kemudahan Pengguna */}
            <div className="bg-[#FFF9F3] p-5 rounded-2xl border border-stone-200 text-left space-y-3">
              <label className="block text-xs font-extrabold text-[#171717]">
                Penyambungan Google Apps Script Web App:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#46B7B0]"
                />
                <button
                  onClick={handleSaveUrlAndConnect}
                  disabled={isRefreshing}
                  className="px-5 py-2.5 bg-[#46B7B0] hover:bg-[#3ba29b] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  Simpan & Sambung
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                URL juga boleh ditetapkan secara kekal dalam fail <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-teal-800">src/config.ts</code>.
              </p>
            </div>

            {/* Butang Tindakan Utama */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => loadData(true)}
                disabled={isLoading || isRefreshing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#171717] hover:bg-[#333333] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>CUBA SEMULA</span>
              </button>


            </div>

            {/* Spesifikasi Spreadsheet */}
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-500 font-medium">
              <span>Lembaran: DATA · FORM_STATUS · DRAFT · LATEST_STATUS</span>
            </div>

          </div>
        </main>

        {/* Kaki Portal */}
        <footer className="bg-white border-t border-stone-200 text-center py-6 text-xs text-stone-500 space-y-1">
          <p className="font-bold text-stone-700">PELAN INDUK BANDAR PINTAR NEGERI SEMBILAN 2040</p>
          <p className="italic font-serif text-[#D92D20] text-xs">“Memacu Inovasi, Menjamin Kelestarian”</p>
          <p className="text-[11px] text-stone-400 pt-1">PLANMalaysia Negeri Sembilan · Kerajaan Negeri Sembilan</p>
        </footer>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FFF9F3] text-[#171717] flex flex-col font-sans selection:bg-[#9EDBD7] selection:text-[#171717]">
        
        {/* Banner Konfigurasi & Ketahanan Sambungan */}
        <SetupBanner
          isDevelopmentPreview={isDevelopmentPreview}
          isStaleFallback={isStaleFallback}
          errorMessage={errorMessage}
          onRetry={() => loadData(true)}
          isRefreshing={isRefreshing}
        />

        {/* Notifikasi Data Terkini Dimuatkan */}
        {showDataNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#171717] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Data terkini telah dimuatkan.</span>
          </div>
        )}

        {/* Navigasi Melekat */}
        <Navbar
          lastUpdated={lastUpdatedTime}
          isRefreshing={isRefreshing}
          onRefresh={() => loadData(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAi={() => setIsAiOpen(true)}
          onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
          isPresentationMode={isPresentationMode}
        />

        {/* Kandungan Utama Portal */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 1. Hero Visual */}
            <Hero
              kpi={data.kpi}
              cms={data.cms}
              onExploreClick={() => handleNavigateToSection('inisiatif')}
              onMapClick={() => handleNavigateToSection('smart-map')}
            />

            {/* 2. Smart Insights Hari Ini (Cerapan AI Faktual Harian) */}
            {data.cms.showAIInsights && (
              <DailyInsights
                insights={dailyInsights}
                onActionClick={handleDailyInsightAction}
                onOpenAiChat={() => setIsAiOpen(true)}
              />
            )}

            {/* 3. Ringkasan Eksekutif (Executive Dashboard) */}
            <ExecutiveDashboard
              kpi={data.kpi}
              agencyStatusSummary={data.agencyStatusSummary}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onNavigateToSection={handleNavigateToSection}
            />

            {/* 4. 7 Komponen Bandar Pintar */}
            <SevenComponents
              components={data.components}
              selectedComponent={filters.selectedComponent}
              onSelectComponent={(c) => handleFilterChange({ selectedComponent: c })}
              onNavigateToInitiatives={() => handleNavigateToSection('inisiatif')}
            />

            {/* 5. Initiative Explorer (Peneroka Inisiatif & Kad) */}
            <InitiativeExplorer
              initiatives={data.initiatives}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onSelectInitiative={(i) => setSelectedInitiative(i)}
              onViewOnMap={handleViewOnMap}
            />

            {/* 6. Prestasi Agensi & Status Borang */}
            {data.cms.showAgencyPerformance && (
              <AgencyPerformance
                agencies={data.agencies}
                initiatives={data.initiatives}
                formStatusList={data.formStatus}
                latestStatusRows={data.latestStatusRows}
                draftRows={data.draftRows}
                onSelectInitiative={(i) => setSelectedInitiative(i)}
                initialSelectedAgency={filters.selectedMainAgency}
              />
            )}

            {/* 7. Inisiatif Fast Track */}
            {data.cms.showFastTrack && (
              <FastTrackSection
                initiatives={data.initiatives}
                onSelectInitiative={(i) => setSelectedInitiative(i)}
              />
            )}

            {/* 8. Carta Analitik Bandar Pintar */}
            <AnalyticsSection
              initiatives={data.initiatives}
              components={data.components}
              agencies={data.agencies}
              agencyStatusSummary={data.agencyStatusSummary}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onNavigateToSection={handleNavigateToSection}
            />

            {/* 9. Smart Map Negeri Sembilan */}
            {data.cms.showSmartMap && (
              <SmartMap
                initiatives={data.initiatives}
                onSelectInitiative={(i) => setSelectedInitiative(i)}
                selectedInitiativeForMap={selectedInitiativeForMap}
              />
            )}

            {/* 10. Jadual Data Pemantauan */}
            <DataTableSection
              initiatives={data.initiatives}
              onSelectInitiative={(i) => setSelectedInitiative(i)}
            />

          </div>
        </main>

        {/* Footer */}
        <Footer
          lastUpdated={lastUpdatedTime}
          cms={data.cms}
        />

        {/* Laci Butiran Inisiatif */}
        <InitiativeDetailModal
          initiative={selectedInitiative}
          onClose={() => setSelectedInitiative(null)}
          onViewOnMap={handleViewOnMap}
        />

        {/* Laci Sembang Nogori Pintar AI */}
        <AiChatDrawer
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          data={data}
          onFilterChange={handleFilterChange}
          onNavigateToSection={handleNavigateToSection}
        />

        {/* Modal Carian Global */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          initiatives={data.initiatives}
          onSelectInitiative={(i) => setSelectedInitiative(i)}
        />

        {/* Mod Pembentangan Mesyuarat Eksekutif */}
        {isPresentationMode && (
          <PresentationMode
            data={data}
            onExit={() => setIsPresentationMode(false)}
          />
        )}

      </div>
    </ErrorBoundary>
  );
}
