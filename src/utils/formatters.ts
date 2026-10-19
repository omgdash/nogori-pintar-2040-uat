/**
 * FUNGSI BANTUAN & PENGGAYAAN TEMA VISUAL NOGORI PINTAR 2040
 */

export const COMPONENT_COLORS: Record<string, { bg: string; text: string; border: string; hex: string; lightHex: string }> = {
  'Smart Government': {
    bg: 'bg-[#7C3AED]/15',
    text: 'text-[#6D28D9]',
    border: 'border-[#7C3AED]',
    hex: '#7C3AED',
    lightHex: '#EDE9FE'
  },
  'Smart Economy': {
    bg: 'bg-[#4169E1]/15',
    text: 'text-[#1D4ED8]',
    border: 'border-[#4169E1]',
    hex: '#4169E1',
    lightHex: '#DBEAFE'
  },
  'Smart Environment': {
    bg: 'bg-[#16A34A]/15',
    text: 'text-[#15803D]',
    border: 'border-[#16A34A]',
    hex: '#16A34A',
    lightHex: '#DCFCE7'
  },
  'Smart Mobility': {
    bg: 'bg-[#B8860B]/15',
    text: 'text-[#92400E]',
    border: 'border-[#B8860B]',
    hex: '#B8860B',
    lightHex: '#FEF9C3'
  },
  'Smart People': {
    bg: 'bg-[#DB2777]/15',
    text: 'text-[#BE185D]',
    border: 'border-[#DB2777]',
    hex: '#DB2777',
    lightHex: '#FCE7F3'
  },
  'Smart Digital Infrastruktur': {
    bg: 'bg-[#EAB308]/20',
    text: 'text-[#A16207]',
    border: 'border-[#EAB308]',
    hex: '#EAB308',
    lightHex: '#FEF08A'
  },
  'Smart Digital Infrastructure': {
    bg: 'bg-[#EAB308]/20',
    text: 'text-[#A16207]',
    border: 'border-[#EAB308]',
    hex: '#EAB308',
    lightHex: '#FEF08A'
  },
  'Smart Living': {
    bg: 'bg-[#EA580C]/15',
    text: 'text-[#C2410C]',
    border: 'border-[#EA580C]',
    hex: '#EA580C',
    lightHex: '#FFEDD5'
  }
};

export const OFFICIAL_SMART_COMPONENTS = [
  'Smart Government',
  'Smart Economy',
  'Smart Environment',
  'Smart Mobility',
  'Smart People',
  'Smart Digital Infrastructure',
  'Smart Living'
];

/**
 * Penyeragaman Nama Komponen Rasmi Bandar Pintar (Section 4)
 * - Menerima nama komponen biasa atau huruf besar (cth: SMART GOVERNMENT -> Smart Government)
 * - Mengecam variasi ejaan sejarah (cth: Smart Digital Infrastruktur -> Smart Digital Infrastructure)
 * - Mengesan sekiranya lajur Komponen secara salah mengandungi Initiative Key (cth: SMART DIGITAL INFRASTRUCTURE|S1-I1)
 * - Mengeluarkan bahagian komponen sebelum pemisah '|' jika sah mengikut struktur inisiatif
 * - Memulangkan nama rasmi bahasa Inggeris (7 komponen rasmi)
 * - Menolak nama komponen tidak dikenali / samar-samar tanpa meneka
 */
export function normalizeComponent(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();
  if (!str) return '';

  // Jika nilai mengandungi '|', ia mungkin mengandungi Initiative Key secara silap
  if (str.includes('|')) {
    const parts = str.split('|');
    str = parts[0].trim();
  }

  // Buang whitespace berulang
  str = str.replace(/\s+/g, ' ');

  // 1. Smart Digital Infrastructure (Penyelarasan Rasmi dari Smart Digital Infrastruktur)
  if (/^(?:smart\s+)?digital\s+infra(?:structure|struktur)$/i.test(str)) {
    return 'Smart Digital Infrastructure';
  }
  // 2. Smart Government
  if (/^(?:smart\s+)?(?:government|kerajaan)$/i.test(str)) {
    return 'Smart Government';
  }
  // 3. Smart Economy
  if (/^(?:smart\s+)?(?:economy|ekonomi)$/i.test(str)) {
    return 'Smart Economy';
  }
  // 4. Smart Environment
  if (/^(?:smart\s+)?(?:environment|alam\s*sekitar)$/i.test(str)) {
    return 'Smart Environment';
  }
  // 5. Smart Mobility
  if (/^(?:smart\s+)?(?:mobility|mobiliti)$/i.test(str)) {
    return 'Smart Mobility';
  }
  // 6. Smart People
  if (/^(?:smart\s+)?(?:people|masyarakat|rakyat)$/i.test(str)) {
    return 'Smart People';
  }
  // 7. Smart Living
  if (/^(?:smart\s+)?(?:living|kehidupan)$/i.test(str)) {
    return 'Smart Living';
  }

  // Semak jika sepadan dengan mana-mana 7 nama rasmi secara tepat tanpa peka huruf
  const lower = str.toLowerCase();
  for (const official of OFFICIAL_SMART_COMPONENTS) {
    if (official.toLowerCase() === lower) {
      return official;
    }
  }

  // Tolak nama komponen yang tidak dikenali atau samar-samar tanpa meneka
  return '';
}

