import React, { useState, useEffect } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const ClueTable = ({ clueLogs = [], players = [], turnOrder = [] }) => {
  const [selectedRound, setSelectedRound] = useState(1);

  // Parse clueLogs into round-based clue maps
  // Format: { 1: { "senderId/Name": "clueText" } }
  const roundCluesMap = {};
  let currentRoundCounter = 1;

  clueLogs.forEach(log => {
    if (log.senderName === 'Sistem' && log.text) {
      const match = log.text.match(/(\d+)\.\s*Tur/i);
      if (match && match[1]) {
        currentRoundCounter = parseInt(match[1], 10);
      }
    } else if (log.senderName && log.senderName !== 'Sistem') {
      if (!roundCluesMap[currentRoundCounter]) {
        roundCluesMap[currentRoundCounter] = {};
      }
      // Store by senderId if available, fallback to senderName
      const key = log.senderId || log.senderName;
      roundCluesMap[currentRoundCounter][key] = log.text;
    }
  });

  const availableRounds = Object.keys(roundCluesMap).map(Number).sort((a, b) => a - b);
  const maxAvailableRound = availableRounds.length > 0 ? Math.max(...availableRounds) : 1;

  // Auto-switch to highest round when a new round starts
  useEffect(() => {
    if (maxAvailableRound > 0) {
      setSelectedRound(maxAvailableRound);
    }
  }, [maxAvailableRound]);

  if (availableRounds.length === 0) return null;

  const currentRoundData = roundCluesMap[selectedRound] || {};

  // Preserve FIXED player ordering using turnOrder or players list so order NEVER changes between tabs!
  const orderedPlayers = (turnOrder && turnOrder.length > 0)
    ? turnOrder.map(pid => players.find(p => p.id === pid)).filter(Boolean)
    : players;

  return (
    <div className="glass-panel p-3 rounded-2xl border border-zinc-800 shadow-2xl space-y-2 max-h-64 overflow-y-auto w-full">
      {/* Header & Round Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 flex-wrap gap-1">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-300">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
          <span>İPUÇLARI</span>
        </div>

        {/* Round Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {availableRounds.map(rNum => {
            const isSelected = selectedRound === rNum;
            return (
              <button
                key={rNum}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedRound(rNum);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-black transition-all ${
                  isSelected
                    ? 'bg-white text-zinc-950 shadow'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {rNum}. Tur
              </button>
            );
          })}
        </div>
      </div>

      {/* Clues List for Selected Round (Fixed Player Order) */}
      <div className="space-y-1.5">
        {orderedPlayers.map((player) => {
          const clueText = currentRoundData[player.id] || currentRoundData[player.name];
          if (!clueText) return null; // Only render if clue was given in this round

          return (
            <div
              key={player.id}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-1 text-xs text-zinc-300 font-bold truncate">
                <User className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{player.name}:</span>
              </div>

              <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-black text-xs whitespace-nowrap">
                "{clueText}"
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
