import React from 'react';
import { X, Smartphone, Download, CheckCircle, Share2, PlusSquare } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallAccepted?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallAccepted,
}) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onInstallAccepted?.();
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Instalar en Android / Móvil</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-2xs">
              <Download className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Instala la aplicación en tu dispositivo
            </h4>
            <p className="text-slate-500 leading-relaxed">
              Disfruta de la experiencia nativa de pantalla completa, acceso rápido desde tu pantalla de inicio y dictado por voz continuo.
            </p>
          </div>

          {deferredPrompt ? (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Ahora en la Pantalla de Inicio</span>
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <p className="font-bold text-slate-800">Cómo instalar manualmente:</p>
              <div className="space-y-2 text-slate-600 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">1.</span>
                  <span>En Chrome / Edge para Android, presiona el menú de tres puntos (⋮).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">3.</span>
                  <span>¡Listo! Se creará el acceso directo con el icono del asistente.</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1 text-[11px] text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Funciona sin conexión</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Voz nativa instantánea</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
