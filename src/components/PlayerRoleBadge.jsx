import React from 'react';

export default function PlayerRoleBadge({ myRole, myName, otherSpies = [], gameMode }) {
  const isSpy = myRole === 'SPY';

  // In Delinin OyunAlanı, everyone sees themselves as SİVİL!
  const displayRole = (gameMode === 'Delinin OyunAlanı') ? 'SİVİL' : (isSpy ? 'CASUS' : 'SİVİL');
  const isGreenStyle = displayRole === 'SİVİL';

  return (
    <div className="w-full max-w-4xl mx-auto mb-3">
      <div className={`
        w-full py-2.5 px-4 rounded-xl border flex flex-col items-center justify-center shadow-lg transition-all duration-300 font-mono select-none text-center
        ${isGreenStyle
          ? 'bg-[#0f1713] border-emerald-600/80 text-emerald-300'
          : 'bg-[#181012] border-zinc-700 text-zinc-200'
        }
      `}>
        <div className="text-sm md:text-base font-extrabold tracking-wider">
          <span>{displayRole}</span>
          <span className="text-zinc-300 font-semibold ml-2">({myName || 'Oyuncu'})</span>
        </div>

        {isSpy && gameMode !== 'Delinin OyunAlanı' && otherSpies && otherSpies.length > 0 && (
          <div className="text-xs text-zinc-300 font-sans mt-1">
            Diğer Casus(lar): <span className="font-bold text-white">{otherSpies.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
