import React from 'react';
import { MessageSquare, User, ArrowRight } from 'lucide-react';

export const ClueTable = ({ clueLogs = [], players = [] }) => {
  const playerCluesMap = {};

  // Group all player clues sequentially by senderId / senderName
  clueLogs.forEach(log => {
    if (log.senderName !== 'Sistem' && log.senderName) {
      if (!playerCluesMap[log.senderName]) {
        playerCluesMap[log.senderName] = [];
      }
      playerCluesMap[log.senderName].push(log.text);
    }
  });

  const playerEntries = Object.entries(playerCluesMap);

  if (playerEntries.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 z-30 max-w-[calc(100vw-2rem)] sm:max-w-md">
      <div className="glass-panel p-3 rounded-2xl border border-zinc-800 shadow-2xl space-y-2 max-h-60 overflow-y-auto">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-300 border-b border-zinc-800 pb-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          <span>İPUÇLARI</span>
        </div>

        <div className="space-y-1.5">
          {playerEntries.map(([senderName, clues], idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 overflow-x-auto"
            >
              <div className="flex items-center gap-1 text-xs text-zinc-300 font-bold flex-shrink-0">
                <User className="w-3 h-3 text-zinc-400" />
                <span>{senderName}:</span>
              </div>

              <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto py-0.5">
                {clues.map((clueText, cIdx) => (
                  <React.Fragment key={cIdx}>
                    {cIdx > 0 && <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />}
                    <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-black text-xs whitespace-nowrap">
                      "{clueText}"
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
