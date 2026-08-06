import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function CreateRoomScreen({ mode = 'CREATE', onCreateRoom, onJoinRoom, onBack }) {
  const defaultNickname = () => {
    const prefixes = ['Gölge', 'Dedektif', 'Şahin', 'Ajan', 'Poyraz', 'Atlas', 'Rüzgar', 'Kobra'];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${num}`;
  };

  const [nickname, setNickname] = useState(defaultNickname());
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playClick();
    if (mode === 'CREATE') {
      onCreateRoom(nickname);
    } else {
      if (!roomCodeInput.trim()) return;
      onJoinRoom(roomCodeInput.trim(), nickname);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-60px)]">
      <div className="w-full max-w-sm bg-[#101116] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* SPY Title Header */}
        <div className="w-full bg-[#16171e] border border-zinc-800 rounded-xl py-3 mb-4 shadow-sm">
          <h1 className="text-2xl font-extrabold text-white tracking-widest font-mono">
            SPY
          </h1>
        </div>

        {/* Inner ODA KUR Card */}
        <div className="w-full bg-[#14151b] border border-zinc-800 rounded-xl p-5 text-left relative shadow-inner">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2.5">
            <span className="text-xs font-extrabold text-zinc-300 tracking-widest uppercase font-mono">
              {mode === 'CREATE' ? 'ODA KUR' : 'LOBİYE KATIL'}
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onBack();
              }}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Geri</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'JOIN' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Oda Kodu
                </label>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Örn: W4W3"
                  maxLength={6}
                  required
                  className="w-full bg-[#090a0d] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono font-bold tracking-widest focus:outline-none focus:border-white transition uppercase"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Takma Adın
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Takma adınız"
                maxLength={20}
                required
                className="w-full bg-[#090a0d] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 font-medium focus:outline-none focus:border-white transition"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-white hover:bg-zinc-200 text-black font-extrabold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md active:scale-[0.99]"
            >
              <span>{mode === 'CREATE' ? 'Oda Oluştur' : 'Lobiye Katıl'}</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
