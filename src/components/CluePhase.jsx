import React, { useState, useEffect } from 'react';
import { Send, UserCheck, Clock, Timer } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const CluePhase = ({
  turnOrder,
  currentTurnIndex,
  players,
  myPlayerId,
  onSubmitClue,
  gameMode = 'classic',
  turnDuration = 30,
  eliminatedPlayers = []
}) => {
  const [clueText, setClueText] = useState('');
  const [timeLeft, setTimeLeft] = useState(turnDuration);

  // Filter out eliminated players from active turn order
  const activeTurnOrder = (turnOrder || []).filter(pid => !(eliminatedPlayers || []).includes(pid));
  const currentTurnPlayerId = activeTurnOrder[currentTurnIndex] || activeTurnOrder[0];
  const activePlayer = players.find(p => p.id === currentTurnPlayerId) || { name: 'Oyuncu' };
  const isMyTurn = currentTurnPlayerId === myPlayerId && !(eliminatedPlayers || []).includes(myPlayerId);

  // Timed Mode Countdown
  useEffect(() => {
    if (gameMode !== 'timed') return;

    setTimeLeft(turnDuration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (isMyTurn) {
            onSubmitClue('Süre Doldu (Otomatik Pas)');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurnIndex, gameMode, turnDuration, isMyTurn, onSubmitClue]);

  const handleClueSubmit = (e) => {
    e.preventDefault();
    soundEngine.playClueGiven();
    onSubmitClue(clueText.trim() || 'İpucumu Verdim');
    setClueText('');
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-xl">
      {/* Active Turn Header */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
            isMyTurn
              ? 'bg-white text-zinc-950 shadow'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
          }`}>
            {currentTurnIndex + 1}
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span className="text-zinc-400 font-normal">Sıra:</span>
              <span className="text-white font-black">{activePlayer.name}</span>
              {isMyTurn && <span className="text-[10px] px-2 py-0.5 rounded bg-white text-zinc-950 font-black uppercase">(SEN)</span>}
            </h3>
          </div>
        </div>

        {/* Timed Mode Timer or Next Player Indicator */}
        <div className="flex items-center gap-2">
          {gameMode === 'timed' && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border transition-all ${
              timeLeft <= 5
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                : 'bg-zinc-800 text-amber-400 border-amber-500/30'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Sıradaki: {activeTurnOrder[currentTurnIndex + 1] ? (players.find(p => p.id === activeTurnOrder[currentTurnIndex + 1])?.name || 'Sonraki') : 'Oylama'}</span>
          </div>
        </div>
      </div>

      {/* Clue Input Form */}
      {isMyTurn ? (
        <form onSubmit={handleClueSubmit} className="flex gap-2">
          <input
            type="text"
            value={clueText}
            onChange={(e) => setClueText(e.target.value)}
            placeholder="İpucu yaz..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-xs font-semibold focus:outline-none focus:border-zinc-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
          >
            <span>Gönder</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-center text-xs text-zinc-400 font-medium">
          <span className="text-white font-bold">{activePlayer.name}</span> ipucu veriyor...
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {activeTurnOrder.map((pid, idx) => {
          const p = players.find(player => player.id === pid);
          const isDone = idx < currentTurnIndex;
          const isCurrent = idx === currentTurnIndex;

          return (
            <div
              key={pid}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${
                isCurrent
                  ? 'bg-white text-zinc-950 border-white'
                  : isDone
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 line-through'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <span>{idx + 1}. {p ? p.name : 'Oyuncu'}</span>
              {isDone && <UserCheck className="w-3 h-3 text-emerald-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
