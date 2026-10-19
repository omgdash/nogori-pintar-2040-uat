/**
 * ENJIN KEPINTARAN BUATAN TEMPATAN (NOGORI PINTAR AI)
 * 
 * Melakukan analisis pantas, tepat dan berfakta secara terus ke atas data langsung
 * tanpa memerlukan kunci API luaran dalam pelayar GitHub Pages.
 */

import { PortalBootstrapData, MasterInitiative } from '../types';

export interface AiActionButton {
  label: string;
  actionType: 'navigate_section' | 'filter_component' | 'filter_status' | 'filter_fast_track' | 'filter_agency' | 'search';
  targetValue?: string;
  sectionId?: string;
}

export interface AiResponse {
  answer: string;
  highlights?: { title: string; value: string; desc?: string }[];
  actionButtons?: AiActionButton[];
  matchedInitiatives?: MasterInitiative[];
}

export interface DailyInsightCard {
  id: string;
  badge: string;
  title: string;
  description: string;
  accentColor: string;
  actionText?: string;
  actionTarget?: string;
}

/**
 * Jana 3 hingga 5 cerapan fakta harian daripada dataset langsung semasa
 */
export function generateDailyInsights(data: PortalBootstrapData): DailyInsightCard[] {
  const insights: DailyInsightCard[] = [];
  const kpi = data.kpi;
  const initiatives = data.initiatives;
  const components = data.components;
  const agencies = data.agencies;
  const agencySummary = data.agencyStatusSummary;

  // Cerapan 1: Status Kemajuan & Inisiatif Siap
  const completionRate = kpi.totalInitiatives > 0 ? Math.round((kpi.completedCount / kpi.totalInitiatives) * 100) : 0;
  insights.push({
    id: 'insight-completion',
    badge: 'Pencapaian Keseluruhan',
    title: `${kpi.completedCount} daripada ${kpi.totalInitiatives} Inisiatif Telah Siap Sepenuhnya (${completionRate}%)`,
    description: `Sebanyak ${kpi.inProgressCount} inisiatif kini sedang giat dilaksanakan merentasi pelbagai jabatan dengan purata kemajuan negeri ${kpi.averageProgress}%.`,
    accentColor: '#46B7B0',
    actionText: 'Lihat Inisiatif Siap',
    actionTarget: 'status:Siap'
  });

  // Cerapan 2: Komponen Paling Maju
  if (components.length > 0) {
    const sortedComps = [...components].sort((a, b) => b.averageProgress - a.averageProgress);
    const topComp = sortedComps[0];
    if (topComp && topComp.averageProgress > 0) {
      insights.push({
        id: 'insight-top-component',
        badge: 'Peneraju Komponen',
        title: `${topComp.name} Mencatatkan Purata Kemajuan Tertinggi (${topComp.averageProgress}%)`,
        description: `Meliputi ${topComp.total} inisiatif berimpak tinggi dengan ${topComp.completed} inisiatif telah siap dan ${topComp.inProgress} dalam pelaksanaan aktif.`,
        accentColor: '#9EDBD7',
        actionText: `Terokai ${topComp.name}`,
        actionTarget: `comp:${topComp.name}`
      });
    }
  }

  // Cerapan 3: Keutamaan Fast Track
  const ftCount = kpi.fastTrackCount;
  const ftCompleted = initiatives.filter(i => i.isFastTrack && i.statusPelaksanaan === 'Siap').length;
  const ftInProgress = initiatives.filter(i => i.isFastTrack && i.statusPelaksanaan === 'Dalam Pelaksanaan').length;
  insights.push({
    id: 'insight-fast-track',
    badge: 'Fokus Berimpak Tinggi',
    title: `${ftCount} Inisiatif Fast Track Menjadi Pemangkin Utama 2040`,
    description: `${ftCompleted} telah siap beroperasi dan ${ftInProgress} sedang dalam fasa kritikal pelaksanaan untuk faedah pantas rakyat.`,
    accentColor: '#F3DB7B',
    actionText: 'Tapis Fast Track',
    actionTarget: 'fast_track'
  });

  // Cerapan 4: Prestasi Pengisian Agensi
  if (agencySummary.telahHantar > 0 || agencySummary.draf > 0) {
    insights.push({
      id: 'insight-agency-status',
      badge: 'Pemantauan Agensi',
      title: `${agencySummary.telahHantar} Agensi Telah Menghantar Laporan Pemantauan`,
      description: `Daripada ${agencySummary.totalAgencies} jumlah agensi dalam pemantauan, ${agencySummary.telahHantar} telah menghantar laporan manakala ${agencySummary.draf} berstatus simpanan draf.`,
      accentColor: '#E8B6C8',
      actionText: 'Prestasi Agensi',
      actionTarget: 'section:prestasi-agensi'
    });
  }

  // Cerapan 5: Inisiatif Berkoordinat Smart Map
  if (kpi.mappedInitiativesCount > 0) {
    insights.push({
      id: 'insight-map',
      badge: 'Visualisasi GIS',
      title: `${kpi.mappedInitiativesCount} Inisiatif Berlokasi Telah Dipetakan di Seluruh Negeri`,
      description: `Merangkumi ${kpi.totalCoordinatesCount} titik koordinat strategik di daerah Seremban, Port Dickson, Jempol, Rembau, Tampin dan Kuala Pilah.`,
      accentColor: '#A8CDE3',
      actionText: 'Buka Smart Map',
      actionTarget: 'section:smart-map'
    });
  }

  return insights.slice(0, 4);
}

