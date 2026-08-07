import React, { useState, useEffect } from 'react';
import { Send, Clock } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CluePhase({ roomState, myPlayerId, onSubmitClue }) {
  const [clueInput, setClueInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  if (!roomState || !roomState.turnOrder || roomState.turnOrder.length === 0) return null;

  const currentSpeakerId = roomState.turnOrder[roomState.currentTurnIndex];
  const currentSpeaker = roomState.players.find(p => p.id === currentSpeakerId);
  const nextSpeakerId = roomState.turnOrder[(roomState.currentTurnIndex + 1) % roomState.turnOrder.length];
  const nextSpeaker = roomState.players.find(p => p.id === nextSpeakerId);

  const isMyTurn = currentSpeakerId === myPlayerId;
  const isFastMode = roomState.gameMode === 'Zaman Sınırlı Mod';

  // Countdown timer for Hızlı Mod
  useEffect(() => {
    if (!isFastMode || !roomState.turnTimeLimit) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(roomState.turnTimeLimit);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          if (isMyTurn) {
            sounds.playClue();
            onSubmitClue('pas');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roomState.currentTurnIndex, roomState.currentRound, isFastMode, roomState.turnTimeLimit, isMyTurn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clueInput.trim()) return;
    sounds.playClue();
    onSubmitClue(clueInput.trim());
    setClueInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#101116] border border-zinc-800 rounded-2xl p-4 md:p-5 shadow-xl">
      {/* Top turn row */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-semibold text-zinc-300 font-mono">
            Sıra: <strong className="text-white font-extrabold">{currentSpeaker?.name || 'Oyuncu'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isFastMode && timeLeft !== null && (
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {nextSpeaker && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <span>Sıradaki: {nextSpeaker.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtitle Status */}
      <div className="text-center my-2 text-xs md:text-sm font-medium text-zinc-400">
        {isMyTurn ? (
          <span className="text-white font-extrabold">Senin Sıran - İpucunu Yaz</span>
        ) : (
          <span>{currentSpeaker?.name} ipucu veriyor...</span>
        )}
      </div>

      {/* Turn sequence badges (Fixed order based on roomState.players original order) */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto my-3 py-1">
        {roomState.turnOrder.map((pid, idx) => {
          const p = roomState.players.find(player => player.id === pid);
          const isCurrent = pid === currentSpeakerId;
          return (
            <div
              key={pid}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition border
                ${isCurrent
                  ? 'bg-white text-black border-white font-extrabold shadow-md'
                  : 'bg-[#171820] text-zinc-400 border-zinc-800 font-semibold'
                }
              `}
            >
              {idx + 1}. {p?.name}
            </div>
          );
        })}
      </div>

      {/* Clue Input without "(Tek kelime)..." */}
      {isMyTurn && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={clueInput}
            onChange={(e) => setClueInput(e.target.value)}
            placeholder="İpucunuzu yazın..."
            maxLength={30}
            required
            autoFocus
            className="flex-1 bg-[#090a0d] border border-zinc-700 focus:border-white rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none transition shadow-inner"
          />
          <button
            type="submit"
            className="bg-white hover:bg-zinc-200 text-black font-extrabold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 text-sm shadow-md active:scale-95"
          >
            <span>Gönder</span>
            <Send className="w-4 h-4 text-black stroke-[2.5]" />
          </button>
        </form>
      )}
    </div>
  );
}
