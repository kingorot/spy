import React, { useState } from 'react';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function VotingPhase({ roomState, myPlayerId, onSubmitVote }) {
  const [selectedTarget, setSelectedTarget] = useState(null);

  if (!roomState) return null;

  const myVote = roomState.votes?.[myPlayerId];
  const candidates = roomState.players.filter(p => p.isAlive);

  const handleVoteSubmit = (targetId) => {
    sounds.playClick();
    setSelectedTarget(targetId);
    onSubmitVote(targetId);
  };

  // Map votes: targetPlayerId -> array of voter names
  const voteDetails = {};
  Object.entries(roomState.votes || {}).forEach(([voterId, targetId]) => {
    const voter = roomState.players.find(p => p.id === voterId);
    if (voter && targetId) {
      if (!voteDetails[targetId]) voteDetails[targetId] = [];
      voteDetails[targetId].push(voter.name);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#101116] border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-3">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-widest font-mono mb-1">
          OYLAMA EVRESİ
        </h2>
        <p className="text-xs text-zinc-400 mb-6 font-medium">
          Şüphelendiğiniz oyuncuyu seçin. Çoğunluk oyu alan oyuncu sorgulanacaktır.
        </p>

        <div className="w-full space-y-3 mb-4">
          {candidates.map((p) => {
            const isSelf = p.id === myPlayerId;
            const votersForThisPlayer = voteDetails[p.id] || [];

            return (
              <div key={p.id} className="w-full">
                <button
                  disabled={isSelf || !!myVote}
                  onClick={() => handleVoteSubmit(p.id)}
                  className={`
                    w-full py-3 px-4 rounded-xl border font-bold text-sm transition flex items-center justify-between font-mono active:scale-98
                    ${myVote === p.id
                      ? 'bg-white text-black border-white'
                      : isSelf || !!myVote
                        ? 'bg-[#14151e] text-zinc-400 border-zinc-800 opacity-80 cursor-not-allowed'
                        : 'bg-[#171822] hover:bg-white hover:text-black text-zinc-200 border-zinc-800'
                    }
                  `}
                >
                  <span>{p.name} {isSelf && '(Sen)'}</span>
                  <span className="text-xs font-semibold">
                    {myVote === p.id ? 'Oyunuz' : !myVote && !isSelf ? 'Oy Ver' : ''}
                  </span>
                </button>

                {/* Show who voted for this player in real-time */}
                {votersForThisPlayer.length > 0 && (
                  <div className="text-[11px] text-zinc-400 font-mono mt-1 text-left px-2">
                    <span className="font-bold text-white">Oy Verenler ({votersForThisPlayer.length}):</span> {votersForThisPlayer.join(', ')}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pas Geç button without "(Şüpheli Yok)" */}
          <div className="w-full pt-1">
            <button
              disabled={!!myVote}
              onClick={() => handleVoteSubmit('PASS')}
              className={`
                w-full py-2.5 px-4 rounded-xl border font-semibold text-xs transition font-mono
                ${myVote === 'PASS'
                  ? 'bg-zinc-700 text-white border-zinc-600 font-bold'
                  : !!myVote
                    ? 'bg-[#13141b] text-zinc-500 border-zinc-800/80 opacity-60 cursor-not-allowed'
                    : 'bg-[#13141b] hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
                }
              `}
            >
              <span>Pas Geç</span>
            </button>
            {voteDetails['PASS'] && voteDetails['PASS'].length > 0 && (
              <div className="text-[11px] text-zinc-400 font-mono mt-1 text-left px-2">
                <span className="font-bold text-white">Pas Geçenler ({voteDetails['PASS'].length}):</span> {voteDetails['PASS'].join(', ')}
              </div>
            )}
          </div>
        </div>

        {myVote && (
          <div className="w-full bg-[#161720] border border-zinc-800 rounded-xl p-3 text-zinc-300 font-medium text-xs">
            Oyunuz kaydedildi. Tüm oyuncuların oy kullanması bekleniyor...
          </div>
        )}
      </div>
    </div>
  );
}
