/**
 * DEFINISI JENIS DATA NOGORI PINTAR 2040 (DATA LANGSUNG KETAT)
 */

export type SmartComponentType = 
  | 'Smart Government'
  | 'Smart Economy'
  | 'Smart Environment'
  | 'Smart Mobility'
  | 'Smart People'
  | 'Smart Digital Infrastructure'
  | 'Smart Living'
  | 'Smart Digital Infrastruktur';

export type ImplementationStatus = 
  | 'Siap'
  | 'Dalam Pelaksanaan'
  | 'Belum Mula'
  | 'Ditangguh'
  | 'Tiada Data';

export type FormSubmissionStatus = 
  | 'Telah Hantar'
  | 'Draf'
  | 'Belum Hantar';

export type AgencyStatusViewFilter = 
  | 'TELAH HANTAR' 
  | 'DRAF' 
  | 'SEMUA';

export interface CoordinatePoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface DraftInitiativeRecord {
  status: ImplementationStatus;
  peratusKemajuan: number | null;
  kosProjek: number | null;
  isuMasalah: string | null;
  catatan: string | null;
  tarikhKemasKini: string | null;
}

export interface MasterInitiative {
  // Master Identity strictly from DATA sheet
  compositeKey: string;
  komponen: string;
  kodInisiatif: string;
  isFastTrack: boolean;
  inisiatif: string;
  outcome?: string | null;
  agensiUtama: string;
  agensiSokongan?: string | null;
  fasaPelaksanaan: string;
  indikatorIso?: string | null;
  tahapPenarafan?: string | null;
  rawCoordinates?: string | null;
  coordinates: CoordinatePoint[];
  hasCoordinates: boolean;

  // Submitted Performance Data (exclusively from LATEST_STATUS)
  hasSubmittedUpdate?: boolean;
  statusPelaksanaan: ImplementationStatus;
  peratusKemajuan: number | null; // 0 - 100 or null
  kosProjek?: number | null;
  isuMasalah?: string | null;
  catatan?: string | null;
  tarikhKemasKini?: string | null;
  lampiran?: string | null;

  // Unsubmitted Draft Performance Data (exclusively from DRAFT)
  hasDraftUpdate?: boolean;
  draftData?: DraftInitiativeRecord | null;
}

export interface ComponentStatistic {
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  delayed: number;
  noData: number;
  averageProgress: number;
  fastTrackCount: number;
}

export interface AgencyMetricSummary {
  hasData: boolean;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  delayed: number;
  noData: number;
  totalProgress: number;
  progressCount: number;
  averageProgress: number | null;
  fastTrackCount: number;
  totalCost: number;
  lastUpdated: string | null;
}

export interface AgencySummary {
  name: string;
  totalInitiatives: number;
  initiativeKeys: string[];
  sourceStatus?: 'DIHANTAR' | 'DRAF' | 'BELUM HANTAR';
  displayStatus?: 'Telah Hantar' | 'Draf' | 'Belum Hantar';
  formStatus: FormSubmissionStatus;
  lastUpdated: string | null;
  tarikhHantar?: string | null;
  submittedPerformance: AgencyMetricSummary;
  draftPerformance: AgencyMetricSummary;
  averageProgress?: number | null;
  completed?: number;
}

export interface FormStatusRecord {
  agensi: string;
  sourceStatus?: 'DIHANTAR' | 'DRAF' | 'BELUM HANTAR';
  displayStatus?: 'Telah Hantar' | 'Draf' | 'Belum Hantar';
  statusPengisian: FormSubmissionStatus;
  tarikhKemasKini: string | null;
  tarikhKemaskiniTerakhir?: string | null;
  tarikhHantar?: string | null;
}

export interface MonitoringRecord {
  agensi: string;
  initiativeKey: string;
  kodInisiatif?: string;
  komponen?: string;
  statusPelaksanaan: ImplementationStatus;
  peratusKemajuan: number | null;
  kosProjek: number | null;
  isuMasalah?: string | null;
  tarikhKemasKini?: string | null;
  catatan?: string | null;
  lampiran?: string | null;
  statusBorang?: string | null;
  tarikhHantar?: string | null;
}

export interface PortalCmsConfig {
  portalTitle: string;
  portalSubtitle: string;
  tagline: string;
  heroAnnouncement: string;
  welcomeText: string;
  aboutText: string;
  footerText: string;
  showFastTrack: boolean;
  showSmartMap: boolean;
  showAIInsights: boolean;
  showAgencyPerformance: boolean;
  maintenanceNotice: string;
}

export interface PortalKpiSummary {
  totalInitiatives: number;
  totalComponents: number;
  fastTrackCount: number;
  totalAgencies: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  delayedCount: number;
  noDataCount: number;
  averageProgress: number;
  totalCost: number | null;
  mappedInitiativesCount: number;
  totalCoordinatesCount: number;
}

export interface DraftKpiSummary {
  totalDraftInitiatives: number;
  draftAgenciesCount: number;
  draftAverageProgress: number;
  latestDraftUpdated: string | null;
}

export interface PortalBootstrapData {
  ok: boolean;
  generatedAt: string;
  meta: {
    portalTitle: string;
    branding: string;
    tagline: string;
    generatedAt: string;
    cacheDurationSeconds?: number;
    source: string;
    isDevelopmentPreview?: boolean;
  };
  kpi: PortalKpiSummary;
  draftKpi: DraftKpiSummary;
  components: ComponentStatistic[];
  master: {
    initiatives: MasterInitiative[];
  };
  initiatives: MasterInitiative[];
  agencies: AgencySummary[];
  agencyStatus?: FormStatusRecord[];
  formStatus: FormStatusRecord[];
  agencyStatusSummary: {
    telahHantar: number;
    draf: number;
    belumHantar?: number;
    totalAgencies: number;
  };
  submittedPerformance?: { agency: string; performance: AgencyMetricSummary }[];
  draftPerformance?: { agency: string; performance: AgencyMetricSummary }[];
  latestStatusRows?: MonitoringRecord[];
  draftRows?: MonitoringRecord[];
  mapInitiatives: {
    compositeKey: string;
    kodInisiatif: string;
    inisiatif: string;
    komponen: string;
    agensiUtama: string;
    statusPelaksanaan: ImplementationStatus;
    peratusKemajuan: number | null;
    isFastTrack: boolean;
    points: CoordinatePoint[];
  }[];
  totalMapLocations: number;
  cms: PortalCmsConfig;
  diagnostics?: {
    dataInitiatives: number;
    latestStatusRows: number;
    draftRowsRaw: number;
    draftRowsDeduplicated: number;
    submittedAgencies: number;
    draftAgencies: number;
    unmatchedLatestStatus: number;
    unmatchedDraft: number;
  };
  debug?: {
    dataRowsCount: number;
    latestStatusRowsCount: number;
    draftRowsCount: number;
    formStatusRowsCount: number;
    responsesRowsCount: number;
    matchedLatestCount: number;
    matchedDraftCount: number;
    unmatchedLatestCount: number;
    unmatchedDraftCount: number;
  };
}

export interface ActiveFilters {
  searchQuery: string;
  selectedComponent: string | null;
  selectedStatus: ImplementationStatus | null;
  fastTrackOnly: boolean;
  selectedMainAgency: string | null;
  selectedPhase: string | null;
  selectedRatingLevel: string | null;
  sortBy: 'kod' | 'nama' | 'kemajuan' | 'status' | 'komponen';
  sortOrder: 'asc' | 'desc';
}
