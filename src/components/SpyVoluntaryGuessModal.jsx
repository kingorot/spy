import React, { useState } from 'react';
import { X } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const SpyVoluntaryGuessModal = ({
  words,
  onClose,
  onSubmitGuess
}) => {
  const [selectedWord, setSelectedWord] = useState(null);

  const handleConfirm = () => {
    if (!selectedWord) return;
    soundEngine.playClick();
    onSubmitGuess(selectedWord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 max-w-xl w-full space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
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

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs"
          >
            Vazgeç
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedWord}
            className={`flex-1 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
              selectedWord
                ? 'bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer shadow-lg'
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <span>TAHMİN ET</span>
          </button>
        </div>
      </div>
    </div>
  );
};