/**
 * Penyeragaman Kunci Inisiatif Rasmi: UPPERCASE COMPONENT NAME|KOD INISIATIF (Section 2 & 5)
 * Cth:
 * SMART DIGITAL INFRASTRUKTUR|S1-I1 -> SMART DIGITAL INFRASTRUCTURE|S1-I1
 * SMART DIGITAL INFRASTRUCTURE|S1-I1 -> SMART DIGITAL INFRASTRUCTURE|S1-I1
 * SMART GOVERNMENT|S1-I1 -> SMART GOVERNMENT|S1-I1
 */
export function normalizeInitiativeKey(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value).trim().replace(/\s+/g, ' ');
  if (!str) return '';

  // Tukar sebarang double pipes "||" kepada single pipe "|"
  str = str.replace(/\|\|+/g, '|');

  if (str.includes('|')) {
    const parts = str.split('|');
    const compPart = parts[0].trim();
    const codePart = parts.slice(1).join('|').trim().toUpperCase();

    const normComp = normalizeComponent(compPart);
    if (normComp) {
      return `${normComp.toUpperCase()}|${codePart}`;
    }
    // Jika komponen tidak dapat dipetakan kepada 7 rasmi, bersihkan variasi Infrastruktur
    const cleanedComp = compPart.toUpperCase().replace(/SMART DIGITAL INFRASTRUKTUR/g, 'SMART DIGITAL INFRASTRUCTURE');
    return `${cleanedComp}|${codePart}`;
  }

  // Sekiranya tiada '|', semak jika ia rentetan komponen semata-mata
  const normComp = normalizeComponent(str);
  if (normComp) {
    return normComp.toUpperCase();
  }

  return str.toUpperCase();
}

/**
 * Bina Kunci Inisiatif Rasmi berasaskan Komponen dan Kod Inisiatif
 */
export function buildInitiativeKey(komponen: string | null | undefined, kodInisiatif: string | null | undefined): string {
  const normComp = normalizeComponent(komponen);
  const compUpper = normComp ? normComp.toUpperCase() : String(komponen || '').trim().toUpperCase();
  const codeClean = String(kodInisiatif || '').trim().toUpperCase();
  return `${compUpper}|${codeClean}`;
}

export function getOfficialComponentName(rawName: string | null | undefined): string {
  if (!rawName) return '';
  const normalized = normalizeComponent(rawName);
  if (normalized) return normalized;

  const trimmed = rawName.trim();
  // Jika sudah bermula dengan Smart, elakkan penambahan perkataan SMART berganda
  if (/^smart\s+/i.test(trimmed)) {
    return trimmed;
  }
  return `Smart ${trimmed}`;
}

export function getComponentColor(componentName: string) {
  const official = getOfficialComponentName(componentName);
  return COMPONENT_COLORS[official] || COMPONENT_COLORS[componentName] || {
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    border: 'border-stone-300',
    hex: '#46B7B0',
    lightHex: '#9EDBD7'
  };
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return 'Tiada Data';
  }
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0
  }).format(amount).replace('MYR', 'RM');
}

/**
 * Format mata wang padat (Compact Currency) bagi mengelakkan limpahan teks (overflow)
 * Contoh: RM 30.57 Juta, RM 850.00 Ribu, RM 1.25 Bilion (Maksimum 2 tempat perpuluhan)
 */
export function formatCurrencyCompact(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return 'Tiada Data';
  }
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `RM ${val.toFixed(2)} Bilion`;
  }
  if (abs >= 1_000_000) {
    const val = amount / 1_000_000;
    return `RM ${val.toFixed(2)} Juta`;
  }
  if (abs >= 1_000) {
    const val = amount / 1_000;
    return `RM ${val.toFixed(2)} Ribu`;
  }
  return `RM ${amount.toFixed(2)}`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '0';
  return new Intl.NumberFormat('ms-MY').format(val);
}

export function getStatusStyle(status: string | null | undefined) {
  const s = String(status || '').trim();
  switch (s) {
    case 'Siap':
      return {
        badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dot: 'bg-emerald-500',
        text: 'Siap'
      };
    case 'Dalam Pelaksanaan':
      return {
        badgeBg: 'bg-teal-50 text-teal-700 border border-teal-200',
        dot: 'bg-teal-500',
        text: 'Dalam Pelaksanaan'
      };
    case 'Belum Mula':
      return {
        badgeBg: 'bg-slate-100 text-slate-600 border border-slate-200',
        dot: 'bg-slate-400',
        text: 'Belum Mula'
      };
    case 'Ditangguh':
      return {
        badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
        dot: 'bg-amber-500',
        text: 'Ditangguh'
      };
    default:
      return {
        badgeBg: 'bg-stone-50 text-stone-500 border border-stone-200',
        dot: 'bg-stone-400',
        text: 'Tiada Data'
      };
  }
}

export function getFormStatusStyle(status: string | null | undefined) {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'BELUM HANTAR' || s === 'BELUM_HANTAR' || s.includes('BELUM')) {
    return {
      bg: 'bg-stone-100 text-stone-700 border-stone-300',
      label: 'Belum Hantar'
    };
  }
  if (s === 'TELAH HANTAR' || s === 'HANTAR' || s === 'DIHANTAR') {
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      label: 'Telah Hantar'
    };
  }
  return {
    bg: 'bg-amber-50 text-amber-800 border-amber-300',
    label: 'Draf'
  };
}

/**
 * Penyeragaman Nama Agensi (Requirement: ONE canonical helper)
 * - String(value ?? '')
 * - trim()
 * - collapse repeated whitespace
 * - uppercase for comparison
 * Exact normalised equality only.
 */
export function normalizeAgencyName(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}
