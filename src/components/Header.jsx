import React from 'react';
import { Eye, Volume2, VolumeX, HelpCircle, LogOut } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const Header = ({ roomCode, onOpenRules, onLeaveRoom, isMuted, setIsMuted }) => {
  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
            <Eye className="w-4 h-4 text-zinc-100" />
          </div>
          <h1 className="font-black text-xl tracking-widest text-white uppercase">
            SPY
          </h1>
        </div>

        {/* Room Code Badge */}
        {roomCode && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">ODA:</span>
            <span className="text-sm font-black tracking-widest text-zinc-100 font-mono">{roomCode}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-all"
            title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-zinc-300" />}
          </button>

          <button
            onClick={onOpenRules}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Kurallar</span>
          </button>

          {roomCode && (
            <button
              onClick={onLeaveRoom}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 text-zinc-400 hover:text-rose-300 transition-all"
              title="Çıkış"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
