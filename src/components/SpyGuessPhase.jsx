import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function SpyGuessPhase({ roomState, myPlayerId, onSpyGuess }) {
  const [selectedWord, setSelectedWord] = useState('');

  if (!roomState) return null;

  const accusedPlayer = roomState.players.find(p => p.id === roomState.accusedPlayerId);
  const isAccusedSpy = roomState.accusedPlayerId === myPlayerId;

  const handleSubmit = (word) => {
    sounds.playClick();
    onSpyGuess(word);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-[#101116] border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-3">
          <Target className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-widest font-mono mb-1">
          CASUS YAKALANDI
        </h2>
        <p className="text-xs text-zinc-300 font-semibold mb-4">
          {accusedPlayer?.name || 'Casus'} casus olarak suçlandı. Casus için son şans.
        </p>

        {isAccusedSpy ? (
          <div className="w-full">
            <p className="text-sm text-zinc-200 mb-4 font-bold">
              Sen Casussun. Aşağıdaki 20 karttan hangisinin GİZLİ KELİME olduğunu doğru tahmin edersen KAZANIRSIN:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-2 bg-[#090a0d] rounded-xl border border-zinc-800">
              {roomState.cards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(card)}
                  className="bg-[#171822] hover:bg-white hover:text-black text-zinc-200 border border-zinc-700 font-bold py-2.5 px-2 rounded-xl text-xs transition shadow-sm active:scale-95"
                >
                  {card}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full bg-[#161720] border border-zinc-800 rounded-xl p-6 text-zinc-300 font-medium text-sm">
            <p className="font-bold text-white mb-2">
              {accusedPlayer?.name} son tahminini yapıyor...
            </p>
            <p className="text-xs text-zinc-400">
              Gizli kelimeyi doğru tahmin ederse Casus kazanır, yanlış tahmin ederse Siviller kazanır.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
