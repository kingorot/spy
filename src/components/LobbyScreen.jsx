import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Users, Crown, Play, UserPlus, ChevronDown, ChevronUp, History } from 'lucide-react';
import { GAME_CATEGORIES, GAME_MODES } from '../data/categories';
import { sounds } from '../utils/audio';

export default function LobbyScreen({ roomState, myPlayerId, onUpdateOptions, onStartGame, onAddBot }) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  if (!roomState) return null;

  const isHost = roomState.hostId === myPlayerId;
  const inviteUrl = `${window.location.origin}?room=${roomState.code}`;

  const copyInviteLink = () => {
    sounds.playClick();
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCategoryChange = (e) => {
    sounds.playClick();
    onUpdateOptions({ category: e.target.value });
  };

  const handleModeChange = (e) => {
    sounds.playClick();
    onUpdateOptions({ gameMode: e.target.value });
  };

  const handleSpyCountChange = (e) => {
    sounds.playClick();
    const val = parseInt(e.target.value) || 1;
    onUpdateOptions({ spyCount: val });
  };

  const handleTimeLimitChange = (e) => {
    sounds.playClick();
    const val = parseInt(e.target.value) || 30;
    onUpdateOptions({ turnTimeLimit: val });
  };

  const playerCount = roomState.players.length;
  const canStart = playerCount >= 3;
  const isFastMode = roomState.gameMode === 'Hızlı Mod (Zaman Sınırlı)';

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-6 pb-24 max-w-xl mx-auto w-full gap-5">
      {/* 1. Header Card with QR & Code */}
      <div className="w-full bg-[#101116] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest font-mono mb-3">
          ODA: {roomState.code}
        </h1>

        <button
          onClick={copyInviteLink}
          className="mb-5 flex items-center gap-2 bg-[#181921] hover:bg-[#22242e] text-zinc-200 border border-zinc-700/80 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition active:scale-95 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-zinc-400" />}
          <span>{copied ? 'Link Kopyalandı' : 'Davet Linkini Kopyala'}</span>
        </button>

        {/* QR Code display */}
        <div className="p-3 bg-white rounded-xl shadow-lg border border-zinc-300">
          <QRCodeSVG value={inviteUrl} size={130} level="M" />
        </div>
      </div>

      {/* 2. OYUN AYARLARI Card */}
      <div className="w-full bg-[#101116] border border-zinc-800 rounded-2xl p-5 shadow-xl text-left">
        <h2 className="text-xs font-extrabold text-zinc-400 tracking-widest uppercase font-mono mb-4 border-b border-zinc-800 pb-2">
          OYUN AYARLARI
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Kategori
            </label>
            <select
              value={roomState.category}
              onChange={handleCategoryChange}
              disabled={!isHost}
              className="w-full bg-[#171820] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-semibold focus:outline-none focus:border-white transition disabled:opacity-60 cursor-pointer"
            >
              {Object.keys(GAME_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Oyun Modu
            </label>
            <select
              value={roomState.gameMode}
              onChange={handleModeChange}
              disabled={!isHost}
              className="w-full bg-[#171820] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-semibold focus:outline-none focus:border-white transition disabled:opacity-60 cursor-pointer"
            >
              {GAME_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Time limit text input for Hızlı Mod as requested */}
          {isFastMode && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Tur Süresi (Saniye)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                value={roomState.turnTimeLimit || 30}
                onChange={handleTimeLimitChange}
                disabled={!isHost}
                placeholder="Örn: 30"
                className="w-full bg-[#171820] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-bold focus:outline-none focus:border-white transition disabled:opacity-60 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Casus Sayısı
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={roomState.spyCount}
              onChange={handleSpyCountChange}
              disabled={!isHost}
              className="w-full bg-[#171820] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 font-bold focus:outline-none focus:border-white transition disabled:opacity-60 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3. Oyuncular Card */}
      <div className="w-full bg-[#101116] border border-zinc-800 rounded-2xl p-5 shadow-xl text-left">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <h2 className="text-xs font-extrabold text-zinc-300 tracking-widest uppercase font-mono">
              Oyuncular ({playerCount})
            </h2>
          </div>
          {isHost && (
            <button
              onClick={() => {
                sounds.playClick();
                onAddBot();
              }}
              className="flex items-center gap-1 bg-[#181a24] hover:bg-[#232533] text-zinc-200 border border-zinc-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Bot Ekle</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roomState.players.map((p) => {
            const initial = p.name.charAt(0).toUpperCase();
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-[#16171f] border border-zinc-800 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-200 shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-extrabold text-white uppercase font-mono">
                  {initial}
                </div>
                <span className="truncate flex-1">{p.name}</span>
                {p.isHost && (
                  <Crown className="w-4 h-4 text-white shrink-0" title="Oda Sahibi" />
                )}
                {p.isBot && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-mono">
                    BOT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Main Action Start Button */}
      <div className="w-full">
        {canStart ? (
          isHost ? (
            <button
              onClick={() => {
                sounds.playClick();
                onStartGame();
              }}
              className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-xl active:scale-[0.99]"
            >
              <Play className="w-5 h-5 text-black fill-black" />
              <span>OYUNU BAŞLAT</span>
            </button>
          ) : (
            <div className="w-full bg-[#14151c] text-zinc-400 border border-zinc-800 font-semibold py-3.5 px-6 rounded-xl text-center text-sm shadow-inner">
              Oda sahibinin oyunu başlatması bekleniyor...
            </div>
          )
        ) : (
          <button
            disabled
            className="w-full bg-[#13141a] text-zinc-500 border border-zinc-800/80 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm cursor-not-allowed opacity-80"
          >
            <span>▶ EN AZ 3 OYUNCU GEREKLİ</span>
          </button>
        )}
      </div>

      {/* Floating Bottom Left GEÇMİŞ Log Panel */}
      <div className="fixed bottom-4 left-4 z-30 max-w-xs w-full">
        <div className="bg-[#0e0f14]/95 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-200">
          <div
            onClick={() => setShowHistory(!showHistory)}
            className="px-3.5 py-2 bg-[#15161d] border-b border-zinc-800 flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 font-mono">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>GEÇMİŞ ({roomState.logs.length})</span>
            </div>
            {showHistory ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />}
          </div>

          {showHistory && (
            <div className="p-3 max-h-36 overflow-y-auto space-y-1.5 text-xs font-mono">
              {roomState.logs.length === 0 ? (
                <p className="text-zinc-500 italic">Henüz geçmiş kaydı yok.</p>
              ) : (
                roomState.logs.slice(-10).map((log) => (
                  <div key={log.id} className="text-zinc-300 flex items-start gap-1.5">
                    <span className="text-zinc-600 text-[10px] shrink-0 mt-0.5">{log.timestamp}</span>
                    <span className="break-words">{log.text}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
