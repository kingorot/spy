import React from 'react';
import { MessageSquare, User } from 'lucide-react';

export const ClueTable = ({ clueLogs = [] }) => {
  const playerClues = clueLogs.filter(log => log.senderName !== 'Sistem');

  if (playerClues.length === 0) return null;

  return (
    <div className="glass-panel p-3.5 rounded-2xl border border-zinc-800 space-y-2.5 shadow-xl w-full">
      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
        <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
        <span>İPUÇLARI</span>
      </h4>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {playerClues.map((clue, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold truncate">
              <User className="w-3 h-3 text-zinc-500 flex-shrink-0" />
              <span className="truncate text-white">{clue.senderName}</span>
            </div>

            <div className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-center font-black text-xs text-zinc-100 tracking-wide break-words">
              "{clue.text}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
