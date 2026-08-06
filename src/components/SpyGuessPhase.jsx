import React, { useState } from 'react';
import { Target, ShieldAlert, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const SpyGuessPhase = ({
  words,
  isSpy,
  onSpyGuessSubmit,
  accusedPlayerName
}) => {
  const [selectedWord, setSelectedWord] = useState(null);

  const handleConfirmGuess = () => {
    if (!selectedWord) return;
    soundEngine.playClick();
    onSpyGuessSubmit(selectedWord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-2xl border border-rose-500/50 max-w-2xl w-full space-y-4 shadow-2xl relative">
        {!isSpy ? (
          <div className="text-center space-y-3 py-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase">
              CASUS YAKALANDI! ({accusedPlayerName})
            </h2>
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-rose-300 font-bold">
              Casus son kelime tahminini yapıyor...
            </div>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-black uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" /> SON TAHMİN HAKKI
              </div>
              <h2 className="text-xl font-black text-white uppercase">
                GİZLİ KELİMEYİ TAHMİN ET
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto p-1">
              {words.map((word, idx) => {
                const isSelected = selectedWord === word;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { soundEngine.playClick(); setSelectedWord(word); }}
                    className={`p-2.5 rounded-xl border text-center font-black text-xs transition-all h-[55px] flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-white text-zinc-950 border-white scale-105 shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-500'
                    }`}
                  >
                    <span>{word}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmGuess}
              disabled={!selectedWord}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                selectedWord
                  ? 'bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer shadow-lg'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
              }`}
            >
              <span>{selectedWord ? `"${selectedWord}" TAHMİN ET` : 'KART SEÇİN'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
