import React from 'react';
import { AlertCircle, RefreshCw, Key } from 'lucide-react';
import { isApiConfigured } from '../config';
import { getActiveApiUrl } from '../services/apiService';

interface SetupBannerProps {
  isDevelopmentPreview: boolean;
  isStaleFallback: boolean;
  errorMessage?: string | null;
  onRetry: () => void;
  isRefreshing: boolean;
}

export const SetupBanner: React.FC<SetupBannerProps> = ({
  isDevelopmentPreview,
  isStaleFallback,
  errorMessage,
  onRetry,
  isRefreshing
}) => {
  const isConfigured = isApiConfigured() || Boolean(getActiveApiUrl());

  // Jika URL belum dikonfigurasi (hanya dipaparkan jika API_URL tiada atau masih placeholder)
  if (!isConfigured) {
    return (
      <div className="bg-[#FFF9F3] border-b border-[#F4C6A6] px-4 py-3 text-xs sm:text-sm text-[#171717] shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-amber-900 block">
                Portal hampir siap — Mod Pratonton Pembangunan Aktif
              </span>
              <span className="text-stone-600 text-xs">
                Masukkan URL Google Apps Script Web App anda ke dalam fail <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[11px] text-teal-800">src/config.ts</code> untuk menyegerakkan data langsung secara automatik.
              </span>
            </div>
          </div>


        </div>
      </div>
    );
  }

  // Jika terdapat kegagalan sambungan sementara (Stale Fallback)
  if (isStaleFallback) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs text-amber-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>Data langsung tidak dapat dikemas kini buat sementara waktu.</b> Memaparkan data terakhir yang berjaya dimuatkan daripada storan selamat.
            </span>
          </div>

          <button
            onClick={onRetry}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors self-end sm:self-auto disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>CUBA SEMULA</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
