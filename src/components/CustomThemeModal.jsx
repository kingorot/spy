import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const CustomThemeModal = ({
  initialWords = [],
  onClose,
  onSaveCustomTheme
}) => {
  const [text, setText] = useState(initialWords.join(', '));

  const wordsArray = text
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0);

  const handleSave = (e) => {
    e.preventDefault();
    if (wordsArray.length < 20) {
      alert(`En az 20 kelime girin! (Şu an: ${wordsArray.length} kelime)`);
      return;
    }
    soundEngine.playClick();
    onSaveCustomTheme(wordsArray);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel p-6 rounded-3xl border border-zinc-800 max-w-lg w-full space-y-4 shadow-2xl relative"
      >
        <button
          onClick={() => { soundEngine.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>ÖZEL TEMA EKLE</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium pt-1">
            Kelimelerinizi aralarına virgül koyarak yazın.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
              <span>Kelimeler</span>
              <span className={wordsArray.length >= 20 ? 'text-emerald-400' : 'text-rose-400'}>
                {wordsArray.length} / 20 Kelime
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Elma, Armut, Muz, Çilek, Kiraz, Şeftali, Karpuz, Baklava, Kebap, Mantı, Lahmacun, Pizza, Suşi, Tantuni, Kokoreç, Börek, Künefe, Sütlaç, Pide, Sarma"
              className="w-full p-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold focus:outline-none focus:border-zinc-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { soundEngine.playClick(); onClose(); }}
              className="flex-1 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
            >
              İptal
            </button>

            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs shadow-lg cursor-pointer transition-all"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
