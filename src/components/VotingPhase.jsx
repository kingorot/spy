import React, { useState } from 'react';
import { Vote, UserX, CheckCircle2, ArrowRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const VotingPhase = ({
  players,
  myPlayerId,
  onCastVote,
  votes,
  voteLogs
}) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  const handleVoteSubmit = (targetId) => {
    soundEngine.playVoteCast();
    setSelectedTargetId(targetId);
    setHasVoted(true);
    onCastVote(targetId);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 space-y-3 shadow-xl">
      {/* Header */}
      <div className="text-center">
        <span className="px-2.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider">
          OYLAMA
        </span>
      </div>

      {!hasVoted ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {players.map((p) => {
              const isMe = p.id === myPlayerId;
              return (
                <button
                  key={p.id}
                  onClick={() => handleVoteSubmit(p.id)}
                  disabled={isMe}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isMe
                      ? 'bg-zinc-900/40 border-zinc-800 opacity-40 cursor-not-allowed'
                      : 'bg-zinc-900 border-zinc-700 hover:border-rose-500 hover:bg-rose-950/20'
                  }`}
                >
                  <span className="text-xs font-bold text-white truncate">{p.name} {isMe && '(Sen)'}</span>
                  <Vote className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleVoteSubmit('PAS')}
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <UserX className="w-4 h-4" />
            <span>PAS GEÇ</span>
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-black text-xs">
            <CheckCircle2 className="w-4 h-4" /> OYUN KULLANILDI
          </div>
          <p className="text-xs text-zinc-300">
            {selectedTargetId === 'PAS'
              ? 'Tercih: PAS'
              : `Tercih: ${players.find(p => p.id === selectedTargetId)?.name || 'Oyuncu'}`}
          </p>
        </div>
      )}

      {/* Transparent Live Vote Table */}
      {voteLogs.length > 0 && (
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
            OY DAĞILIMI
          </h4>

          <div className="space-y-1">
            {voteLogs.map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold"
              >
                <span className="text-zinc-200">{log.voterName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span className={log.targetId === 'PAS' ? 'text-amber-400 font-black' : 'text-rose-400 font-black'}>
                  {log.targetName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
