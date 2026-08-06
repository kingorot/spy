import React from 'react';
import { MessageSquare, User } from 'lucide-react';

export const ClueTable = ({ clueLogs = [] }) => {
  const playerClues = clueLogs.filter(log => log.senderName !== 'Sistem');

  if (playerClues.length === 0) return null;

  return (
    <div className="glass-panel p-3.5 rounded-2xl border border-zinc-800 space-y-2.5 shadow-xl">
      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
        <span>İPUÇLARI TABLOSU</span>
      </h4>

      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {playerClues.map((clue, idx) => (
          <div
            key={idx}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs gap-2"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="w-3 h-3 text-zinc-500 flex-shrink-0" />
              <span className="font-bold text-white truncate max-w-[90px]">{clue.senderName}</span>
            </div>
            <span className="font-black text-zinc-100 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 truncate text-[11px]">
              "{clue.text}"
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
