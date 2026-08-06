import React from 'react';
import { Eye, Volume2, VolumeX, HelpCircle, LogOut } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Header({ roomCode, onLeaveRoom, onOpenRules, isMuted, setIsMuted }) {
  const toggleAudio = () => {
    const nextState = sounds.toggleMute();
    setIsMuted(nextState);
    if (!nextState) sounds.playClick();
  };

  return (
    <header className="w-full bg-[#0a0b0e]/95 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shadow-sm">
          <Eye className="w-4 h-4 text-white stroke-[2.2]" />
        </div>
        <span className="font-extrabold tracking-widest text-lg text-white font-mono">
          SPY
        </span>
      </div>

      {/* Center Room Code Pill */}
      {roomCode && (
        <div className="flex items-center gap-2 bg-[#121318] border border-zinc-700/80 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide text-zinc-200 shadow-inner font-mono">
          <span className="text-zinc-500 text-xs uppercase">ODA:</span>
          <span className="text-white font-extrabold">{roomCode}</span>
        </div>
      )}

      {/* Right control buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleAudio}
          title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          className="p-2 rounded-lg bg-[#14151b] border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenRules();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14151b] border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs md:text-sm font-medium transition"
        >
          <HelpCircle className="w-4 h-4 text-zinc-400" />
          <span>Kurallar</span>
        </button>

        {roomCode && (
          <button
            onClick={() => {
              sounds.playClick();
              onLeaveRoom();
            }}
            title="Odadan Ayrıl"
            className="p-2 rounded-lg bg-[#14151b] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
