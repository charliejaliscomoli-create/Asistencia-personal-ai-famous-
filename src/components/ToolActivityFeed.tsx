import React from 'react';
import { CheckCircle2, Clock, Zap } from 'lucide-react';
import { ToolInvocation } from '../types';

interface ToolActivityFeedProps {
  tools: ToolInvocation[];
}

export const ToolActivityFeed: React.FC<ToolActivityFeedProps> = ({ tools }) => {
  if (tools.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-2xl p-3 text-xs shadow-xs">
      <div className="flex items-center gap-1.5 font-semibold text-slate-300 pb-2 border-b border-slate-800">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>Acciones Ejecutadas por el Asistente</span>
      </div>
      <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
        {tools.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-2 p-1.5 bg-slate-800/80 rounded-lg"
          >
            <div className="flex items-center gap-2 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-indigo-300 text-[11px]">{t.toolName}</span>
              <span className="text-slate-300 truncate text-[11px]">{t.resultSummary}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {t.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
