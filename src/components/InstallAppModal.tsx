import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Copy,
  Check,
  X,
  Sparkles,
  Terminal,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onTriggerInstall: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'capacitor'>('direct');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
          id="install-apk-modal"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                  Instalar en Android / APK
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Listo
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Dos métodos fáciles para tener la app en tu teléfono
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Install Banner if browser supports beforeinstallprompt */}
          {deferredPrompt && (
            <div className="bg-emerald-50 border-b border-emerald-200/80 px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-900 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tu navegador permite la instalación nativa inmediata (WebAPK).</span>
              </div>
              <button
                onClick={() => {
                  onTriggerInstall();
                  onClose();
                }}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar Ahora
              </button>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-white text-indigo-950 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              1. Directo en Android (Más fácil)
            </button>
            <button
              onClick={() => setActiveTab('capacitor')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'capacitor'
                  ? 'bg-white text-indigo-950 font-semibold shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-indigo-600" />
              2. Compilar APK (.apk)
            </button>
          </div>

          {/* Content Area */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
            {activeTab === 'direct' ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-indigo-900 leading-relaxed">
                  <p className="font-semibold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Instalación WebAPK nativa de Android:
                  </p>
                  No requiere Android Studio ni cables. Android empaqueta la aplicación como un APK nativo en tu pantalla de inicio con soporte de voz completo.
                </div>

                <ol className="space-y-3">
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">Abre el enlace en tu Android</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Abre esta aplicación web desde Google Chrome, Brave o Edge en tu teléfono celular.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">Menú del navegador (⋮)</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Toca los tres puntos en la esquina superior derecha del navegador.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      3
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">Selecciona "Instalar aplicación"</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        O "Añadir a pantalla de inicio". Aparecerá en tu lista de aplicaciones como cualquier app APK normal.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 leading-relaxed">
                  <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Capacitor Android Tooling configurado:
                  </p>
                  Ya instalamos y configuramos <code>@capacitor/core</code>, <code>@capacitor/android</code> y <code>@capacitor/cli</code> con permisos de micrófono (<code>RECORD_AUDIO</code>), notificaciones y alarmas en <code>AndroidManifest.xml</code>.
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        Comando 1: Sincronizar proyecto con Android
                      </span>
                      <button
                        onClick={() => handleCopy('npm run android:sync', 'sync')}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Copiar comando"
                      >
                        {copiedCode === 'sync' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px]">
                      npm run android:sync
                    </code>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        Comando 2: Compilar APK directo (Gradle)
                      </span>
                      <button
                        onClick={() => handleCopy('npm run android:apk', 'apk')}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Copiar comando"
                      >
                        {copiedCode === 'apk' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px]">
                      npm run android:apk
                    </code>
                    <p className="text-[10px] text-slate-500 mt-1.5">
                      Genera el archivo en: <span className="font-mono text-slate-700">android/app/build/outputs/apk/debug/app-debug.apk</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        Comando 3: Abrir en Android Studio
                      </span>
                      <button
                        onClick={() => handleCopy('npm run cap:open', 'open')}
                        className="p-1 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Copiar comando"
                      >
                        {copiedCode === 'open' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px]">
                      npm run cap:open
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              ID del paquete: <code className="font-mono text-slate-700">com.asistente.voz</code>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-medium text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
