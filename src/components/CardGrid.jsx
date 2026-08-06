import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { CATEGORIES } from '../data/categories';

export const CardGrid = ({ words = [], secretWord = '', isSpy = false }) => {
  const [flippedIndices, setFlippedIndices] = useState({});

  const activeWords = words && words.length >= 20 ? words : CATEGORIES[0].words.slice(0, 20);

  const toggleFlip = (e, index) => {
    if (e) {
      e.preventDefault();
    }
    soundEngine.playClick();
    setFlippedIndices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="my-3">
      {/* 20 Cards Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {activeWords.map((word, idx) => {
          const isSecret = !isSpy && secretWord && word.toLowerCase() === secretWord.toLowerCase();
          const isFlipped = flippedIndices[idx];

          return (
            <div
              key={idx}
              onClick={(e) => toggleFlip(e, idx)}
              className="card-flip-container h-[82px] sm:h-[94px] cursor-pointer select-none touch-manipulation"
            >
              <div className={`card-flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
                {/* FRONT FACE (Word centered in middle of card) */}
                <div
                  className={`card-face-front p-3 border flex items-center justify-center text-center relative shadow-md transition-all ${
                    isSecret
                      ? 'card-secret-emerald'
                      : 'glass-card-matrix hover:border-zinc-500'
                  }`}
                >
                  <p className={`text-xs sm:text-sm font-black tracking-wide break-words text-center ${
                    isSecret ? 'text-emerald-100 text-sm sm:text-base font-black' : 'text-zinc-100'
                  }`}>
                    {word}
                  </p>
                </div>

                {/* BACK FACE (Minimal logo card back) */}
                <div className="card-face-back p-3 border border-zinc-800 flex items-center justify-center shadow-inner relative overflow-hidden bg-zinc-950">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow">
                    <Eye className="w-4 h-4 text-zinc-200" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
