import React from 'react';
import { HelpCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
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
        className="w-full max-w-lg bg-[#101116] border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto cursor-default"
      >
        <div className="flex items-center gap-2.5 mb-5 border-b border-zinc-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-widest font-mono">
            NASIL OYNANIR?
          </h2>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-zinc-300">
          <div className="flex gap-3 bg-[#15161e] p-3.5 rounded-xl border border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono">
              1
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">20 Kart ve Temalar</h3>
              <p className="text-zinc-400 leading-relaxed">
                Her tur başında seçilen kategoriye ait 20 kelimelik bir kart ızgarası açılır (örn: Yemekler).
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-[#15161e] p-3.5 rounded-xl border border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono">
              2
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Sivil ve Casus Rolleri</h3>
              <p className="text-zinc-400 leading-relaxed">
                <strong>Siviller:</strong> 20 karttan hangisinin seçildiğini görür (vurgulanan kart).<br/>
                <strong>Casus:</strong> Seçilen kelimeyi bilmez, sadece 20 kartı görür. Kör Casuslar modunda casuslar birbirini bilmez.
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-[#15161e] p-3.5 rounded-xl border border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono">
              3
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">İpucu Verme Sırası</h3>
              <p className="text-zinc-400 leading-relaxed">
                Rastgele oluşturulmuş sabit bir sıraya göre herkes ipucu verir. Casus belli etmemek için kelimeyi tahmin etmeye çalışarak mantıklı bir ipucu verir.
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-[#15161e] p-3.5 rounded-xl border border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono">
              4
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Oylama ve Tahmin</h3>
              <p className="text-zinc-400 leading-relaxed">
                Oylamada oyuncuların oyları canlı gösterilir. Ayrıca Casus sağ alttaki "Kelime Tahmin Et" butonu ile istediği an kelimeyi tahmin edebilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