/**
 * Analisis soalan pengguna dan kembalikan jawapan tepat berpandukan data
 */
export function queryAiInsights(prompt: string, data: PortalBootstrapData): AiResponse {
  const q = prompt.trim().toLowerCase();
  const kpi = data.kpi;
  const initiatives = data.initiatives;
  const components = data.components;
  const agencies = data.agencies;
  const formStatus = data.formStatus;

  // 1. Prestasi Keseluruhan / Ringkasan Eksekutif
  if (q.includes('prestasi keseluruhan') || q.includes('ringkasan') || q.includes('status terkini') || q.includes('overview')) {
    const rate = kpi.totalInitiatives > 0 ? Math.round((kpi.completedCount / kpi.totalInitiatives) * 100) : 0;
    return {
      answer: `Berdasarkan data langsung pemantauan terkini Pelan Induk Bandar Pintar Negeri Sembilan 2040:
• Jumlah Inisiatif: ${kpi.totalInitiatives} inisiatif merentasi 7 Komponen.
• Inisiatif Siap: ${kpi.completedCount} inisiatif (${rate}%).
• Dalam Pelaksanaan: ${kpi.inProgressCount} inisiatif.
• Belum Mula: ${kpi.notStartedCount} inisiatif.
• Ditangguh: ${kpi.delayedCount} inisiatif.
• Purata Kemajuan Keseluruhan: ${kpi.averageProgress}%.
• Inisiatif Fast Track: ${kpi.fastTrackCount} projek berkeutamaan tinggi.`,
      highlights: [
        { title: 'Purata Kemajuan', value: `${kpi.averageProgress}%`, desc: 'Semua Inisiatif Aktif' },
        { title: 'Inisiatif Siap', value: `${kpi.completedCount}`, desc: `Daripada ${kpi.totalInitiatives} Inisiatif` },
        { title: 'Dalam Pelaksanaan', value: `${kpi.inProgressCount}`, desc: 'Sedang Berjalan' },
        { title: 'Fast Track', value: `${kpi.fastTrackCount}`, desc: 'Keutamaan Tinggi' }
      ],
      actionButtons: [
        { label: 'Lihat Semua Inisiatif', actionType: 'navigate_section', sectionId: 'inisiatif' },
        { label: 'Buka Smart Map', actionType: 'navigate_section', sectionId: 'smart-map' },
        { label: 'Analisis Carta', actionType: 'navigate_section', sectionId: 'analitik' }
      ]
    };
  }

  // 2. Berapa inisiatif telah siap?
  if (q.includes('siap') || q.includes('selesai') || q.includes('completed')) {
    const completedList = initiatives.filter(i => i.statusPelaksanaan === 'Siap');
    return {
      answer: `Sebanyak ${completedList.length} inisiatif telah siap dilaksanakan sepenuhnya:
${completedList.slice(0, 5).map(i => `• [${i.kodInisiatif}] ${i.inisiatif} (${i.agensiUtama})`).join('\n')}
${completedList.length > 5 ? `...dan ${completedList.length - 5} lagi inisiatif siap.` : ''}`,
      highlights: [
        { title: 'Inisiatif Siap', value: `${completedList.length}`, desc: '100% Selesai' }
      ],
      matchedInitiatives: completedList,
      actionButtons: [
        { label: 'Tapis Inisiatif Siap', actionType: 'filter_status', targetValue: 'Siap', sectionId: 'inisiatif' }
      ]
    };
  }

  // 3. Fast Track
  if (q.includes('fast track') || q.includes('laluan pantas') || q.includes('ft')) {
    const ftList = initiatives.filter(i => i.isFastTrack);
    const ftSiap = ftList.filter(i => i.statusPelaksanaan === 'Siap').length;
    const ftDalam = ftList.filter(i => i.statusPelaksanaan === 'Dalam Pelaksanaan').length;
    return {
      answer: `Terdapat ${ftList.length} inisiatif Fast Track dalam Pelan Induk Bandar Pintar Negeri Sembilan 2040.
Status terkini Fast Track:
• Siap: ${ftSiap} inisiatif
• Dalam Pelaksanaan: ${ftDalam} inisiatif
• Purata Kemajuan: ${Math.round(ftList.reduce((acc, cur) => acc + (cur.peratusKemajuan || 0), 0) / (ftList.length || 1))}%

Antara inisiatif Fast Track:
${ftList.slice(0, 4).map(i => `• [${i.kodInisiatif}] ${i.inisiatif} (${i.agensiUtama} - ${i.peratusKemajuan ?? 0}%)`).join('\n')}`,
      highlights: [
        { title: 'Jumlah Fast Track', value: `${ftList.length}`, desc: 'Inisiatif Utama' },
        { title: 'Fast Track Siap', value: `${ftSiap}`, desc: 'Sedia Berkhidmat' }
      ],
      matchedInitiatives: ftList,
      actionButtons: [
        { label: 'Buka Bahagian Fast Track', actionType: 'navigate_section', sectionId: 'fast-track' },
        { label: 'Tapis Dalam Explorer', actionType: 'filter_fast_track', sectionId: 'inisiatif' }
      ]
    };
  }

  // 4. Agensi belum menghantar data?
  if (q.includes('belum hantar') || q.includes('draf') || q.includes('status borang') || q.includes('pengisian')) {
    const belum = formStatus.filter(f => f.statusPengisian === 'Belum Hantar');
    const draf = formStatus.filter(f => f.statusPengisian === 'Draf');
    const hantar = formStatus.filter(f => f.statusPengisian === 'Telah Hantar');

    return {
      answer: `Ringkasan status pengisian laporan agensi:
• Telah Hantar: ${hantar.length} agensi
• Draf (Belum Lengkap): ${draf.length} agensi (${draf.map(d => d.agensi).join(', ') || 'Tiada'})
• Belum Hantar: ${belum.length} agensi (${belum.map(b => b.agensi).join(', ') || 'Tiada'})`,
      highlights: [
        { title: 'Telah Hantar', value: `${hantar.length}`, desc: 'Laporan Lengkap' },
        { title: 'Draf', value: `${draf.length}`, desc: 'Perlu Pengesahan' },
        { title: 'Belum Hantar', value: `${belum.length}`, desc: 'Belum Mula Isi' }
      ],
      actionButtons: [
        { label: 'Buka Prestasi Agensi', actionType: 'navigate_section', sectionId: 'prestasi-agensi' }
      ]
    };
  }

  // 5. Komponen mana paling maju?
  if (q.includes('paling maju') || q.includes('komponen terbaik') || q.includes('kemajuan tertinggi')) {
    const sorted = [...components].sort((a, b) => b.averageProgress - a.averageProgress);
    const top = sorted[0];
    return {
      answer: `Komponen yang paling maju ialah ${top?.name || 'Smart People'} dengan purata kemajuan ${top?.averageProgress || 0}%.

Kedudukan kemajuan mengikut komponen:
${sorted.map((c, idx) => `${idx + 1}. ${c.name}: ${c.averageProgress}% (${c.completed}/${c.total} siap)`).join('\n')}`,
      highlights: [
        { title: top?.name || 'Komponen Termaju', value: `${top?.averageProgress || 0}%`, desc: 'Purata Kemajuan' }
      ],
      actionButtons: [
        { label: `Lihat Inisiatif ${top?.name}`, actionType: 'filter_component', targetValue: top?.name, sectionId: 'inisiatif' },
        { label: 'Lihat Carta Komponen', actionType: 'navigate_section', sectionId: 'analitik' }
      ]
    };
  }

  // 6. Inisiatif yang mempunyai isu dan masalah
  if (q.includes('isu') || q.includes('masalah') || q.includes('halangan') || q.includes('cabaran')) {
    const withIssues = initiatives.filter(i => i.isuMasalah && i.isuMasalah.trim().length > 0);
    return {
      answer: `Terdapat ${withIssues.length} inisiatif yang telah merekodkan isu atau cabaran semasa pelaksanaan:
${withIssues.slice(0, 4).map(i => `• [${i.kodInisiatif}] ${i.inisiatif}\n  Agensi: ${i.agensiUtama}\n  Isu: "${i.isuMasalah}"`).join('\n\n')}`,
      matchedInitiatives: withIssues,
      actionButtons: [
        { label: 'Lihat Inisiatif Berkaitan', actionType: 'navigate_section', sectionId: 'inisiatif' }
      ]
    };
  }

  // 7. Carian Kata Kunci Khusus (contoh: CCTV, Peta, Trafik, dsb.)
  if (q.includes('cctv') || q.includes('kamera') || q.includes('keselamatan')) {
    const matched = initiatives.filter(i => 
      i.inisiatif.toLowerCase().includes('cctv') || 
      (i.outcome && i.outcome.toLowerCase().includes('keselamatan')) ||
      (i.inisiatif && i.inisiatif.toLowerCase().includes('keselamatan'))
    );
    return {
      answer: `Ditemui ${matched.length} inisiatif berkaitan CCTV dan Keselamatan Pintar:
${matched.map(i => `• [${i.kodInisiatif}] ${i.inisiatif} (Kemajuan: ${i.peratusKemajuan ?? 0}%, Status: ${i.statusPelaksanaan})`).join('\n')}`,
      matchedInitiatives: matched,
      actionButtons: [
        { label: 'Tapis Inisiatif Ini', actionType: 'search', targetValue: 'cctv', sectionId: 'inisiatif' },
        { label: 'Lihat di Smart Map', actionType: 'navigate_section', sectionId: 'smart-map' }
      ]
    };
  }

  // 8. Smart Map / Peta
  if (q.includes('peta') || q.includes('map') || q.includes('lokasi') || q.includes('koordinat')) {
    return {
      answer: `Modul Smart Map memaparkan ${kpi.mappedInitiativesCount} inisiatif berkeupayaan GIS dengan sejumlah ${kpi.totalCoordinatesCount} titik lokasi di seluruh Negeri Sembilan. Hanya inisiatif yang mempunyai koordinat sah di lembaran DATA dipaparkan bagi menjamin ketepatan geografi.`,
      highlights: [
        { title: 'Inisiatif Dipetakan', value: `${kpi.mappedInitiativesCount}`, desc: 'Koordinat Sah' },
        { title: 'Titik Lokasi', value: `${kpi.totalCoordinatesCount}`, desc: 'Seluruh Daerah' }
      ],
      actionButtons: [
        { label: 'Buka Smart Map Sekarang', actionType: 'navigate_section', sectionId: 'smart-map' }
      ]
    };
  }

  // 9. Agensi mana ada paling banyak inisiatif?
  if (q.includes('banyak inisiatif') || q.includes('agensi tertinggi') || q.includes('paling banyak')) {
    const sorted = [...agencies].sort((a, b) => b.totalInitiatives - a.totalInitiatives);
    const top = sorted[0];
    return {
      answer: `Agensi yang menerajui bilangan inisiatif terbanyak ialah **${top?.name || 'UPEN'}** dengan ${top?.totalInitiatives || 0} inisiatif.

Senarai agensi utama:
${sorted.slice(0, 5).map((a, idx) => {
  const avg = a.submittedPerformance?.averageProgress ?? a.draftPerformance?.averageProgress;
  return `${idx + 1}. ${a.name} — ${a.totalInitiatives} inisiatif (Purata Kemajuan: ${avg !== undefined && avg !== null ? `${avg}%` : 'Tiada maklumat'})`;
}).join('\n')}`,
      actionButtons: [
        { label: 'Pilih Agensi Ini', actionType: 'filter_agency', targetValue: top?.name, sectionId: 'prestasi-agensi' },
        { label: 'Buka Prestasi Agensi', actionType: 'navigate_section', sectionId: 'prestasi-agensi' }
      ]
    };
  }

  // 10. Carian bebas teks lain
  const freeMatches = initiatives.filter(i => 
    i.inisiatif.toLowerCase().includes(q) || 
    (i.outcome && i.outcome.toLowerCase().includes(q)) ||
    i.kodInisiatif.toLowerCase().includes(q) ||
    i.agensiUtama.toLowerCase().includes(q)
  );

  if (freeMatches.length > 0) {
    return {
      answer: `Ditemui ${freeMatches.length} inisiatif yang sepadan dengan carian "${prompt}":
${freeMatches.slice(0, 4).map(i => `• [${i.kodInisiatif}] ${i.inisiatif} (${i.agensiUtama} - ${i.statusPelaksanaan})`).join('\n')}
${freeMatches.length > 4 ? `...dan ${freeMatches.length - 4} inisiatif lain.` : ''}`,
      matchedInitiatives: freeMatches,
      actionButtons: [
        { label: `Tapis Carian "${prompt}"`, actionType: 'search', targetValue: prompt, sectionId: 'inisiatif' }
      ]
    };
  }

  // Jawapan Lalai Berfakta (Tidak Mereka Data)
  return {
    answer: `Maklumat terperinci bagi soalan tersebut tidak ditemui secara langsung dalam rekod pemantauan semasa. Anda boleh menggunakan cadangan soalan yang disediakan atau menyemak bahagian Ringkasan Eksekutif, Peneroka Inisiatif dan Prestasi Agensi.`,
    actionButtons: [
      { label: 'Lihat Semua Inisiatif', actionType: 'navigate_section', sectionId: 'inisiatif' },
      { label: 'Buka Prestasi Agensi', actionType: 'navigate_section', sectionId: 'prestasi-agensi' }
    ]
  };
}
