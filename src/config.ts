/**
 * KONFIGURASI PORTAL NOGORI PINTAR 2040
 * 
 * Satu-satunya fail yang perlu diubah oleh pengguna bukan-teknikal:
 * Masukkan Web App URL yang disalin daripada Google Apps Script selepas Deploy.
 */

const ENV_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL).trim()
  : '';

export const CONFIG = {
  // Masukkan URL Google Apps Script Web App anda di sini:
  API_URL: ENV_API_URL || 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE',

  // Selang masa semakan data langsung (milisaat) - 120,000ms = 2 minit
  REFRESH_INTERVAL: 120000,

  // Pautan spreadsheet master rasmi
  SPREADSHEET_URL: '', // Not linked from public UAT

  // Nama rasmi dan penjenamaan
  APP_NAME: 'NOGORI PINTAR 2040',
  FULL_NAME: 'PELAN INDUK BANDAR PINTAR NEGERI SEMBILAN 2040',
  TAGLINE: 'Memacu Inovasi, Menjamin Kelestarian',
  VERSION: 'UAT v1.0'
};

/**
 * Semak sama ada URL Google Apps Script telah dikonfigurasi dengan sah
 */
export function isApiConfigured(): boolean {
  if (!CONFIG.API_URL) return false;
  const url = CONFIG.API_URL.trim();
  if (
    url === '' ||
    url === 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE' ||
    url === 'THE_CURRENT_WORKING_APPS_SCRIPT_EXEC_URL' ||
    url.includes('.../exec') ||
    url.includes('PASTE_YOUR_APPS_SCRIPT_URL_HERE')
  ) {
    return false;
  }
  return (url.startsWith('https://script.google.com/') || url.startsWith('http://') || url.startsWith('https://')) && url.includes('/exec');
}
