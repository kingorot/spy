import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const GameOverModal = ({
  winner,
  secretWord,
  spies,
  players,
  isHost,
  onReturnToLobby
}) => {
  useEffect(() => {
    soundEngine.playVictory();
  }, []);

  const spyPlayers = players.filter(p => spies.includes(p.id));
  const isNormalsWin = winner === 'NORMALS';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 max-w-md w-full text-center space-y-5 shadow-2xl relative">
        <h2 className={`text-3xl font-black tracking-tight ${
          isNormalsWin ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {isNormalsWin ? 'SİVİLLER KAZANDI' : 'CASUS KAZANDI'}
        </h2>

        <div className="grid grid-cols-2 gap-2.5 text-left">
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
              GİZLİ KELİME
            </span>
            <p className="text-base font-black text-white">{secretWord}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block mb-1">
              CASUS
            </span>
            <p className="text-base font-black text-white truncate">
              {spyPlayers.map(p => p.name).join(', ') || 'Bilinmiyor'}
            </p>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={() => { soundEngine.playClick(); onReturnToLobby(); }}
            className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>LOBİYE DÖN</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400">
            Ev sahibinin lobiye dönmesi bekleniyor...
          </div>
        )}
      </div>
    </div>
  );
};
