import React, { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export default function ClueTable({ clues = [] }) {
  const [activeRound, setActiveRound] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  const maxRound = clues.reduce((max, c) => Math.max(max, c.round || 1), 1);
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  // Automatically switch to the latest round when new round clues are added
  useEffect(() => {
    setActiveRound(maxRound);
  }, [maxRound, clues.length]);

  const currentClues = clues.filter(c => (c.round || 1) === activeRound);

  return (
    <div className="w-full bg-[#0c0d12]/95 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl overflow-hidden transition-all">
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="px-3.5 py-2.5 bg-[#14151c] border-b border-zinc-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-300" />
          <span className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">
            İPUÇLARI
          </span>
        </div>

        {/* Round tabs */}
        {!collapsed && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {rounds.map(r => (
              <button
                key={r}
                onClick={() => setActiveRound(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition ${
                  activeRound === r
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {r}. Tur
              </button>
            ))}
          </div>
        )}

        {collapsed ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-3 max-h-48 overflow-y-auto space-y-2 text-xs">
          {currentClues.length === 0 ? (
            <p className="text-zinc-500 italic text-center py-2">Bu turda henüz ipucu yok.</p>
          ) : (
            currentClues.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-[#14151d] border border-zinc-800 px-3 py-2 rounded-lg text-zinc-200 font-mono"
              >
                <span className="text-zinc-400 font-medium">{item.playerName}:</span>
                <span className="text-white font-extrabold bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                  "{item.clueText}"
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
