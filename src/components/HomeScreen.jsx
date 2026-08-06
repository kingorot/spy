import React from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function HomeScreen({ onCreateRoomClick, onJoinRoomClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-60px)]">
      <div className="w-full max-w-sm bg-[#101116] border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-widest font-mono">
            SPY
          </h1>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3.5">
          <button
            onClick={() => {
              sounds.playClick();
              onCreateRoomClick();
            }}
            className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2.5 text-base shadow-lg active:scale-[0.99]"
          >
            <PlusCircle className="w-5 h-5 text-black stroke-[2.5]" />
            <span>Oda Oluştur</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onJoinRoomClick();
            }}
            className="w-full bg-[#181920] hover:bg-[#22242e] text-zinc-200 border border-zinc-700/80 font-extrabold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2.5 text-base shadow-md active:scale-[0.99]"
          >
            <Users className="w-5 h-5 text-zinc-300 stroke-[2.2]" />
            <span>Lobiye Katıl</span>
          </button>
        </div>
      </div>
    </div>
  );
}
