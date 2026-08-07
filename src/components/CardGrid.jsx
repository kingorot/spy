import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CardGrid({ cards, secretWord, isSpy, isMyTurn, onSpyGuess }) {
  const [markedCards, setMarkedCards] = useState({});

  const toggleMarkCard = (card) => {
    sounds.playClick();
    setMarkedCards(prev => ({
      ...prev,
      [card]: !prev[card]
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 px-2">
      {/* 5x4 Grid layout (5 columns x 4 rows) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {cards.map((card, idx) => {
          const isSecret = !isSpy && secretWord && card.toLowerCase() === secretWord.toLowerCase();
          const isMarked = markedCards[card];

          return (
            <div
              key={idx}
              onClick={() => toggleMarkCard(card)}
              className={`
                relative h-20 md:h-24 rounded-2xl p-3 flex flex-col items-center justify-center text-center select-none cursor-pointer transition-all duration-200 transform active:scale-95 shadow-md overflow-hidden
                ${isSecret
                  ? 'bg-[#0f241a] border-2 border-emerald-500 text-emerald-300 font-extrabold ring-2 ring-emerald-500/30'
                  : isMarked
                    ? 'bg-[#07080c] border border-zinc-700/80 shadow-inner'
                    : 'bg-[#14151c] hover:bg-[#1c1d27] border border-zinc-800 text-zinc-100 font-semibold hover:border-zinc-700'
                }
              `}
            >
              {/* Card text - hidden when marked */}
              {!isMarked && (
                <span className={`text-sm md:text-base tracking-wide z-10 ${isSecret ? 'font-extrabold text-emerald-200' : 'font-medium'}`}>
                  {card}
                </span>
              )}

              {/* Prominent SPY Logo Overlay when marked */}
              {isMarked && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#07080c]/90">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900/90 border border-zinc-600 flex items-center justify-center shadow-lg">
                    <Eye className="w-7 h-7 text-white stroke-[2.5]" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
