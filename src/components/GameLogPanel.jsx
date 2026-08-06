import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';

export default function GameLogPanel({ logs = [] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full bg-[#0c0d12]/95 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl overflow-hidden transition-all">
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="px-3.5 py-2.5 bg-[#14151c] border-b border-zinc-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-300" />
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">
            GEÇMİŞ ({logs.length})
          </span>
        </div>
        {collapsed ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono">
          {logs.length === 0 ? (
            <p className="text-zinc-500 italic">Henüz geçmiş kaydı yok.</p>
          ) : (
            logs.slice(-15).map((log) => (
              <div key={log.id} className="flex items-start gap-2 border-b border-zinc-800/60 pb-1">
                <span className="text-zinc-600 text-[10px] shrink-0 mt-0.5">{log.timestamp}</span>
                <span className="break-words text-zinc-300 font-medium">
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
