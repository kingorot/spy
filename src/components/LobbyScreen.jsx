import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, Play, User, ChevronDown, ChevronUp, Shield, Utensils, Dog, Globe, Briefcase, Film, Box, Trophy, Plus } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { soundEngine } from '../utils/audio';
import { networkService } from '../services/network';

const categoryIcons = {
  Utensils,
  Dog,
  Globe,
  Briefcase,
  Film,
  Box,
  Trophy
};

export const LobbyScreen = ({
  roomState,
  onHostRoom,
  onJoinRoom,
  onStartGame,
  isHost,
  myPlayerId
}) => {
  const [playerName, setPlayerName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [customWordsInput, setCustomWordsInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

  // Auto-generate default nickname if empty
  useEffect(() => {
    if (!playerName) {
      const defaultNames = ['Ajan-07', 'Gölge-34', 'Şahin-61', 'Kartal-53', 'Poyraz-67', 'Gizem-11', 'Rüzgar-88'];
      const rand = defaultNames[Math.floor(Math.random() * defaultNames.length)];
      setPlayerName(rand);
    }
  }, []);

  // Check URL query parameters for ?room=CODE auto-join fill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomInput(roomParam.toUpperCase());
    }
  }, []);

  const handleCopyLink = () => {
    soundEngine.playClick();
    const url = `${window.location.origin}/?room=${roomState.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectCategory = (catId) => {
    soundEngine.playClick();
    setIsCategoryExpanded(false);
    networkService.updateRoomSettings({ category: catId });
  };

  const handleSelectSpyCount = (count) => {
    soundEngine.playClick();
    networkService.updateRoomSettings({ spyCount: count });
  };

  const handleCustomWordsSubmit = () => {
    const words = customWordsInput
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (words.length < 20) {
      alert(`Lütfen en az 20 özel kelime girin! (Şu an: ${words.length} kelime)`);
      return;
    }

    soundEngine.playClick();
    setIsCategoryExpanded(false);
    networkService.updateRoomSettings({ category: 'custom', customWords: words });
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === roomState.category) || {
    name: roomState.category === 'custom' ? 'Özel Tema' : 'Yemekler & İçecekler',
    icon: 'Utensils'
  };

  const CurrentIconComponent = categoryIcons[currentCategoryObj.icon] || Utensils;

  // STEP 1: INITIAL JOIN / HOST FORM
  if (!roomState.roomCode) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-6">
        <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              MASAYA KATIL VEYA ODA KUR
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Ajan takma adını yazıp devam et
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-zinc-300 uppercase tracking-wider block mb-1.5">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Takma Adınız..."
                  maxLength={16}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onHostRoom(playerName || 'Ev Sahibi');
                }}
                className="py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>ODA OLUŞTUR</span>
              </button>

              <button
                onClick={() => {
                  if (!roomInput) {
                    alert('Lütfen oda kodunu girin!');
                    return;
                  }
                  soundEngine.playClick();
                  onJoinRoom(roomInput, playerName || 'Oyuncu');
                }}
                className="py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-black text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>ODAYA KATIL</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="ODA KODU (Örn: AB12)..."
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-center font-mono font-black text-sm uppercase text-zinc-300 tracking-widest focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: LOBBY SCREEN WITH EXPANDABLE CATEGORY SELECTOR & LIVE SPY COUNT
  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2">
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 space-y-6 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
              ODA KODU
            </span>
            <span className="text-3xl font-black text-white font-mono tracking-wider">
              {roomState.roomCode}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopyalandı!' : 'Davet Linki Kopyala'}</span>
          </button>
        </div>

        {/* LOBBY GAME SETTINGS (LIVE CATEGORY ACCORDION & SPY COUNT) */}
        <div className="space-y-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>OYUN AYARLARI</span>
            </span>
            {!isHost && (
              <span className="text-[11px] font-bold text-zinc-500">
                (Ayarları Ev Sahibi Değiştirebilir)
              </span>
            )}
          </div>

          {/* Spy Count Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 block">
              Casus Sayısı
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  disabled={!isHost}
                  onClick={() => handleSelectSpyCount(num)}
                  className={`py-2 px-3 rounded-xl font-black text-xs transition-all border ${
                    roomState.spyCount === num
                      ? 'bg-white text-zinc-950 border-white shadow'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {num} Casus
                </button>
              ))}
            </div>
          </div>

          {/* Expandable Category Selector (Accordion Dropdown - Image 2 style) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 block">
              Kategori Seçimi
            </label>

            {/* Accordion Bar Header */}
            <button
              onClick={() => {
                if (isHost) {
                  soundEngine.playClick();
                  setIsCategoryExpanded(!isCategoryExpanded);
                }
              }}
              disabled={!isHost}
              className={`w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-black text-white transition-all ${
                isHost ? 'hover:border-zinc-600 cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <CurrentIconComponent className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                <span className="truncate">{currentCategoryObj.name}</span>
                {isHost && (
                  <span className="text-[10px] text-zinc-500 font-normal">
                    (Değiştirmek için tıklayın...)
                  </span>
                )}
              </div>
              {isHost && (
                isCategoryExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {/* Expanded Category Choices (Image 2 style) */}
            {isCategoryExpanded && isHost && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const IconComp = categoryIcons[cat.icon] || Box;
                    const isSelected = roomState.category === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-white text-zinc-950 border-white shadow'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate text-[11px]">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Words Category Input */}
                <div className="border-t border-zinc-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                    <span>Veya Kendi Kelime Temanızı Oluşturun (En az 20 kelime)</span>
                  </div>
                  <textarea
                    rows={2}
                    value={customWordsInput}
                    onChange={(e) => setCustomWordsInput(e.target.value)}
                    placeholder="Elma, Armut, Kiraz, Muz, Çilek, Karpuz, Kavun..."
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    onClick={handleCustomWordsSubmit}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-black text-white flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Özel Temayı Uygula</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-black uppercase text-zinc-300 tracking-wider">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-400" /> OYUNCULAR
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
              {roomState.players.length} Oyuncu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
            {roomState.players.map((p) => {
              const isMe = p.id === myPlayerId;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    isMe
                      ? 'bg-zinc-900 border-zinc-700 text-white'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <User className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{p.name} {isMe ? '(Siz)' : ''}</span>
                  </div>

                  {p.isHost && (
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-black text-zinc-300 border border-zinc-700">
                      EV SAHİBİ
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-2">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={roomState.players.length < 3}
              className={`w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                roomState.players.length >= 3
                  ? 'bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer scale-100 hover:scale-[1.01]'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {roomState.players.length >= 3
                  ? 'OYUNU BAŞLAT'
                  : `OYUNU BAŞLAT (En Az 3 Oyuncu Gerekli - Şu an: ${roomState.players.length})`}
              </span>
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xs font-bold text-zinc-400">
              Ev sahibinin oyunu başlatması bekleniyor...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
