import React from 'react';

export default function PlayerRoleBadge({ myRole, myName, otherSpies = [] }) {
  const isSpy = myRole === 'SPY';

  return (
    <div className="w-full max-w-4xl mx-auto mb-3">
      <div className={`
        w-full py-2.5 px-4 rounded-xl border flex flex-col items-center justify-center shadow-lg transition-all duration-300 font-mono select-none text-center
        ${isSpy
          ? 'bg-[#181012] border-zinc-700 text-zinc-200'
          : 'bg-[#0f1713] border-emerald-600/80 text-emerald-300'
        }
      `}>
        <div className="text-sm md:text-base font-extrabold tracking-wider">
          <span>{isSpy ? 'CASUS' : 'SİVİL'}</span>
          <span className="text-zinc-300 font-semibold ml-2">({myName || 'Oyuncu'})</span>
        </div>

        {isSpy && otherSpies && otherSpies.length > 0 && (
          <div className="text-xs text-zinc-300 font-sans mt-1">
            Diğer Casus(lar): <span className="font-bold text-white">{otherSpies.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
