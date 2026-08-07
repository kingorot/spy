import React, { useEffect } from 'react';
import { Trophy, RefreshCw, UserX, Skull } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameOverModal({ roomState, myPlayerId, onReturnToLobby }) {
  if (!roomState) return null;

  const winner = roomState.winner;
  const isLossForMe = winner === 'SPY' || winner === 'MADMAN';

  useEffect(() => {
    if (isLossForMe) {
      sounds.playLose();
    } else {
      sounds.playWin();
    }
  }, [isLossForMe]);

  const isHost = roomState.hostId === myPlayerId;

  const winTitle = winner === 'MADMAN'
    ? 'DELİ KAZANDI'
    : winner === 'SPY'
      ? 'CASUS KAZANDI'
      : 'SİVİLLER KAZANDI';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#101116] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-3 shadow-lg text-white">
          {winner === 'CIVILIANS' ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-widest text-white mb-2 font-mono">
          {winTitle}
        </h2>

        <p className="text-sm text-zinc-300 font-medium mb-5 px-2">
          {roomState.winReason}
        </p>

        {/* Secret Word Box */}
        <div className="w-full bg-[#161720] border border-zinc-800 rounded-xl p-4 mb-5 text-center shadow-inner">
          <span className="text-xs text-zinc-400 uppercase font-mono block mb-1">
            GİZLİ KELİME
          </span>
          <span className="text-xl md:text-2xl font-extrabold text-white font-mono tracking-wide">
            "{roomState.secretWord}"
          </span>
          {roomState.madmanWord && (
            <span className="text-xs text-zinc-400 font-mono block mt-1">
              (Delinin Kelimesi: <strong className="text-white">"{roomState.madmanWord}"</strong>)
            </span>
          )}
        </div>

        {/* Players & Roles summary */}
        <div className="w-full bg-[#14151d] border border-zinc-800 rounded-xl p-4 mb-6 text-left">
          <span className="text-xs font-bold text-zinc-400 uppercase font-mono block mb-2">
            OYUNCU ROLLERİ
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {roomState.players.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs font-mono bg-[#0b0c10] px-3 py-2 rounded-lg border border-zinc-800/60">
                <span className="text-zinc-200 font-semibold">{p.name}</span>
                <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-white border border-zinc-700">
                  {p.role === 'SPY' ? 'CASUS' : p.role === 'MADMAN' ? 'DELİ' : 'SİVİL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={() => {
              sounds.playClick();
              onReturnToLobby();
            }}
            className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm font-mono tracking-wider shadow-xl active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-black" />
            <span>LOBİYE DÖN</span>
          </button>
        ) : (
          <div className="text-xs text-zinc-400 font-mono italic">
            Oda sahibinin lobiye dönmesi bekleniyor...
          </div>
        )}
      </div>
    </div>
  );
}
