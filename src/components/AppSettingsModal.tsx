import React, { useRef } from 'react';
import {
  X,
  Settings,
  Sun,
  Volume2,
  Bell,
  Database,
  Smartphone,
  Info,
  Download,
  Upload,
  RotateCcw,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings } from '../types';
import { type User } from '../lib/firebase';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/audioService';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  currentUser?: User | null;
  onOpenAuth?: () => void;
  onSignOut?: () => Promise<void>;
  onExportData?: () => void;
  onImportData?: (data: any) => void;
  onResetData?: () => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentUser,
  onOpenAuth,
  onSignOut,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        onImportData?.(json);
        alert('Copia de seguridad restaurada correctamente.');
      } catch (err) {
        alert('El archivo seleccionado no tiene un formato JSON válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configuración de la Aplicación</h3>
              <p className="text-[11px] text-slate-500">Preferencias generales, audio, datos y cuenta</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* Section: Cuenta y Sesión */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
              Cuenta y Sincronización en la Nube
            </span>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  {currentUser ? currentUser.displayName || currentUser.email : 'Sin cuenta vinculada'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentUser
                    ? 'Sincronizado con Firebase Cloud Firestore'
                    : 'Inicia sesión con Gmail para respaldar tus datos en la nube'}
                </p>
              </div>
              {currentUser ? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Salir
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Conectar
                </button>
              )}
            </div>
          </div>

          {/* Section: Apariencia */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Apariencia
            </span>
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Tema de interfaz</p>
                  <p className="text-[11px] text-slate-500">Ajusta los colores principales</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onUpdateSettings({ theme: t })}
                      className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                        settings.theme === t ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      {t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Auto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Respaldo y Datos */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              Gestión de Datos y Copias de Seguridad
            </span>
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Exportar todos los datos</p>
                  <p className="text-[11px] text-slate-500">Descarga un archivo JSON con citas, notas y alarmas</p>
                </div>
                <button
                  type="button"
                  onClick={onExportData}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Importar copia previa</p>
                  <p className="text-[11px] text-slate-500">Cargar un archivo .json de respaldo</p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Subir
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-rose-700">Restablecer aplicación</p>
                  <p className="text-[11px] text-slate-500">Vuelve a los datos de muestra iniciales</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Deseas restaurar los datos de ejemplo iniciales?')) {
                      onResetData?.();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar
                </button>
              </div>
            </div>
          </div>

          {/* Section: Acerca de */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-[11px] text-slate-500">
            <p className="font-bold text-slate-700">Asistente de Voz Personal v2.5.0</p>
            <p>Compatible con PWA Web, Android (Capacitor APK) y Google Gemini 2.5 Flash.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
