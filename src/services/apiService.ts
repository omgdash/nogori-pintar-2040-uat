/**
 * PERKHIDMATAN API & PENYELARASAN DATA LANGSUNG (TANPA DATA PALSU)
 * Pelan Induk Bandar Pintar Negeri Sembilan 2040
 * 
 * SUMBER: Google Apps Script Web App
 */

import { CONFIG, isApiConfigured } from '../config';
import { PortalBootstrapData, AgencySummary, MonitoringRecord } from '../types';
import { 
  normalizeAgencyName, 
  normalizeComponent, 
  normalizeInitiativeKey, 
  buildInitiativeKey 
} from '../utils/formatters';

const STORAGE_KEY = 'nogori_pintar_last_live_bootstrap_data';
const STORAGE_TIME_KEY = 'nogori_pintar_last_live_fetch_time';
const CUSTOM_URL_KEY = 'nogori_pintar_custom_api_url';

export interface FetchResult {
  data: PortalBootstrapData | null;
  isFromCache: boolean;
  isStaleFallback: boolean;
  isDevelopmentPreview?: boolean;
  error?: string | null;
  lastLoadedTime: string;
}

// In-flight request deduplication guard & controller management
let inFlightRequest: Promise<FetchResult> | null = null;
let currentAbortController: AbortController | null = null;
const REQUEST_TIMEOUT_MS = 30000; // 30 saat untuk respons Google Apps Script yang stabil

/**
 * Dapatkan URL API aktif.
 * Keutamaan 1: src/config.ts (untuk build pengeluaran & GitHub Pages tanpa bergantung kepada localStorage)
 * Keutamaan 2: Storan tempatan semasa mod pratonton pembangunan jika ada
 */
export function getActiveApiUrl(): string | null {
  if (isApiConfigured()) {
    return CONFIG.API_URL.trim();
  }

  try {
    const customUrl = localStorage.getItem(CUSTOM_URL_KEY);
    if (customUrl && customUrl.startsWith('https://script.google.com/') && customUrl.includes('/exec')) {
      return customUrl.trim();
    }
  } catch (e) {}

  return null;
}

/**
 * Segerakkan URL Google Apps Script ke fail src/config.ts secara kekal
 * melalui dev server semasa pratonton pembangunan aktif
 */
export async function syncUrlToConfigFile(url: string): Promise<boolean> {
  if (!url || !url.startsWith('https://script.google.com/') || !url.includes('/exec')) {
    return false;
  }
  try {
    const res = await fetch('./api/sync-api-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: url.trim() })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Simpan URL API khusus daripada antaramuka persediaan
 */
export function saveCustomApiUrl(url: string): void {
  try {
    localStorage.setItem(CUSTOM_URL_KEY, url.trim());
  } catch (e) {}
  syncUrlToConfigFile(url).catch(() => {});
}

/**
 * Padam cache data tempatan jika perlu muat semula sepenuhnya
 */
export function clearLiveCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIME_KEY);
  } catch (e) {}
}

/**
 * Muat data langsung secara ketat daripada Google Apps Script API.
 * TIDAK MENGGUNAKAN SEBARANG DATA PALSU (NO MOCK DATA).
 */
