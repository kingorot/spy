import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const RulesModal = ({ onClose }) => {
  const handleClose = () => {
    soundEngine.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 max-w-lg w-full space-y-4 shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-zinc-300" />
          </div>
          <h3 className="text-lg font-black text-white uppercase">SPY Kuralları</h3>
        </div>

        <div className="space-y-2.5 text-xs text-zinc-300 font-medium">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="font-extrabold text-white block mb-0.5">1. Rol Dağıtımı</span>
            Siviller seçilen gizli kelimeyi bilir, Casus ise kelimeyi bilmez!
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="font-extrabold text-white block mb-0.5">2. İpucu & Oylama</span>
            Sırayla tek kelimelik ipuçları verilir. Ardından şüpheli kişi oylanır veya Pas Geçilir.
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className="font-extrabold text-white block mb-0.5">3. Kazanma Koşulları</span>
            - Yanlış kişi (Sivil) elenirse ➔ **Casus Kazanır!**<br />
            - Casus yakalanır veya gönüllü tahmin yapıp kelimeyi bilirse ➔ **Casus Kazanır!**<br />
            - Casus kelimeyi bilemezse ➔ **Siviller Kazanır!**
          </div>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs"
        >
          KAPAT
        </button>
      </div>
    </div>
  );
};
