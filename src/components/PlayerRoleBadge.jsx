import React from 'react';

export const PlayerRoleBadge = ({ isSpy, playerName, isEliminated }) => {
  if (isEliminated) {
    return (
      <div className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl flex items-center justify-between gap-3 shadow-lg my-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-rose-400 font-black text-xs tracking-wider uppercase border border-rose-500/30">
            ELENDİNİZ (İZLEYİCİ)
          </span>
          <span className="text-xs text-zinc-400 font-bold">
            ({playerName})
          </span>
        </div>
      </div>
    );
  }

  if (isSpy) {
    return (
      <div className="w-full card-spy-neon p-3 rounded-xl flex items-center justify-between gap-3 shadow-lg my-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white font-black text-xs tracking-wider uppercase">
            CASUS
          </span>
          <span className="text-xs text-rose-200 font-bold">
            ({playerName})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full card-secret-emerald p-3 rounded-xl flex items-center justify-between gap-3 shadow-lg my-2">
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-zinc-950 font-black text-xs tracking-wider uppercase">
          SİVİL
        </span>
        <span className="text-xs text-emerald-200 font-bold">
          ({playerName})
        </span>
      </div>
    </div>
  );
};
