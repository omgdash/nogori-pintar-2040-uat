import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { OfficialNogoriPintarLogo } from './OfficialNogoriPintarLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ralat Sistem Pelan Induk Bandar Pintar NS 2040:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF9F3] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E8B6C8] shadow-xl space-y-6">
            <div className="flex justify-center">
              <OfficialNogoriPintarLogo className="h-20 w-auto max-w-[220px]" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#46B7B0] uppercase block">
                PELAN INDUK BANDAR PINTAR NEGERI SEMBILAN 2040
              </span>
              <h2 className="text-xl font-black text-[#171717]">
                Aplikasi tidak dapat dimuatkan buat sementara waktu.
              </h2>
              <p className="text-xs text-stone-500">
                Terdapat ralat teknikal yang tidak dijangka. Sila muat semula pelayar atau semak sambungan internet anda.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#171717] hover:bg-[#333333] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CUBA SEMULA</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