export async function fetchPortalData(forceFresh = false): Promise<FetchResult> {
  // Jika terdapat permintaan yang sedang berjalan dan bukan paksa muat semula,
  // kongsi janji (promise) sedia ada untuk mengelakkan ralat perlumbaan / penduaan
  if (inFlightRequest && !forceFresh) {
    return inFlightRequest;
  }

  // Jika forceFresh diminta manakala ada permintaan lama, batalkan permintaan terdahulu dengan selamat
  if (forceFresh && currentAbortController) {
    try {
      currentAbortController.abort();
    } catch (e) {}
    currentAbortController = null;
    inFlightRequest = null;
  }

  const fetchPromise = (async (): Promise<FetchResult> => {
    const apiUrl = getActiveApiUrl();

    // Jika URL API belum dimasukkan
    if (!apiUrl) {
      // Semak sama ada data sah pernah dimuatkan sebelum ini dalam cache
      const cachedLive = loadFromCache();
      if (cachedLive) {
        console.info('Menggunakan data langsung terdahulu daripada cache tempatan.');
        return {
          data: cachedLive.data,
          isFromCache: true,
          isStaleFallback: true,
          error: 'Sila masukkan URL Google Apps Script Web App untuk kemas kini langsung terkini.',
          lastLoadedTime: cachedLive.time
        };
      }

      return {
        data: null,
        isFromCache: false,
        isStaleFallback: false,
        error: 'URL Google Apps Script Web App belum dikonfigurasikan. Sila masukkan URL Web App anda.',
        lastLoadedTime: ''
      };
    }

    const endpoint = new URL(apiUrl);
    endpoint.searchParams.set('action', 'bootstrap');
    if (forceFresh) {
      endpoint.searchParams.set('refresh', '1');
      endpoint.searchParams.set('t', Date.now().toString());
    }

    const controller = new AbortController();
    currentAbortController = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        redirect: 'follow',
        mode: 'cors'
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ralat pelayan: HTTP ${response.status}`);
      }

      const json = await response.json();
      if (!json || !json.ok || !json.initiatives || !Array.isArray(json.initiatives)) {
        throw new Error(json.error || 'Format respons tidak sah daripada Google Apps Script.');
      }

      // SAHKAN: Semua inisiatif MESTI berasal daripada lembaran DATA sebenar
      const validatedData = validateLiveDataset(json as PortalBootstrapData);

      const updateTime = new Date().toLocaleTimeString('ms-MY', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      // Simpan salinan data langsung ke dalam localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedData));
        localStorage.setItem(STORAGE_TIME_KEY, updateTime);
      } catch (e) {}

      // Debug metadata dalam konsol pembangunan
      logDebugDiagnostics(validatedData);

      return {
        data: validatedData,
        isFromCache: false,
        isStaleFallback: false,
        error: null,
        lastLoadedTime: updateTime
      };

    } catch (error: any) {
      clearTimeout(timeoutId);

      // KATEGORI PEMBATALAN: Pembatalan permintaan yang disengajakan (AbortError)
      const isAbortError = 
        error?.name === 'AbortError' || 
        (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError');

      if (isAbortError) {
        // Gunakan console.debug sahaja untuk tujuan pembangunan tanpa ralat merah
        console.debug('Permintaan API Google Apps Script dibatalkan (AbortController / pembatalan dijangka).');

        const cachedLive = loadFromCache();
        return {
          data: cachedLive ? cachedLive.data : null,
          isFromCache: !!cachedLive,
          isStaleFallback: false, // Elakkan banner amaran ralat kerana ini hanya pembatalan normal
          error: null,
          lastLoadedTime: cachedLive ? cachedLive.time : ''
        };
      }

      // HANYA log ralat tulen dalam konsol
      console.error('Ralat sambungan API Google Apps Script:', error);

      // Sekiranya ralat sebenar berlaku, muat data terdahulu daripada cache tempatan
      const cachedLive = loadFromCache();
      if (cachedLive) {
        return {
          data: cachedLive.data,
          isFromCache: true,
          isStaleFallback: true,
          error: 'Data langsung tidak dapat dikemas kini buat sementara waktu. Memaparkan data terakhir yang berjaya dimuatkan.',
          lastLoadedTime: cachedLive.time
        };
      }

      // Jika tiada cache dan kegagalan tulen berlaku
      return {
        data: null,
        isFromCache: false,
        isStaleFallback: false,
        error: 'Data langsung tidak dapat dimuatkan buat sementara waktu. Sila semak sambungan atau cuba semula.',
        lastLoadedTime: ''
      };
    } finally {
      if (currentAbortController === controller) {
        currentAbortController = null;
      }
      inFlightRequest = null;
    }
  })();

  inFlightRequest = fetchPromise;
  return fetchPromise;
}

/**
 * Muat data daripada cache selamat jika ada
 */
function loadFromCache(): { data: PortalBootstrapData; time: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const time = localStorage.getItem(STORAGE_TIME_KEY) || 'Terdahulu';
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.initiatives && parsed.initiatives.length > 0) {
        return { data: parsed as PortalBootstrapData, time };
      }
    }
  } catch (e) {}
  return null;
}

/**
 * Pengesahan Ketat Integriti Data (Requirement 52 & 53)
 */
function validateLiveDataset(data: PortalBootstrapData): PortalBootstrapData {
  if (!data.master || !data.master.initiatives) {
    data.master = { initiatives: data.initiatives || [] };
  }

  // Normalisasi ketat bagi semua inisiatif master DATA (Section 1, 2, 4, 5)
  (data.initiatives || []).forEach(init => {
    init.komponen = normalizeComponent(init.komponen) || 'Smart Government';
    init.kodInisiatif = (init.kodInisiatif || '').trim();
    init.compositeKey = normalizeInitiativeKey(init.compositeKey) || buildInitiativeKey(init.komponen, init.kodInisiatif);
  });

  if (data.master && Array.isArray(data.master.initiatives)) {
    data.master.initiatives.forEach(init => {
      init.komponen = normalizeComponent(init.komponen) || 'Smart Government';
      init.kodInisiatif = (init.kodInisiatif || '').trim();
      init.compositeKey = normalizeInitiativeKey(init.compositeKey) || buildInitiativeKey(init.komponen, init.kodInisiatif);
    });
  }

  if (data.mapInitiatives && Array.isArray(data.mapInitiatives)) {
    data.mapInitiatives.forEach(m => {
      m.komponen = normalizeComponent(m.komponen) || 'Smart Government';
      m.kodInisiatif = (m.kodInisiatif || '').trim();
      m.compositeKey = normalizeInitiativeKey(m.compositeKey) || buildInitiativeKey(m.komponen, m.kodInisiatif);
    });
  }

  if (data.components && Array.isArray(data.components)) {
    data.components.forEach(cs => {
      cs.name = normalizeComponent(cs.name) || cs.name;
    });
  }

  // Set kunci inisiatif DATA master yang sah
  const validMasterKeys = new Set<string>();
  data.initiatives.forEach(i => {
    validMasterKeys.add(i.compositeKey);
  });

  // Tapis sebarang rekod yang bukan dari DATA
  data.initiatives = data.initiatives.filter(i => validMasterKeys.has(i.compositeKey));

  // Tapis penanda peta hanya kepada inisiatif master
  if (data.mapInitiatives) {
    data.mapInitiatives = data.mapInitiatives.filter(m => validMasterKeys.has(m.compositeKey));
  }

  // Hak cipta rasmi terkini
  if (data.cms) {
    data.cms.footerText = 'Hak Cipta Terpelihara © 2026 PLANMalaysia Negeri Sembilan.';
  }

  // Sahkan agensi: MESTI SATU AGENSI TULIN berasaskan FORM_STATUS sahaja (tidak sesekali guna rentetan gabungan)
  data = sanitizeAgenciesFromFormStatus(data);

  // Penyelarasan Agency Status Summary (Requirement 2 & 3: Hanya Telah Hantar & Draf, Tiada Belum Hantar)
  const formRecords = data.formStatus || data.agencyStatus;
  if (formRecords && Array.isArray(formRecords) && formRecords.length > 0) {
    let submittedCount = 0;
    let draftCount = 0;
    const seenAgencies = new Set<string>();

    formRecords.forEach(f => {
      const name = (f.agensi || '').trim().toUpperCase();
      if (!name || seenAgencies.has(name)) return;
      seenAgencies.add(name);

      const status = (f.sourceStatus || f.statusPengisian || f.displayStatus || '').toUpperCase();
      if (status.includes('BELUM') || status.includes('NOT SUBMIT')) {
        // Belum Hantar: TIDAK dimasukkan dalam Agensi Dalam Pemantauan
      } else if (status.includes('DIHANTAR') || status.includes('HANTAR') || status.includes('SUBMIT')) {
        submittedCount++;
      } else if (status.includes('DRAF') || status.includes('DRAFT')) {
        draftCount++;
      }
    });

    const totalMonitored = submittedCount + draftCount;
    data.agencyStatusSummary = {
      telahHantar: submittedCount,
      draf: draftCount,
      totalAgencies: totalMonitored
    };
    if (data.kpi) {
      data.kpi.totalAgencies = totalMonitored;
    }
  }

  // INITIATIVE KEY COST DEDUPLICATION (Requirement 10 & 11)
  // Setiap Initiative Key menyumbang paling banyak SATU nilai kos sahaja
  const costByKey = new Map<string, { cost: number; date: string | null }>();
  (data.initiatives || []).forEach(init => {
    const cost = init.kosProjek;
    if (cost !== null && cost !== undefined && !isNaN(cost) && cost > 0 && init.hasSubmittedUpdate) {
      const key = init.compositeKey;
      if (!costByKey.has(key)) {
        costByKey.set(key, { cost, date: init.tarikhKemasKini || null });
      } else {
        const prev = costByKey.get(key)!;
        if (prev.cost !== cost) {
          console.warn(`[AMARAN KOS BERBEZA] Initiative Key ${key} mempunyai kos berbeza (${prev.cost} vs ${cost}).`);
          if (init.tarikhKemasKini && (!prev.date || init.tarikhKemasKini > prev.date)) {
            costByKey.set(key, { cost, date: init.tarikhKemasKini });
          }
        }
      }
    }
  });

  if (costByKey.size > 0 && data.kpi) {
    let totalDeduplicatedCost = 0;
    costByKey.forEach(item => {
      totalDeduplicatedCost += item.cost;
    });
    data.kpi.totalCost = totalDeduplicatedCost;
  }

  // PURATA KEMAJUAN PERINGKAT NEGERI RASMI (Requirement 11)
  // Hanya inisiatif yang mempunyai data kemajuan sah dalam LATEST_STATUS (hasSubmittedUpdate = true)
  // DRAF TIDAK dimasukkan. Numeric 0 adalah sah, blank/null dikecualikan daripada penyebut.
  const validSubmittedProgress = (data.initiatives || []).filter(
    init => init.hasSubmittedUpdate && init.peratusKemajuan !== null && typeof init.peratusKemajuan === 'number' && !isNaN(init.peratusKemajuan)
  );

  if (validSubmittedProgress.length > 0 && data.kpi) {
    const totalProgressSum = validSubmittedProgress.reduce(
      (acc, init) => acc + (init.peratusKemajuan as number),
      0
    );
    data.kpi.averageProgress = Math.round(totalProgressSum / validSubmittedProgress.length);
    data.kpi.noDataCount = (data.initiatives || []).length - validSubmittedProgress.length;
  }

  return data;
}

/**
 * Memastikan senarai agensi Prestasi Agensi MESTI mewakili satu agensi tulin berasaskan FORM_STATUS
 */
function sanitizeAgenciesFromFormStatus(data: PortalBootstrapData): PortalBootstrapData {
  const formStatusRecords = data.formStatus || data.agencyStatus;
  if (!formStatusRecords || !Array.isArray(formStatusRecords) || formStatusRecords.length === 0) {
    return data;
  }

  // 1. Cipta senarai nama agensi master yang sah daripada FORM_STATUS
  const validFormRecords = formStatusRecords.filter(f => f.agensi && f.agensi.trim() !== '');
  if (validFormRecords.length === 0) return data;

  const cleanAgencyMap = new Map<string, AgencySummary>();

  validFormRecords.forEach(f => {
    const trimmedName = f.agensi.trim();
    const normKey = normalizeAgencyName(trimmedName);
    if (!cleanAgencyMap.has(normKey)) {
      cleanAgencyMap.set(normKey, {
        name: trimmedName,
        totalInitiatives: 0,
        initiativeKeys: [],
        sourceStatus: f.sourceStatus,
        displayStatus: f.displayStatus,
        formStatus: f.statusPengisian || f.displayStatus || 'Belum Hantar',
        lastUpdated: f.tarikhKemaskiniTerakhir || f.tarikhKemasKini || null,
        tarikhHantar: f.tarikhHantar || null,
        submittedPerformance: {
          hasData: false,
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          delayed: 0,
          noData: 0,
          totalProgress: 0,
          progressCount: 0,
          averageProgress: null,
          fastTrackCount: 0,
          totalCost: 0,
          lastUpdated: null
        },
        draftPerformance: {
          hasData: false,
          total: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          delayed: 0,
          noData: 0,
          totalProgress: 0,
          progressCount: 0,
          averageProgress: null,
          fastTrackCount: 0,
          totalCost: 0,
          lastUpdated: null
        }
      });
    }
  });

  // 1.5. Ambil rekod LATEST_STATUS dan DRAFT mentah/terkini mengikut dimensi AGENSI + INITIATIVE KEY
  const rawLatestStatusRows = data.latestStatusRows || (data as any).latestStatus || [];
  const rawDraftRows = data.draftRows || (data as any).draftStatus || [];

  // Audit integriti komponen dan kunci inisiatif (Section 7)
  const auditAndNormalizeRow = (row: any, source: string) => {
    if (!row.initiativeKey) return;
    const canonKey = normalizeInitiativeKey(row.initiativeKey);
    row.initiativeKey = canonKey;

    const keyCompPart = canonKey.includes('|') ? canonKey.split('|')[0] : '';
    const keyExpectedComp = normalizeComponent(keyCompPart);

    const rawComp = row.komponen;
    const normComp = normalizeComponent(rawComp);

    if (normComp && keyExpectedComp && normComp !== keyExpectedComp) {
      // Konflik integriti data: Komponen bercanggah dengan Kunci Inisiatif
      row.integrityConflict = true;
      row.conflictReason = `Komponen (${normComp}) bercanggah dengan Initiative Key (${canonKey})`;
      console.warn(`[AMARAN INTEGRITI DATA ${source}] Agensi ${row.agensi}: Komponen "${normComp}" bercanggah dengan Kunci "${canonKey}".`);
    } else {
      // Jika Komponen mengandungi Kunci Inisiatif penuh atau variasi ejaan, seragamkan kepada nama rasmi
      row.komponen = keyExpectedComp || normComp || row.komponen;
    }
  };

  rawLatestStatusRows.forEach((r: any) => auditAndNormalizeRow(r, 'LATEST_STATUS'));
  rawDraftRows.forEach((r: any) => auditAndNormalizeRow(r, 'DRAFT'));

  // Padankan rekod LATEST_STATUS khusus kepada agensi FORM_STATUS (Hanya agensi bertaraf DIHANTAR)
  rawLatestStatusRows.forEach((row: any) => {
    if (!row.agensi || !row.initiativeKey) return;
    const normRowAg = normalizeAgencyName(row.agensi);
    const ag = cleanAgencyMap.get(normRowAg);
    if (ag && ag.sourceStatus === 'DIHANTAR') {
      if (!ag.initiativeKeys.includes(row.initiativeKey)) {
        ag.initiativeKeys.push(row.initiativeKey);
      }
    }
  });

  // Padankan rekod DRAFT khusus kepada agensi FORM_STATUS (Hanya agensi bertaraf DRAF)
  rawDraftRows.forEach((row: any) => {
    if (!row.agensi || !row.initiativeKey) return;
    const normRowAg = normalizeAgencyName(row.agensi);
    const ag = cleanAgencyMap.get(normRowAg);
    if (ag && ag.sourceStatus === 'DRAF') {
      if (!ag.initiativeKeys.includes(row.initiativeKey)) {
        ag.initiativeKeys.push(row.initiativeKey);
      }
    }
  });

  // Salin initiativeKeys sedia ada daripada data.agencies lama jika ada
  (data.agencies || []).forEach(oldAg => {
    const oldNorm = normalizeAgencyName(oldAg.name);
    const target = cleanAgencyMap.get(oldNorm);
    if (target && Array.isArray(oldAg.initiativeKeys)) {
      oldAg.initiativeKeys.forEach(k => {
        const normK = normalizeInitiativeKey(k);
        if (!target.initiativeKeys.includes(normK)) {
          target.initiativeKeys.push(normK);
        }
      });
    }
  });

  // Padankan inisiatif master dengan agensi secara seragam (termasuk koma & baris baharu)
  (data.initiatives || []).forEach(init => {
    const rawMain = init.agensiUtama || '';
    const parts = rawMain.split(/[,\n\r]+/).map(p => normalizeAgencyName(p)).filter(Boolean);
    const initNorm = normalizeAgencyName(rawMain);
    const subNorm = normalizeAgencyName((init as any).submittedAgency || (init as any).agency);

    cleanAgencyMap.forEach((ag, normKey) => {
      const isMatch = 
        initNorm === normKey || 
        subNorm === normKey || 
        parts.includes(normKey);

      if (isMatch) {
        if (!ag.initiativeKeys.includes(init.compositeKey)) {
          ag.initiativeKeys.push(init.compositeKey);
        }
      }
    });
  });

  // 2. Kira metrik prestasi TELAH HANTAR & DRAF bagi setiap agensi berdasarkan rekod khususnya
  cleanAgencyMap.forEach((ag, normKey) => {
    // FORM_STATUS sebagai Pihak Berkuasa Mutlak:
    // A. Rekod khusus LATEST_STATUS bagi agensi ini (HANYA jika agensi bertaraf DIHANTAR)
    const agencySpecificLatest = ag.sourceStatus === 'DIHANTAR'
      ? rawLatestStatusRows.filter((r: any) => normalizeAgencyName(r.agensi) === normKey)
      : [];

    // B. Inisiatif master berkaitan agensi ini
    const agInits = (data.initiatives || []).filter(i => {
      return (
        ag.initiativeKeys.includes(i.compositeKey) ||
        normalizeAgencyName(i.agensiUtama) === normKey ||
        normalizeAgencyName((i as any).submittedAgency || (i as any).agency) === normKey
      );
    });

    const allKeys = new Set<string>([
      ...ag.initiativeKeys,
      ...agencySpecificLatest.map((r: any) => r.initiativeKey)
    ]);
    const uniqueKeys = Array.from(allKeys);
    ag.initiativeKeys = uniqueKeys;
    ag.totalInitiatives = uniqueKeys.length;

    // A. Prestasi Telah Hantar (LATEST_STATUS) - HANYA agensi bertaraf DIHANTAR
    if (ag.sourceStatus === 'DIHANTAR') {
      if (agencySpecificLatest.length > 0) {
        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;
        let delayed = 0;
        let noData = 0;
        let totalProg = 0;
        let progCount = 0;
        let ftCount = 0;
        let totalCost = 0;
        let latestDate: string | null = null;
        const seenCostKeys = new Set<string>();

        agencySpecificLatest.forEach((r: any) => {
          if (r.statusPelaksanaan === 'Siap') completed++;
          else if (r.statusPelaksanaan === 'Dalam Pelaksanaan') inProgress++;
          else if (r.statusPelaksanaan === 'Belum Mula') notStarted++;
          else if (r.statusPelaksanaan === 'Ditangguh') delayed++;
          else noData++;

          if (r.peratusKemajuan !== null && typeof r.peratusKemajuan === 'number' && !isNaN(r.peratusKemajuan)) {
            totalProg += r.peratusKemajuan;
            progCount++;
          }

          const masterRef = (data.initiatives || []).find(i => normalizeInitiativeKey(i.compositeKey) === normalizeInitiativeKey(r.initiativeKey));
          if (masterRef?.isFastTrack) ftCount++;

          if (r.kosProjek && !seenCostKeys.has(r.initiativeKey)) {
            seenCostKeys.add(r.initiativeKey);
            totalCost += r.kosProjek;
          }

          if (r.tarikhKemasKini && (!latestDate || r.tarikhKemasKini > latestDate)) {
            latestDate = r.tarikhKemasKini;
          }
        });

        ag.submittedPerformance = {
          hasData: true,
          total: agencySpecificLatest.length,
          completed,
          inProgress,
          notStarted,
          delayed,
          noData,
          totalProgress: totalProg,
          progressCount: progCount,
          averageProgress: progCount > 0 ? Math.round(totalProg / progCount) : null,
          fastTrackCount: ftCount,
          totalCost,
          lastUpdated: latestDate || ag.lastUpdated
        };
      } else {
        const submittedInits = agInits.filter(i => 
          i.hasSubmittedUpdate || 
          (i.statusPelaksanaan && i.statusPelaksanaan !== 'Tiada Data') ||
          (i.peratusKemajuan !== null && typeof i.peratusKemajuan === 'number')
        );

        if (submittedInits.length > 0) {
          let completed = 0;
          let inProgress = 0;
          let notStarted = 0;
          let delayed = 0;
          let noData = 0;
          let totalProg = 0;
          let progCount = 0;
          let ftCount = 0;
          let totalCost = 0;
          let latestDate: string | null = null;
          const seenCostKeys = new Set<string>();

          submittedInits.forEach(i => {
            if (i.statusPelaksanaan === 'Siap') completed++;
            else if (i.statusPelaksanaan === 'Dalam Pelaksanaan') inProgress++;
            else if (i.statusPelaksanaan === 'Belum Mula') notStarted++;
            else if (i.statusPelaksanaan === 'Ditangguh') delayed++;
            else noData++;

            if (i.peratusKemajuan !== null && typeof i.peratusKemajuan === 'number' && !isNaN(i.peratusKemajuan)) {
              totalProg += i.peratusKemajuan;
              progCount++;
            }

            if (i.isFastTrack) ftCount++;

            if (i.kosProjek && !seenCostKeys.has(i.compositeKey)) {
              seenCostKeys.add(i.compositeKey);
              totalCost += i.kosProjek;
            }

            if (i.tarikhKemasKini && (!latestDate || i.tarikhKemasKini > latestDate)) {
              latestDate = i.tarikhKemasKini;
            }
          });

          ag.submittedPerformance = {
            hasData: true,
            total: submittedInits.length,
            completed,
            inProgress,
            notStarted,
            delayed,
            noData,
            totalProgress: totalProg,
            progressCount: progCount,
            averageProgress: progCount > 0 ? Math.round(totalProg / progCount) : null,
            fastTrackCount: ftCount,
            totalCost,
            lastUpdated: latestDate || ag.lastUpdated
          };
        }
      }
    }

    // B. Prestasi Draf (DRAFT) - HANYA agensi bertaraf DRAF
    const agencySpecificDraft = ag.sourceStatus === 'DRAF'
      ? rawDraftRows.filter((r: any) => normalizeAgencyName(r.agensi) === normKey)
      : [];

    if (ag.sourceStatus === 'DRAF' && agencySpecificDraft.length > 0) {
      let dCompleted = 0;
      let dInProgress = 0;
      let dNotStarted = 0;
      let dDelayed = 0;
      let dNoData = 0;
      let dTotalProg = 0;
      let dProgCount = 0;
      let dFtCount = 0;
      let dTotalCost = 0;
      let dLatestDate: string | null = null;
      const seenDraftCostKeys = new Set<string>();

      agencySpecificDraft.forEach((r: any) => {
        if (r.statusPelaksanaan === 'Siap') dCompleted++;
        else if (r.statusPelaksanaan === 'Dalam Pelaksanaan') dInProgress++;
        else if (r.statusPelaksanaan === 'Belum Mula') dNotStarted++;
        else if (r.statusPelaksanaan === 'Ditangguh') dDelayed++;
        else dNoData++;

        if (r.peratusKemajuan !== null && typeof r.peratusKemajuan === 'number' && !isNaN(r.peratusKemajuan)) {
          dTotalProg += r.peratusKemajuan;
          dProgCount++;
        }

        const masterRef = (data.initiatives || []).find(i => normalizeInitiativeKey(i.compositeKey) === normalizeInitiativeKey(r.initiativeKey));
        if (masterRef?.isFastTrack) dFtCount++;

        if (r.kosProjek && !seenDraftCostKeys.has(r.initiativeKey)) {
          seenDraftCostKeys.add(r.initiativeKey);
          dTotalCost += r.kosProjek;
        }

        if (r.tarikhKemasKini && (!dLatestDate || r.tarikhKemasKini > dLatestDate)) {
          dLatestDate = r.tarikhKemasKini;
        }
      });

      ag.draftPerformance = {
        hasData: true,
        total: agencySpecificDraft.length,
        completed: dCompleted,
        inProgress: dInProgress,
        notStarted: dNotStarted,
        delayed: dDelayed,
        noData: dNoData,
        totalProgress: dTotalProg,
        progressCount: dProgCount,
        averageProgress: dProgCount > 0 ? Math.round(dTotalProg / dProgCount) : null,
        fastTrackCount: dFtCount,
        totalCost: dTotalCost,
        lastUpdated: dLatestDate || ag.lastUpdated
      };
    } else {
      const draftInits = agInits.filter(i => i.hasDraftUpdate && i.draftData);
      if (draftInits.length > 0) {
        let dCompleted = 0;
        let dInProgress = 0;
        let dNotStarted = 0;
        let dDelayed = 0;
        let dNoData = 0;
        let dTotalProg = 0;
        let dProgCount = 0;
        let dFtCount = 0;
        let dTotalCost = 0;
        let dLatestDate: string | null = null;
        const seenDraftCostKeys = new Set<string>();

        draftInits.forEach(i => {
          const dd = i.draftData!;
          if (dd.status === 'Siap') dCompleted++;
          else if (dd.status === 'Dalam Pelaksanaan') dInProgress++;
          else if (dd.status === 'Belum Mula') dNotStarted++;
          else if (dd.status === 'Ditangguh') dDelayed++;
          else dNoData++;

          if (dd.peratusKemajuan !== null && typeof dd.peratusKemajuan === 'number' && !isNaN(dd.peratusKemajuan)) {
            dTotalProg += dd.peratusKemajuan;
            dProgCount++;
          }

          if (i.isFastTrack) dFtCount++;

          if (dd.kosProjek && !seenDraftCostKeys.has(i.compositeKey)) {
            seenDraftCostKeys.add(i.compositeKey);
            dTotalCost += dd.kosProjek;
          }

          if (dd.tarikhKemasKini && (!dLatestDate || dd.tarikhKemasKini > dLatestDate)) {
            dLatestDate = dd.tarikhKemasKini;
          }
        });

        ag.draftPerformance = {
          hasData: true,
          total: draftInits.length,
          completed: dCompleted,
          inProgress: dInProgress,
          notStarted: dNotStarted,
          delayed: dDelayed,
          noData: dNoData,
          totalProgress: dTotalProg,
          progressCount: dProgCount,
          averageProgress: dProgCount > 0 ? Math.round(dTotalProg / dProgCount) : null,
          fastTrackCount: dFtCount,
          totalCost: dTotalCost,
          lastUpdated: dLatestDate || ag.lastUpdated
        };
      }
    }
  });

  const newAgenciesList = Array.from(cleanAgencyMap.values());
  newAgenciesList.sort((a, b) => a.name.localeCompare(b.name));
  data.agencies = newAgenciesList;
  if (data.kpi) {
    data.kpi.totalAgencies = newAgenciesList.length;
  }

  return data;
}


/**
 * Log Diagnostik Pembangunan (Requirement 35)
 */
function logDebugDiagnostics(data: PortalBootstrapData) {
  if (data.diagnostics) {
    console.info('📊 [LIVE DATA DIAGNOSTICS]', data.diagnostics);
  }
  if (data.debug) {
    console.info('📊 [DATA INTEGRITY CHECK]');
    console.info('DATA rows:', data.debug.dataRowsCount);
    console.info('LATEST_STATUS rows:', data.debug.latestStatusRowsCount);
    console.info('DRAFT rows:', data.debug.draftRowsCount);
    console.info('FORM_STATUS rows:', data.debug.formStatusRowsCount);
    console.info('RESPONSES rows:', data.debug.responsesRowsCount);
    console.info('Matched submitted records:', data.debug.matchedLatestCount);
    console.info('Matched draft records:', data.debug.matchedDraftCount);
    console.info('Unmatched latest records:', data.debug.unmatchedLatestCount);
    console.info('Unmatched draft records:', data.debug.unmatchedDraftCount);
  }
}
