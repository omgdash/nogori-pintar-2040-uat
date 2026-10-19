import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PauseCircle, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  FileCheck2, 
  FileText, 
  FileX2,
  Calendar,
  ChevronRight,
  Eye,
  Layers,
  ArrowRightLeft,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { 
  AgencySummary, 
  MasterInitiative, 
  FormStatusRecord, 
  MonitoringRecord,
  AgencyStatusViewFilter 
} from '../types';
import { 
  formatCurrency, 
  formatNumber, 
  getStatusStyle, 
  getFormStatusStyle, 
  getComponentColor,
  normalizeAgencyName,
  normalizeComponent,
  normalizeInitiativeKey
} from '../utils/formatters';

interface AgencyPerformanceProps {
  agencies: AgencySummary[];
  initiatives: MasterInitiative[];
  formStatusList: FormStatusRecord[];
  latestStatusRows?: MonitoringRecord[];
  draftRows?: MonitoringRecord[];
  onSelectInitiative: (initiative: MasterInitiative) => void;
  initialSelectedAgency?: string | null;
}

export const AgencyPerformance: React.FC<AgencyPerformanceProps> = ({
  agencies,
  initiatives,
  formStatusList,
  latestStatusRows = [],
  draftRows = [],
  onSelectInitiative,
  initialSelectedAgency
}) => {
  // Pilihan mod paparan data: TELAH HANTAR (LATEST_STATUS) atau DRAF (DRAFT)
  const [statusView, setStatusView] = useState<AgencyStatusViewFilter>(() => {
    const hasSubmitted = agencies.some(a => a.submittedPerformance.hasData || a.formStatus === 'Telah Hantar' || a.sourceStatus === 'DIHANTAR');
    return hasSubmitted ? 'TELAH HANTAR' : 'DRAF';
  });

  const [selectedAgencyName, setSelectedAgencyName] = useState<string>('');
  const [agencySearchQuery, setAgencySearchQuery] = useState('');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fastTrackFilter, setFastTrackFilter] = useState<boolean>(false);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  // Rujukan elemen senarai inisiatif untuk tatalan lancar (Requirement 17)
  const initiativesListRef = useRef<HTMLDivElement>(null);

  // Reset filter inisiatif apabila bertukar agensi atau bertukar mod sumber data (Requirements 15 & 16)
  useEffect(() => {
    setStatusFilter('');
    setFastTrackFilter(false);
  }, [selectedAgencyName, statusView]);

  // Tapis agensi mengikut Paparan Data yang dipilih: FORM_STATUS adalah sumber mutlak status semasa (Requirement E & Acceptance Tests 8 & 9)
  const selectableAgencies = useMemo(() => {
    // FORM_STATUS is the ONLY authority for CURRENT agency status
    const formMap = new Map<string, FormStatusRecord>();
    (formStatusList || []).forEach(f => {
      const norm = normalizeAgencyName(f.agensi);
      if (norm) {
        formMap.set(norm, f);
      }
    });

    return agencies.filter(a => {
      const norm = normalizeAgencyName(a.name);
      const formRec = formMap.get(norm);
      const currentSourceStatus = (formRec?.sourceStatus || a.sourceStatus || '').toUpperCase().trim();
      const currentDisplayStatus = (formRec?.displayStatus || formRec?.statusPengisian || a.formStatus || '').toLowerCase().trim();

      const isDraft = currentSourceStatus === 'DRAF' || currentDisplayStatus.includes('draf');
      const isSubmitted = currentSourceStatus === 'DIHANTAR' || currentDisplayStatus.includes('telah hantar') || currentDisplayStatus.includes('dihantar');

      // Rules:
      // DIHANTAR appears ONLY under TELAH HANTAR
      // DRAF appears ONLY under DRAF
      // Old LATEST_STATUS records must NOT keep a currently-DRAF agency inside TELAH HANTAR (e.g. UPEN, BTM SUKNS)
      if (statusView === 'TELAH HANTAR') {
        return !isDraft && isSubmitted;
      }
      if (statusView === 'DRAF') {
        return isDraft;
      }
      return true;
    });
  }, [agencies, formStatusList, statusView]);

  // Kemaskini agensi aktif sekiranya pilihan berubah
  useEffect(() => {
    if (initialSelectedAgency && agencies.some(a => a.name === initialSelectedAgency)) {
      setSelectedAgencyName(initialSelectedAgency);
    } else if (selectableAgencies.length > 0) {
      if (!selectableAgencies.some(a => a.name === selectedAgencyName)) {
        setSelectedAgencyName(selectableAgencies[0].name);
      }
    }
  }, [statusView, selectableAgencies, initialSelectedAgency]);

  // Agensi semasa yang dipilih
  const currentAgency = useMemo(() => {
    return selectableAgencies.find(a => a.name === selectedAgencyName) || selectableAgencies[0] || null;
  }, [selectedAgencyName, selectableAgencies]);

  // Rekod pemantauan rasmi LATEST_STATUS khusus bagi agensi ini (AGENSI + INITIATIVE KEY)
  const agencySubmittedRows = useMemo(() => {
    if (!currentAgency) return [];
    const currentNorm = normalizeAgencyName(currentAgency.name);
    const rows = (latestStatusRows || []).filter(r => {
      const rNorm = normalizeAgencyName(r.agensi);
      return rNorm === currentNorm;
    });

    const map = new Map<string, MonitoringRecord>();
    rows.forEach(r => {
      if (!map.has(r.initiativeKey)) {
        map.set(r.initiativeKey, r);
      } else {
        const prev = map.get(r.initiativeKey)!;
        if (r.tarikhKemasKini && (!prev.tarikhKemasKini || r.tarikhKemasKini >= prev.tarikhKemasKini)) {
          map.set(r.initiativeKey, r);
        }
      }
    });
    return Array.from(map.values());
  }, [currentAgency, latestStatusRows]);

  // Rekod draf DRAFT khusus bagi agensi ini (AGENSI + INITIATIVE KEY)
  const agencyDraftRows = useMemo(() => {
    if (!currentAgency) return [];
    const currentNorm = normalizeAgencyName(currentAgency.name);
    const rows = (draftRows || []).filter(r => {
      const rNorm = normalizeAgencyName(r.agensi);
      return rNorm === currentNorm;
    });

    const map = new Map<string, MonitoringRecord>();
    rows.forEach(r => {
      if (!map.has(r.initiativeKey)) {
        map.set(r.initiativeKey, r);
      } else {
        const prev = map.get(r.initiativeKey)!;
        if (r.tarikhKemasKini && (!prev.tarikhKemasKini || r.tarikhKemasKini >= prev.tarikhKemasKini)) {
          map.set(r.initiativeKey, r);
        }
      }
    });
    return Array.from(map.values());
  }, [currentAgency, draftRows]);

  // Semua inisiatif yang dimiliki oleh agensi semasa
  const allCurrentAgencyInitiatives = useMemo(() => {
    if (!currentAgency) return [];
    const currentNorm = normalizeAgencyName(currentAgency.name);

    if (statusView === 'TELAH HANTAR' && agencySubmittedRows.length > 0) {
      const list: MasterInitiative[] = agencySubmittedRows.map(r => {
        const normKey = normalizeInitiativeKey(r.initiativeKey);
        const m = initiatives.find(i => normalizeInitiativeKey(i.compositeKey) === normKey);
        return {
          compositeKey: normKey,
          kodInisiatif: m?.kodInisiatif || r.kodInisiatif || normKey.split('|')[1] || '',
          komponen: normalizeComponent(m?.komponen || r.komponen || normKey.split('|')[0]),
          inisiatif: m?.inisiatif || normKey,
          outcome: m?.outcome || '',
          agensiUtama: currentAgency.name,
          agensiSokongan: m?.agensiSokongan || null,
          fasaPelaksanaan: m?.fasaPelaksanaan || '',
          indikatorIso: m?.indikatorIso || null,
          tahapPenarafan: m?.tahapPenarafan || null,
          rawCoordinates: m?.rawCoordinates || null,
          coordinates: m?.coordinates || [],
          hasCoordinates: m?.hasCoordinates || false,
          isFastTrack: m?.isFastTrack || false,
          statusPelaksanaan: r.statusPelaksanaan || 'Tiada Data',
          peratusKemajuan: r.peratusKemajuan,
          kosProjek: r.kosProjek,
          isuMasalah: r.isuMasalah,
          tarikhKemasKini: r.tarikhKemasKini,
          catatan: r.catatan,
          lampiran: r.lampiran,
          hasSubmittedUpdate: true,
          hasDraftUpdate: false,
          draftData: null
        };
      });

      const seenKeys = new Set(list.map(i => i.compositeKey));
      (currentAgency.initiativeKeys || []).forEach(k => {
        const normK = normalizeInitiativeKey(k);
        if (!seenKeys.has(normK)) {
          const m = initiatives.find(i => normalizeInitiativeKey(i.compositeKey) === normK);
          if (m) {
            seenKeys.add(normK);
            list.push(m);
          }
        }
      });
      return list;
    }

    if (statusView === 'DRAF' && agencyDraftRows.length > 0) {
      const list: MasterInitiative[] = agencyDraftRows.map(r => {
        const normKey = normalizeInitiativeKey(r.initiativeKey);
        const m = initiatives.find(i => normalizeInitiativeKey(i.compositeKey) === normKey);
        return {
          compositeKey: normKey,
          kodInisiatif: m?.kodInisiatif || r.kodInisiatif || normKey.split('|')[1] || '',
          komponen: normalizeComponent(m?.komponen || r.komponen || normKey.split('|')[0]),
          inisiatif: m?.inisiatif || normKey,
          outcome: m?.outcome || '',
          agensiUtama: currentAgency.name,
          agensiSokongan: m?.agensiSokongan || null,
          fasaPelaksanaan: m?.fasaPelaksanaan || '',
          indikatorIso: m?.indikatorIso || null,
          tahapPenarafan: m?.tahapPenarafan || null,
          rawCoordinates: m?.rawCoordinates || null,
          coordinates: m?.coordinates || [],
          hasCoordinates: m?.hasCoordinates || false,
          isFastTrack: m?.isFastTrack || false,
          statusPelaksanaan: 'Tiada Data',
          peratusKemajuan: null,
          kosProjek: null,
          hasSubmittedUpdate: false,
          hasDraftUpdate: true,
          draftData: {
            status: r.statusPelaksanaan || 'Tiada Data',
            peratusKemajuan: r.peratusKemajuan,
            kosProjek: r.kosProjek,
            isuMasalah: r.isuMasalah || null,
            catatan: r.catatan || null,
            tarikhKemasKini: r.tarikhKemasKini || null
          }
        };
      });

      const seenKeys = new Set(list.map(i => i.compositeKey));
      (currentAgency.initiativeKeys || []).forEach(k => {
        const normK = normalizeInitiativeKey(k);
        if (!seenKeys.has(normK)) {
          const m = initiatives.find(i => normalizeInitiativeKey(i.compositeKey) === normK);
          if (m) {
            seenKeys.add(normK);
            list.push(m);
          }
        }
      });
      return list;
    }

    return initiatives.filter(i => {
      const isKeyMatch = currentAgency.initiativeKeys && currentAgency.initiativeKeys.some(k => normalizeInitiativeKey(k) === normalizeInitiativeKey(i.compositeKey));
      const isMainMatch = normalizeAgencyName(i.agensiUtama) === currentNorm;
      const isSubMatch = normalizeAgencyName((i as any).submittedAgency || (i as any).agency) === currentNorm;
      return isKeyMatch || isMainMatch || isSubMatch;
    });
  }, [initiatives, currentAgency, statusView, agencySubmittedRows, agencyDraftRows]);

  // Metrik aktif bagi agensi berpandukan statusView yang dipilih (Requirement 7: FINISH PRESTASI AGENSI KPI ACCURACY)
  const activeMetrics = useMemo(() => {
    if (!currentAgency) return null;

    if (statusView === 'DRAF') {
      // DRAF: gunakan rekod DRAFT khusus bagi agensi ini
      if (agencyDraftRows.length > 0) {
        let completed = 0;
        let inProgress = 0;
        let notStarted = 0;
        let delayed = 0;
        let noData = 0;
        let totalProgress = 0;
        let progressCount = 0;
        let fastTrackCount = 0;
        let totalCost = 0;
        let lastUpdated: string | null = null;
        const seenCostKeys = new Set<string>();

        agencyDraftRows.forEach(r => {
          if (r.statusPelaksanaan === 'Siap') completed++;
          else if (r.statusPelaksanaan === 'Dalam Pelaksanaan') inProgress++;
          else if (r.statusPelaksanaan === 'Belum Mula') notStarted++;
          else if (r.statusPelaksanaan === 'Ditangguh') delayed++;
          else noData++;

          if (r.peratusKemajuan !== null && typeof r.peratusKemajuan === 'number' && !isNaN(r.peratusKemajuan)) {
            totalProgress += r.peratusKemajuan;
            progressCount++;
          }

          const m = initiatives.find(i => normalizeInitiativeKey(i.compositeKey) === normalizeInitiativeKey(r.initiativeKey));
          if (m?.isFastTrack) fastTrackCount++;

          if (r.kosProjek && !seenCostKeys.has(r.initiativeKey)) {
            seenCostKeys.add(r.initiativeKey);
            totalCost += r.kosProjek;
          }

          if (r.tarikhKemasKini && (!lastUpdated || r.tarikhKemasKini > lastUpdated)) {
            lastUpdated = r.tarikhKemasKini;
          }
        });

        return {
          sourceName: 'DRAFT',
          isDraft: true,
          data: {
            hasData: true,
            total: allCurrentAgencyInitiatives.length || agencyDraftRows.length,
            completed,
            inProgress,
            notStarted,
            delayed,
            noData,
            totalProgress,
            progressCount,
            averageProgress: progressCount > 0 ? Math.round(totalProgress / progressCount) : null,
            fastTrackCount,
            totalCost,
            lastUpdated: lastUpdated || currentAgency.draftPerformance.lastUpdated || currentAgency.lastUpdated
          },
          lastUpdated: lastUpdated || currentAgency.draftPerformance.lastUpdated || currentAgency.lastUpdated
        };
      }

      const draftInits = allCurrentAgencyInitiatives.filter(i => i.hasDraftUpdate && i.draftData);

      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;
      let delayed = 0;
      let noData = 0;
      let totalProgress = 0;
      let progressCount = 0;
      let fastTrackCount = 0;
      let totalCost = 0;
      let lastUpdated: string | null = null;
      const seenCostKeys = new Set<string>();

      draftInits.forEach(i => {
        const dd = i.draftData!;
        if (dd.status === 'Siap') completed++;
        else if (dd.status === 'Dalam Pelaksanaan') inProgress++;
        else if (dd.status === 'Belum Mula') notStarted++;
        else if (dd.status === 'Ditangguh') delayed++;
        else noData++;

        if (dd.peratusKemajuan !== null && typeof dd.peratusKemajuan === 'number' && !isNaN(dd.peratusKemajuan)) {
          totalProgress += dd.peratusKemajuan;
          progressCount++;
        }

        if (i.isFastTrack) fastTrackCount++;

        if (dd.kosProjek && !seenCostKeys.has(i.compositeKey)) {
          seenCostKeys.add(i.compositeKey);
          totalCost += dd.kosProjek;
        }

        if (dd.tarikhKemasKini && (!lastUpdated || dd.tarikhKemasKini > lastUpdated)) {
          lastUpdated = dd.tarikhKemasKini;
        }
      });

      const hasCalculated = draftInits.length > 0;
      const data = hasCalculated ? {
        hasData: true,
        total: allCurrentAgencyInitiatives.length || draftInits.length,
        completed,
        inProgress,
        notStarted,
        delayed,
        noData,
        totalProgress,
        progressCount,
        averageProgress: progressCount > 0 ? Math.round(totalProgress / progressCount) : null,
        fastTrackCount,
        totalCost,
        lastUpdated: lastUpdated || currentAgency.draftPerformance.lastUpdated || currentAgency.lastUpdated
      } : currentAgency.draftPerformance;

      return {
        sourceName: 'DRAFT',
        isDraft: true,
        data,
        lastUpdated: data.lastUpdated || currentAgency.lastUpdated
      };
    }

    // TELAH HANTAR: gunakan rekod LATEST_STATUS khusus bagi agensi ini
    if (agencySubmittedRows.length > 0) {
      let completed = 0;
      let inProgress = 0;
      let notStarted = 0;
      let delayed = 0;
      let noData = 0;
      let totalProgress = 0;
      let progressCount = 0;
      let fastTrackCount = 0;
      let totalCost = 0;
      let lastUpdated: string | null = null;
      const seenCostKeys = new Set<string>();

      agencySubmittedRows.forEach(r => {
        if (r.statusPelaksanaan === 'Siap') completed++;
        else if (r.statusPelaksanaan === 'Dalam Pelaksanaan') inProgress++;
        else if (r.statusPelaksanaan === 'Belum Mula') notStarted++;
        else if (r.statusPelaksanaan === 'Ditangguh') delayed++;
        else noData++;

        if (r.peratusKemajuan !== null && typeof r.peratusKemajuan === 'number' && !isNaN(r.peratusKemajuan)) {
          totalProgress += r.peratusKemajuan;
          progressCount++;
        }

        const m = initiatives.find(i => normalizeInitiativeKey(i.compositeKey) === normalizeInitiativeKey(r.initiativeKey));
        if (m?.isFastTrack) fastTrackCount++;

        if (r.kosProjek && !seenCostKeys.has(r.initiativeKey)) {
          seenCostKeys.add(r.initiativeKey);
          totalCost += r.kosProjek;
        }

        if (r.tarikhKemasKini && (!lastUpdated || r.tarikhKemasKini > lastUpdated)) {
          lastUpdated = r.tarikhKemasKini;
        }
      });

      return {
        sourceName: 'LATEST_STATUS',
        isDraft: false,
        data: {
          hasData: true,
          total: allCurrentAgencyInitiatives.length || agencySubmittedRows.length,
          completed,
          inProgress,
          notStarted,
          delayed,
          noData,
          totalProgress,
          progressCount,
          averageProgress: progressCount > 0 ? Math.round(totalProgress / progressCount) : null,
          fastTrackCount,
          totalCost,
          lastUpdated: lastUpdated || currentAgency.submittedPerformance.lastUpdated || currentAgency.lastUpdated
        },
        lastUpdated: lastUpdated || currentAgency.submittedPerformance.lastUpdated || currentAgency.lastUpdated
      };
    }

    const submittedInits = allCurrentAgencyInitiatives.filter(i =>
      i.hasSubmittedUpdate || 
      (i.statusPelaksanaan && i.statusPelaksanaan !== 'Tiada Data') ||
      (i.peratusKemajuan !== null && typeof i.peratusKemajuan === 'number')
    );

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let delayed = 0;
    let noData = 0;
    let totalProgress = 0;
    let progressCount = 0;
    let fastTrackCount = 0;
    let totalCost = 0;
    let lastUpdated: string | null = null;
    const seenCostKeys = new Set<string>();

    submittedInits.forEach(i => {
      if (i.statusPelaksanaan === 'Siap') completed++;
      else if (i.statusPelaksanaan === 'Dalam Pelaksanaan') inProgress++;
      else if (i.statusPelaksanaan === 'Belum Mula') notStarted++;
      else if (i.statusPelaksanaan === 'Ditangguh') delayed++;
      else noData++;

      if (i.peratusKemajuan !== null && typeof i.peratusKemajuan === 'number' && !isNaN(i.peratusKemajuan)) {
        totalProgress += i.peratusKemajuan;
        progressCount++;
      }

      if (i.isFastTrack) fastTrackCount++;

      if (i.kosProjek && !seenCostKeys.has(i.compositeKey)) {
        seenCostKeys.add(i.compositeKey);
        totalCost += i.kosProjek;
      }

      if (i.tarikhKemasKini && (!lastUpdated || i.tarikhKemasKini > lastUpdated)) {
        lastUpdated = i.tarikhKemasKini;
      }
    });

    const hasCalculated = submittedInits.length > 0;
    const data = hasCalculated ? {
      hasData: true,
      total: allCurrentAgencyInitiatives.length || submittedInits.length,
      completed,
      inProgress,
      notStarted,
      delayed,
      noData,
      totalProgress,
      progressCount,
      averageProgress: progressCount > 0 ? Math.round(totalProgress / progressCount) : null,
      fastTrackCount,
      totalCost,
      lastUpdated: lastUpdated || currentAgency.submittedPerformance.lastUpdated || currentAgency.lastUpdated
    } : currentAgency.submittedPerformance;

    return {
      sourceName: 'LATEST_STATUS',
      isDraft: false,
      data,
      lastUpdated: data.lastUpdated || currentAgency.lastUpdated
    };
  }, [allCurrentAgencyInitiatives, currentAgency, statusView, agencySubmittedRows, agencyDraftRows, initiatives]);

  // Semak sama ada agensi mempunyai kedua-dua sumber untuk perbandingan
  const canCompare = useMemo(() => {
    if (!currentAgency) return false;
    return (currentAgency.submittedPerformance.hasData || allCurrentAgencyInitiatives.some(i => i.hasSubmittedUpdate)) &&
           (currentAgency.draftPerformance.hasData || allCurrentAgencyInitiatives.some(i => i.hasDraftUpdate));
  }, [currentAgency, allCurrentAgencyInitiatives]);

  // Tatal lancar ke senarai inisiatif sekiranya kad KPI diklik (Requirement 17)
  const scrollToInitiativesList = () => {
    if (initiativesListRef.current) {
      initiativesListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Pengendali klik kad KPI sebagai penapis (Requirements 2 - 8)
  const handleKpiCardClick = (cardType: 'ALL' | 'SIAP' | 'DALAM_PELAKSANAAN' | 'BELUM_MULA' | 'DITANGGUH' | 'FAST_TRACK') => {
    if (cardType === 'ALL') {
      setStatusFilter('');
      setFastTrackFilter(false);
    } else if (cardType === 'SIAP') {
      if (statusFilter === 'Siap' && !fastTrackFilter) {
        setStatusFilter('');
      } else {
        setStatusFilter('Siap');
        setFastTrackFilter(false);
      }
    } else if (cardType === 'DALAM_PELAKSANAAN') {
      if (statusFilter === 'Dalam Pelaksanaan' && !fastTrackFilter) {
        setStatusFilter('');
      } else {
        setStatusFilter('Dalam Pelaksanaan');
        setFastTrackFilter(false);
      }
    } else if (cardType === 'BELUM_MULA') {
      if (statusFilter === 'Belum Mula' && !fastTrackFilter) {
        setStatusFilter('');
      } else {
        setStatusFilter('Belum Mula');
        setFastTrackFilter(false);
      }
    } else if (cardType === 'DITANGGUH') {
      if (statusFilter === 'Ditangguh' && !fastTrackFilter) {
        setStatusFilter('');
      } else {
        setStatusFilter('Ditangguh');
        setFastTrackFilter(false);
      }
    } else if (cardType === 'FAST_TRACK') {
      if (fastTrackFilter && !statusFilter) {
        setFastTrackFilter(false);
      } else {
        setStatusFilter('');
        setFastTrackFilter(true);
      }
    }
    scrollToInitiativesList();
  };

  // Kenal pasti kad KPI aktif tunggal (Requirement 10)
  const activeCardFilter = useMemo(() => {
    if (fastTrackFilter) return 'FAST_TRACK';
    if (statusFilter === 'Siap') return 'SIAP';
    if (statusFilter === 'Dalam Pelaksanaan') return 'DALAM_PELAKSANAAN';
    if (statusFilter === 'Belum Mula') return 'BELUM_MULA';
    if (statusFilter === 'Ditangguh') return 'DITANGGUH';
    return 'ALL';
  }, [statusFilter, fastTrackFilter]);

  // Inisiatif agensi semasa ditapis mengikut carian, status, dan Fast Track (Requirements 2, 8, 14)
  const agencyInitiatives = useMemo(() => {
    if (!currentAgency) return [];
    return allCurrentAgencyInitiatives.filter(i => {
      // 1. Carian teks
      if (agencySearchQuery) {
        const q = agencySearchQuery.toLowerCase();
        if (!i.inisiatif.toLowerCase().includes(q) && !i.kodInisiatif.toLowerCase().includes(q)) {
          return false;
        }
      }

      // 2. Tapisan Fast Track (berdasarkan DATA.FT melalui Initiative Key)
      if (fastTrackFilter) {
        if (!i.isFastTrack) return false;
      }

      // 3. Tapisan Status Pelaksanaan
      if (statusFilter) {
        const checkStatus = statusView === 'DRAF' && i.draftData 
          ? i.draftData.status 
          : i.statusPelaksanaan;
        if (checkStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [allCurrentAgencyInitiatives, agencySearchQuery, statusFilter, fastTrackFilter, statusView]);

  // Data carta status agensi mengikut sumber aktif dengan warna & peratusan tepat (Requirement G)
  const agencyStatusChartData = useMemo(() => {
    if (!activeMetrics || !activeMetrics.data) return [];
    const d = activeMetrics.data;
    const total = (d.completed || 0) + (d.inProgress || 0) + (d.notStarted || 0) + (d.delayed || 0) + (d.noData || 0);

    const items = [
      { name: 'Siap', value: d.completed, color: '#16A34A' }, // GREEN
      { name: 'Dalam Pelaksanaan', value: d.inProgress, color: '#2563EB' }, // BLUE
      { name: 'Belum Mula', value: d.notStarted, color: '#DC2626' }, // RED
      { name: 'Ditangguh', value: d.delayed, color: '#EAB308' }, // YELLOW
      { name: 'Tiada Data', value: d.noData, color: '#94A3B8' } // GREY
    ].filter(entry => entry.value > 0);

    return items.map(it => ({
      ...it,
      percent: total > 0 ? Math.round((it.value / total) * 100) : 0
    }));
  }, [activeMetrics]);


  // Jadual status agensi ditapis untuk bahagian FORM_STATUS
  const filteredFormTable = useMemo(() => {
    return agencies.filter(ag => {
      if (!tableSearchQuery) return true;
      return ag.name.toLowerCase().includes(tableSearchQuery.toLowerCase());
    });
  }, [agencies, tableSearchQuery]);

  const formBadge = currentAgency ? getFormStatusStyle(currentAgency.formStatus) : null;

  return (
    <section id="prestasi-agensi" className="py-12 border-b border-[#E8B6C8]/30">
      
      {/* Title */}
      <div className="mb-8">
        <div className="text-xs font-extrabold uppercase tracking-wider text-[#46B7B0]">
          Akauntabiliti & Pemantauan Agensi
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          PRESTASI AGENSI & STATUS BORANG
        </h2>
        <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
          Pantau prestasi mengikut data rasmi yang telah dihantar (LATEST_STATUS) atau semak kemajuan simpanan draf (DRAFT).
        </p>
      </div>

      {/* Segmented Control: PAPARAN DATA (Requirement 12, 13, 14) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8B6C8]/50 shadow-xs mb-8 space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
              PAPARAN DATA SUMBER
            </span>
            <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                onClick={() => setStatusView('TELAH HANTAR')}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusView === 'TELAH HANTAR'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>TELAH HANTAR (LATEST_STATUS)</span>
              </button>

              <button
                onClick={() => setStatusView('DRAF')}
                className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusView === 'DRAF'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>DRAF (DRAFT)</span>
              </button>

              <button
                onClick={() => setStatusView('SEMUA')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusView === 'SEMUA'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>SEMUA AGENSI</span>
              </button>
            </div>
          </div>

          {canCompare && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors self-start lg:self-auto cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#46B7B0]" />
              <span>BANDING DRAF DENGAN DATA DIHANTAR</span>
            </button>
          )}
        </div>

        {/* Agency Selector Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <label className="block text-xs font-bold uppercase text-stone-500 mb-1.5">
              Pilih Agensi Pelaksana ({statusView})
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#46B7B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedAgencyName}
                onChange={(e) => setSelectedAgencyName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-[#171717] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#46B7B0]"
              >
                <option value="" disabled>Pilih agensi...</option>
                {selectableAgencies.map((ag) => (
                  <option key={ag.name} value={ag.name}>
                    {ag.name} ({ag.totalInitiatives} Inisiatif)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Agency Summary Header (Requirement 56) */}
          {currentAgency && formBadge && activeMetrics && (
            <div className="flex flex-wrap items-center gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div>
                <span className="text-[11px] text-stone-500 block font-medium">Status Borang</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-0.5 rounded-full mt-0.5 border ${formBadge.bg}`}>
                  <span>{formBadge.label}</span>
                </span>
              </div>

              <div className="border-l border-stone-200 pl-3">
                <span className="text-[11px] text-stone-500 block font-medium">Sumber Prestasi</span>
                <span className={`text-xs font-black block mt-0.5 ${activeMetrics.isDraft ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {activeMetrics.sourceName}
                </span>
              </div>

              {activeMetrics.lastUpdated && (
                <div className="border-l border-stone-200 pl-3">
                  <span className="text-[11px] text-stone-500 block font-medium">Kemas Kini Terakhir</span>
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {activeMetrics.lastUpdated}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note when viewing Draft (Requirement 20) */}
        {statusView === 'DRAF' && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>Nota Draf:</b> Metrik dan kemajuan di bawah adalah berdasarkan data draf terakhir yang disimpan oleh agensi dalam lembaran <b>DRAFT</b>. Data ini belum dikemukakan secara rasmi sebagai Telah Hantar.
            </span>
          </div>
        )}

      </div>

      {/* Selected Agency Performance Dashboard */}
      {currentAgency && activeMetrics && (
        <div className="space-y-8 mb-14">
          
          {/* Agency KPI Cards (Requirements 1 - 10: Interactive Filter Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            
            {/* Total Initiatives (Acts as "Papar Semua" / Reset Filter, Requirement 3) */}
            <button
              type="button"
              onClick={() => handleKpiCardClick('ALL')}
              aria-pressed={activeCardFilter === 'ALL'}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative group ${
                activeCardFilter === 'ALL'
                  ? 'bg-stone-50 border-[#171717] ring-2 ring-[#171717]/15 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase">Jumlah Inisiatif</span>
                {activeCardFilter === 'ALL' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-[#171717] text-white rounded">Semua</span>
                )}
              </div>
              <div className="text-2xl font-black text-[#171717] mt-1">
                {allCurrentAgencyInitiatives.length || currentAgency.totalInitiatives}
              </div>
              <span className="text-[10px] text-stone-400">Papar Semua</span>
            </button>

            {/* Average Progress (Information Only - Not Filterable, Requirement 20) */}
            <div className={`p-4 rounded-xl border ${
              activeMetrics.isDraft 
                ? 'bg-amber-50/50 border-amber-200' 
                : 'bg-[#9EDBD7]/20 border-[#46B7B0]/30'
            }`}>
              <span className={`text-[11px] font-bold uppercase ${
                activeMetrics.isDraft ? 'text-amber-800' : 'text-teal-800'
              }`}>
                {activeMetrics.isDraft ? 'Purata Draf' : 'Purata Kemajuan'}
              </span>
              <div className={`text-2xl font-black mt-1 ${
                activeMetrics.isDraft ? 'text-amber-950' : 'text-[#1d6d68]'
              }`}>
                {activeMetrics.data.averageProgress !== null ? `${activeMetrics.data.averageProgress}%` : 'Belum Dikemas Kini'}
              </div>
              <span className="text-[10px] text-stone-400">Sumber: {activeMetrics.sourceName}</span>
            </div>

            {/* Siap (Interactive Filter, Requirement 4) */}
            <button
              type="button"
              onClick={() => handleKpiCardClick('SIAP')}
              aria-pressed={activeCardFilter === 'SIAP'}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative group ${
                activeCardFilter === 'SIAP'
                  ? 'bg-emerald-100/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Siap</span>
                {activeCardFilter === 'SIAP' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-700 text-white rounded">Aktif</span>
                )}
              </div>
              <div className="text-2xl font-black text-emerald-950 mt-1">{activeMetrics.data.completed}</div>
              <span className="text-[10px] text-emerald-700">Inisiatif</span>
            </button>

            {/* Dalam Pelaksanaan (Renamed from "Dalam Laksana", Requirement 1 & 5) */}
            <button
              type="button"
              onClick={() => handleKpiCardClick('DALAM_PELAKSANAAN')}
              aria-pressed={activeCardFilter === 'DALAM_PELAKSANAAN'}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative group ${
                activeCardFilter === 'DALAM_PELAKSANAAN'
                  ? 'bg-teal-100/70 border-teal-600 ring-2 ring-teal-500/20 shadow-xs'
                  : 'bg-teal-50/60 border-teal-200 hover:border-teal-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-teal-800 uppercase">Dalam Pelaksanaan</span>
                {activeCardFilter === 'DALAM_PELAKSANAAN' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-teal-700 text-white rounded">Aktif</span>
                )}
              </div>
              <div className="text-2xl font-black text-teal-950 mt-1">{activeMetrics.data.inProgress}</div>
              <span className="text-[10px] text-teal-700">Inisiatif</span>
            </button>

            {/* Belum Mula (Interactive Filter, Requirement 6) */}
            <button
              type="button"
              onClick={() => handleKpiCardClick('BELUM_MULA')}
              aria-pressed={activeCardFilter === 'BELUM_MULA'}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative group ${
                activeCardFilter === 'BELUM_MULA'
                  ? 'bg-stone-200 border-stone-600 ring-2 ring-stone-400/20 shadow-xs'
                  : 'bg-stone-100 border-stone-200 hover:border-stone-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-600 uppercase">Belum Mula</span>
                {activeCardFilter === 'BELUM_MULA' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-stone-700 text-white rounded">Aktif</span>
                )}
              </div>
              <div className="text-2xl font-black text-stone-900 mt-1">{activeMetrics.data.notStarted}</div>
              <span className="text-[10px] text-stone-500">Inisiatif</span>
            </button>

            {/* Ditangguh (jika ada nilai, Requirement 7) */}
            {activeMetrics.data.delayed > 0 && (
              <button
                type="button"
                onClick={() => handleKpiCardClick('DITANGGUH')}
                aria-pressed={activeCardFilter === 'DITANGGUH'}
                className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative group ${
                  activeCardFilter === 'DITANGGUH'
                    ? 'bg-yellow-100 border-yellow-600 ring-2 ring-yellow-500/20 shadow-xs'
                    : 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-yellow-800 uppercase">Ditangguh</span>
                  {activeCardFilter === 'DITANGGUH' && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-yellow-600 text-white rounded">Aktif</span>
                  )}
                </div>
                <div className="text-2xl font-black text-yellow-950 mt-1">{activeMetrics.data.delayed}</div>
                <span className="text-[10px] text-yellow-700">Inisiatif</span>
              </button>
            )}

            {/* Fast Track (Interactive Filter, Requirement 8) */}
            <button
              type="button"
              onClick={() => handleKpiCardClick('FAST_TRACK')}
              aria-pressed={activeCardFilter === 'FAST_TRACK'}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative group ${
                activeCardFilter === 'FAST_TRACK'
                  ? 'bg-amber-100/80 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-amber-50 border-amber-200 hover:border-amber-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase">Fast Track</span>
                {activeCardFilter === 'FAST_TRACK' && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-700 text-white rounded">Aktif</span>
                )}
              </div>
              <div className="text-2xl font-black text-amber-950 mt-1">{activeMetrics.data.fastTrackCount}</div>
              <span className="text-[10px] text-amber-700">Keutamaan</span>
            </button>

            {/* Cost if available (Information Only - Not Filterable, Requirement 20) */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase">Anggaran Kos</span>
              <div className="text-lg font-black text-[#171717] mt-1 truncate">
                {activeMetrics.data.totalCost > 0 ? formatCurrency(activeMetrics.data.totalCost) : 'Tiada Data Kos'}
              </div>
              <span className="text-[10px] text-stone-400">Rekod {activeMetrics.sourceName}</span>
            </div>

          </div>

          {/* Visual Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white p-6 rounded-2xl border border-stone-200">
            <div className="lg:col-span-5 h-56 flex flex-col items-center justify-center">
              <h4 className="text-xs font-extrabold uppercase text-stone-500 mb-2">
                Taburan Status ({activeMetrics.sourceName})
              </h4>
              {agencyStatusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={agencyStatusChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      label={({ percent }) => `${percent}%`}
                    >
                      {agencyStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any, name: any, item: any) => [
                        `${val} inisiatif (${item?.payload?.percent ?? 0}%)`, 
                        name
                      ]} 
                      contentStyle={{ borderRadius: 10, fontSize: 12 }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-stone-400 py-8">
                  {statusView === 'DRAF' 
                    ? 'Tiada data draf ditemui untuk agensi ini.' 
                    : 'Tiada rekod status terkini ditemui bagi agensi ini.'}
                </div>
              )}
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-stone-500">
                Ringkasan Prestasi {currentAgency.name}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {agencyStatusChartData.map(item => (
                  <div key={item.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-stone-700">{item.name}:</span>
                    <span className="font-extrabold text-[#171717] ml-auto">
                      {item.value} inisiatif ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agency Initiatives List */}
          <div ref={initiativesListRef} className="bg-white p-6 rounded-2xl border border-stone-200 scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-[#171717]">
                  Senarai Inisiatif di Bawah {currentAgency.name}
                </h3>
                <span className="text-xs text-stone-500">
                  {agencyInitiatives.length} daripada {allCurrentAgencyInitiatives.length || currentAgency.totalInitiatives} inisiatif dipaparkan
                </span>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={agencySearchQuery}
                    onChange={(e) => setAgencySearchQuery(e.target.value)}
                    placeholder="Tapis inisiatif..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>

                <select
                  value={fastTrackFilter ? 'FAST_TRACK' : statusFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'FAST_TRACK') {
                      setStatusFilter('');
                      setFastTrackFilter(true);
                    } else {
                      setStatusFilter(val);
                      setFastTrackFilter(false);
                    }
                  }}
                  className="py-1.5 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#46B7B0]"
                >
                  <option value="">Semua Status</option>
                  <option value="Siap">Siap</option>
                  <option value="Dalam Pelaksanaan">Dalam Pelaksanaan</option>
                  <option value="Belum Mula">Belum Mula</option>
                  <option value="Ditangguh">Ditangguh</option>
                  <option value="FAST_TRACK">Fast Track Sahaja</option>
                </select>
              </div>
            </div>

            {/* Tapisan Aktif Banner (Requirement 11) */}
            {activeCardFilter !== 'ALL' && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3.5 bg-stone-50 border border-stone-200 rounded-xl mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-bold uppercase text-[11px]">Tapisan Aktif:</span>
                  <span className="font-extrabold px-3 py-0.5 rounded-full bg-white border border-stone-300 text-stone-900 shadow-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#46B7B0]" />
                    {fastTrackFilter
                      ? 'Fast Track'
                      : statusFilter === 'Dalam Pelaksanaan'
                        ? 'Dalam Pelaksanaan'
                        : statusFilter}
                  </span>
                  <span className="text-stone-500 font-medium text-[11px]">
                    (Menunjukkan <b>{agencyInitiatives.length}</b> inisiatif)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('');
                    setFastTrackFilter(false);
                  }}
                  className="text-xs font-bold text-[#46B7B0] hover:text-[#171717] hover:underline cursor-pointer"
                >
                  Papar Semua (Reset Tapisan)
                </button>
              </div>
            )}

            {/* Initiatives List */}
            <div className="space-y-3">
              {agencyInitiatives.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  {statusView === 'DRAF' 
                    ? 'Tiada data draf ditemui untuk agensi ini.' 
                    : 'Tiada rekod status terkini ditemui bagi agensi ini.'}
                </div>
              ) : (
                agencyInitiatives.map((item, index) => {
                  const isDraftView = statusView === 'DRAF';
                  const activeItemStatus = isDraftView && item.draftData 
                    ? item.draftData.status 
                    : item.statusPelaksanaan;
                  const activeItemProgress = isDraftView && item.draftData 
                    ? item.draftData.peratusKemajuan 
                    : item.peratusKemajuan;
                  const activeItemIssue = isDraftView && item.draftData 
                    ? item.draftData.isuMasalah 
                    : item.isuMasalah;

                  const statusStyle = getStatusStyle(activeItemStatus);
                  const compColor = getComponentColor(item.komponen);

                  return (
                    <div
                      key={item.compositeKey}
                      onClick={() => onSelectInitiative(item)}
                      className="p-4 rounded-xl border border-stone-200 hover:border-[#46B7B0] hover:bg-[#FFF9F3]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Dynamic Running Number (Requirement: Running number follows filtered list) */}
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-stone-100 text-stone-700 font-extrabold text-[11px] sm:text-xs flex items-center justify-center border border-stone-200/80 shrink-0 mt-0.5">
                          {index + 1}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span 
                              className="text-[11px] font-black px-2 py-0.5 rounded tracking-wider"
                              style={{ backgroundColor: `${compColor.lightHex}50`, color: compColor.hex }}
                            >
                              {item.kodInisiatif}
                            </span>
                            <span className="text-[11px] font-semibold text-stone-500">
                              {normalizeComponent(item.komponen)}
                            </span>
                            {item.isFastTrack && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                FT
                              </span>
                            )}
                            {isDraftView && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                Draf
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-stone-900">{item.inisiatif}</h4>
                          {activeItemIssue && (
                            <p className="text-[11px] text-amber-700 font-medium line-clamp-1">
                              ⚠️ Isu: {activeItemIssue}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                        {/* Progress */}
                        <div className="w-24 text-right">
                          <span className="text-xs font-bold text-[#171717]">
                            {activeItemProgress !== null ? `${activeItemProgress}%` : 'Belum Dikemas Kini'}
                          </span>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-[#46B7B0]" 
                              style={{ width: `${activeItemProgress ?? 0}%` }} 
                            />
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${statusStyle.badgeBg}`}>
                          {statusStyle.text}
                        </span>

                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* Side-by-Side Comparison Modal (Requirement 25) */}
      {showComparisonModal && currentAgency && canCompare && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs font-extrabold text-[#46B7B0] uppercase">Perbandingan Dua Sumber</span>
                <h3 className="text-xl font-black text-[#171717]">
                  {currentAgency.name} — Data Telah Hantar vs Draf Semasa
                </h3>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-3 py-1.5 text-xs font-bold bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Telah Hantar Panel */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-emerald-900">DATA TELAH HANTAR</span>
                  <span className="text-[11px] text-emerald-700 font-bold">LATEST_STATUS</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Purata Kemajuan:</span>
                    <span className="font-black text-emerald-950">{currentAgency.submittedPerformance.averageProgress ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Inisiatif Siap:</span>
                    <span className="font-bold text-emerald-950">{currentAgency.submittedPerformance.completed}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Dalam Pelaksanaan:</span>
                    <span className="font-bold text-emerald-950">{currentAgency.submittedPerformance.inProgress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Tarikh Kemaskini:</span>
                    <span className="font-bold text-emerald-950">{currentAgency.submittedPerformance.lastUpdated || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Draf Semasa Panel */}
              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-amber-900">DRAF SEMASA</span>
                  <span className="text-[11px] text-amber-700 font-bold">DRAFT</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Purata Kemajuan Draf:</span>
                    <span className="font-black text-amber-950">{currentAgency.draftPerformance.averageProgress ?? 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Inisiatif Siap:</span>
                    <span className="font-bold text-amber-950">{currentAgency.draftPerformance.completed}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Dalam Pelaksanaan:</span>
                    <span className="font-bold text-amber-950">{currentAgency.draftPerformance.inProgress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Tarikh Simpan Draf:</span>
                    <span className="font-bold text-amber-950">{currentAgency.draftPerformance.lastUpdated || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-500 italic">
              * Perbandingan ini memaparkan kedua-dua sumber secara bersebelahan tanpa menimpa rekod rasmi yang telah dihantar.
            </p>
          </div>
        </div>
      )}

      {/* Jadual Status Pengisian Agensi (Requirement H: Tajuk tanpa '(FORM_STATUS)', lajur pertama BIL.) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-[#171717]">
              Jadual Status Pengisian Agensi
            </h3>
            <p className="text-xs text-stone-500">
              Senarai penuh agensi dan status penghantaran borang pemantauan Pelan Induk.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              placeholder="Cari agensi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">BIL.</th>
                <th className="py-3 px-4">Nama Agensi</th>
                <th className="py-3 px-4">Status Pengisian</th>
                <th className="py-3 px-4">Kemas Kini Terakhir</th>
                <th className="py-3 px-4 text-center">Inisiatif Terlibat</th>
                <th className="py-3 px-4 text-center">Kemajuan Dihantar</th>
                <th className="py-3 px-4 text-center">Kemajuan Draf</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredFormTable.map((ag, idx) => {
                const badge = getFormStatusStyle(ag.formStatus);
                return (
                  <tr key={ag.name} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-stone-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{ag.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500">{ag.lastUpdated || '-'}</td>
                    <td className="py-3 px-4 text-center font-bold">{ag.totalInitiatives}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-teal-800">
                      {ag.submittedPerformance.averageProgress !== null ? `${ag.submittedPerformance.averageProgress}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-amber-800">
                      {ag.draftPerformance.averageProgress !== null ? `${ag.draftPerformance.averageProgress}%` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedAgencyName(ag.name)}
                        className="text-[#46B7B0] hover:text-[#171717] font-bold text-xs cursor-pointer"
                      >
                        Pilih Agensi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
};
