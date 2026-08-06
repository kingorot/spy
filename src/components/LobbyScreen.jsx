import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users, Copy, Check, Play, PlusCircle, Crown, ArrowRight,
  ChevronDown, ChevronUp, Utensils, Dog, Globe, Briefcase, Film, Box, Trophy
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { soundEngine } from '../utils/audio';

const ICON_MAP = { Utensils, Dog, Globe, Briefcase, Film, Box, Trophy };

const GAME_MODES = [
  { id: 'classic', name: 'Klasik Mod', desc: 'Siviller kelimeyi bilir, casus kelimeyi tahmin etmeye çalışır.' },
  { id: 'timed', name: 'Zamana Karşı', desc: 'Her tur için 30 saniye süre sınırı.' },
  { id: 'double', name: 'Çift Casus', desc: 'Oyun alanında 2 casus birbirini tanımadan yarışır.' }
];

const getRandomDefaultNickname = () => {
  const names = ['Ajan', 'Gölge', 'Dedektif', 'Gizem', 'Rüzgar', 'Şahin', 'Poyraz', 'Kartal'];
  const name = names[Math.floor(Math.random() * names.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${name}-${num}`;
};

export const LobbyScreen = ({
  roomState,
  onHostRoom,
  onJoinRoom,
  onStartGame,
  onUpdateSettings,
  isHost,
  myPlayerId
}) => {
  const [mode, setMode] = useState('MAIN');
  const [nickname, setNickname] = useState(getRandomDefaultNickname());
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isGameModeDropdownOpen, setIsGameModeDropdownOpen] = useState(false);
  const [customWordsText, setCustomWordsText] = useState('');

  // Auto-detect room parameter from URL share link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomCodeInput(roomParam.toUpperCase());
      setMode('JOIN');
    }
  }, []);

  const handleCopyLink = () => {
    soundEngine.playClick();
    const url = `${window.location.origin}?room=${roomState.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    soundEngine.playClick();
    onHostRoom(nickname.trim(), 'food', 1, []);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !roomCodeInput.trim()) return;
    soundEngine.playClick();
    onJoinRoom(roomCodeInput.trim().toUpperCase(), nickname.trim());
  };

  const handleCategorySelect = (catId) => {
    soundEngine.playClick();
    if (catId === 'custom') {
      const words = customWordsText
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0);
      if (words.length < 20) {
        alert('Özel kategori için en az 20 kelime girmelisiniz!');
        return;
      }
      onUpdateSettings({ category: 'custom', customWords: words });
    } else {
      onUpdateSettings({ category: catId, customWords: [] });
    }
    setIsCategoryDropdownOpen(false);
  };

  const handleGameModeSelect = (modeId) => {
    soundEngine.playClick();
    onUpdateSettings({ gameMode: modeId });
    setIsGameModeDropdownOpen(false);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === roomState.category) || {
    id: 'food',
    name: roomState.category === 'custom' ? 'Özel Tema' : 'Yemekler & İçecekler',
    icon: 'Utensils'
  };
  const CurrentCatIcon = ICON_MAP[currentCategoryObj.icon] || Box;

  if (roomState.roomCode) {
    const roomUrl = `${window.location.origin}?room=${roomState.roomCode}`;
    const spyCount = roomState.spyCount || 1;
    const currentModeObj = GAME_MODES.find(m => m.id === roomState.gameMode) || GAME_MODES[0];

    return (
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Room Header */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 text-center space-y-4 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white">
            ODA: <span className="font-mono text-zinc-100">{roomState.roomCode}</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopyalandı!" : "Davet Linkini Kopyala"}
            </button>
          </div>

          <div className="inline-block bg-white p-2.5 rounded-xl shadow-lg border border-zinc-800">
            <QRCodeSVG value={roomUrl} size={95} />
          </div>
        </div>

        {/* Room Settings */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
            OYUN AYARLARI
          </h3>

          {/* Collapsible Category Selection Dropdown Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300">Kategori</label>

            {isHost ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                    setIsGameModeDropdownOpen(false);
                  }}
                  className="w-full p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 flex items-center justify-between transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CurrentCatIcon className="w-4 h-4 text-white flex-shrink-0" />
                    <span className="font-black text-sm text-white truncate">
                      {currentCategoryObj.name}
                    </span>
                  </div>
                  {isCategoryDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {/* Expanded Category Options */}
                {isCategoryDropdownOpen && (
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES.map((cat) => {
                        const IconComponent = ICON_MAP[cat.icon] || Box;
                        const isSelected = roomState.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-white text-zinc-950 border-white font-black shadow-md'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{cat.name}</span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => handleCategorySelect('custom')}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all ${
                          roomState.category === 'custom'
                            ? 'bg-white text-zinc-950 border-white font-black shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Özel Tema Ekle</span>
                      </button>
                    </div>

                    {roomState.category === 'custom' && (
                      <div className="space-y-2 pt-2 border-t border-zinc-900">
                        <label className="block text-xs font-bold text-zinc-400">
                          Özel Kelimeler (Min 20 kelime, virgülle ayırın)
                        </label>
                        <textarea
                          value={customWordsText}
                          onChange={(e) => setCustomWordsText(e.target.value)}
                          placeholder="Elma, Armut, Muz, Çilek, Kiraz, Şeftali, Karpuz..."
                          className="w-full h-20 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleCategorySelect('custom')}
                          className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-black text-xs shadow-md"
                        >
                          Özel Kelimeleri Kaydet
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-xs font-bold text-zinc-200">
                <CurrentCatIcon className="w-4 h-4 text-zinc-400" />
                <span>{currentCategoryObj.name}</span>
              </div>
            )}
          </div>

          {/* Collapsible Game Mode Selection Dropdown Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-300">Oyun Modu</label>

            {isHost ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGameModeDropdownOpen(!isGameModeDropdownOpen);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="w-full p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 flex items-center justify-between transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-black text-sm text-white truncate">
                      {currentModeObj.name}
                    </span>
                  </div>
                  {isGameModeDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {/* Expanded Game Mode Options */}
                {isGameModeDropdownOpen && (
                  <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    {GAME_MODES.map((m) => {
                      const isSelected = (roomState.gameMode || 'classic') === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleGameModeSelect(m.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white text-zinc-950 border-white font-black shadow-md'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-black text-xs">{m.name}</div>
                          <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-zinc-700 font-semibold' : 'text-zinc-500'}`}>
                            {m.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-black text-white">
                {currentModeObj.name}
              </div>
            )}
          </div>

          {/* Casus Sayısı Input */}
          <div className="space-y-1.5 pt-1 border-t border-zinc-850">
            <label className="block text-xs font-bold text-zinc-300">
              Casus Sayısı
            </label>

            {isHost ? (
              <input
                type="number"
                min={1}
                max={Math.max(1, roomState.players.length - 1)}
                value={spyCount}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                  onUpdateSettings({ spyCount: val });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-black text-sm focus:outline-none focus:border-zinc-500 shadow-md"
              />
            ) : (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-black text-white">
                {spyCount} Casus
              </div>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>Oyuncular ({roomState.players.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {roomState.players.map((p) => {
              const isMe = p.id === myPlayerId;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    isMe
                      ? 'bg-zinc-900 border-zinc-600 text-white'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-200">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold truncate">
                      {p.name} {p.isHost && <Crown className="w-3 h-3 text-amber-400 inline" />}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Game */}
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={roomState.players.length < 3}
              className={`w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all ${
                roomState.players.length >= 3
                  ? 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-lg cursor-pointer'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{roomState.players.length >= 3 ? 'OYUNU BAŞLAT' : 'EN AZ 3 OYUNCU GEREKLİ'}</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400 font-semibold">
              Ev sahibinin oyunu başlatması bekleniyor...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      <div className="glass-panel p-8 rounded-3xl border border-zinc-800 text-center space-y-6 shadow-2xl">
        <h2 className="text-4xl font-black tracking-widest text-white uppercase">SPY</h2>

        {mode === 'MAIN' && (
          <div className="space-y-3">
            <button
              onClick={() => { soundEngine.playClick(); setMode('CREATE'); }}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Oda Oluştur</span>
            </button>

            <button
              onClick={() => { soundEngine.playClick(); setMode('JOIN'); }}
              className="w-full py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-zinc-400" />
              <span>Lobiye Katıl</span>
            </button>
          </div>
        )}
      </div>

      {mode === 'CREATE' && (
        <form onSubmit={handleCreateSubmit} className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-bold text-sm uppercase text-zinc-200">Oda Kur</h3>
            <button type="button" onClick={() => setMode('MAIN')} className="text-xs text-zinc-400">Geri</button>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Takma Adın</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold focus:outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Oda Oluştur</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {mode === 'JOIN' && (
        <form onSubmit={handleJoinSubmit} className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="font-bold text-sm uppercase text-zinc-200">Lobiye Katıl</h3>
            <button type="button" onClick={() => setMode('MAIN')} className="text-xs text-zinc-400">Geri</button>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Takma Adın</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nickname"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Oda Kodu</label>
            <input
              type="text"
              required
              maxLength={4}
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="AB12"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-center font-black tracking-widest text-xl focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Katıl</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
