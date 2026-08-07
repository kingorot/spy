import React from 'react';
import { HelpCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    sounds.playClick();
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={handleContentClick}
        className="w-full max-w-lg bg-[#101116] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto cursor-default font-mono"
      >
        <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-widest">
            KURALLAR
          </h2>
        </div>

        <div className="space-y-5 text-xs md:text-sm text-zinc-300 text-left leading-relaxed">
          <div className="bg-[#15161e] p-4 rounded-xl border border-zinc-800">
            <h3 className="font-extrabold text-white text-sm mb-1.5">
              1. Rol Dağıtımı
            </h3>
            <p className="text-zinc-400">
              Siviller seçilen gizli kelimeyi bilir, Casus ise kelimeyi bilmez.
            </p>
          </div>

          <div className="bg-[#15161e] p-4 rounded-xl border border-zinc-800">
            <h3 className="font-extrabold text-white text-sm mb-1.5">
              2. İpucu & Oylama
            </h3>
            <p className="text-zinc-400">
              Sırayla tek kelimelik ipuçları verilir. Ardından şüpheli kişi oylanır veya Pas Geçilir.
            </p>
          </div>

          <div className="bg-[#15161e] p-4 rounded-xl border border-zinc-800">
            <h3 className="font-extrabold text-white text-sm mb-2">
              3. Kazanma Koşulları
            </h3>
            <ul className="space-y-2 text-zinc-300">
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-bold">-</span>
                <span>Yanlış kişi elenirse ➔ <strong className="text-white">Casus Kazanır.</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-bold">-</span>
                <span>Casus yakalanıp veya gönüllü tahmin yapıp kelimeyi bilirse ➔ <strong className="text-white">Casus Kazanır.</strong></span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-zinc-500 font-bold">-</span>
                <span>Casus kelimeyi bilemezse ➔ <strong className="text-white">Siviller Kazanır.</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
