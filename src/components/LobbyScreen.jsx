import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Copy, Check, Play, ShieldAlert, PlusCircle, Crown, ArrowRight, Utensils, Dog, Globe, Briefcase, Film, Box, Trophy } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { soundEngine } from '../utils/audio';

const ICON_MAP = { Utensils, Dog, Globe, Briefcase, Film, Box, Trophy };

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
  isHost,
  myPlayerId
}) => {
  const [mode, setMode] = useState('MAIN');
  const [nickname, setNickname] = useState(getRandomDefaultNickname());
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [spyCount, setSpyCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [customWordsText, setCustomWordsText] = useState('');

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

    let customWords = [];
    if (selectedCategory === 'custom') {
      customWords = customWordsText
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0);
      if (customWords.length < 20) {
        alert('En az 20 kelime girin!');
        return;
      }
    }

    onHostRoom(nickname.trim(), selectedCategory, spyCount, customWords);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim() || !roomCodeInput.trim()) return;
    soundEngine.playClick();
    onJoinRoom(roomCodeInput.trim().toUpperCase(), nickname.trim());
  };

  if (roomState.roomCode) {
    const roomUrl = `${window.location.origin}?room=${roomState.roomCode}`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Room Header */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white">
            ODA: <span className="font-mono text-zinc-100">{roomState.roomCode}</span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Kopyalandı!" : "Davet Linkini Kopyala"}
            </button>
          </div>

          <div className="inline-block bg-white p-2.5 rounded-xl shadow-lg border border-zinc-800">
            <QRCodeSVG value={roomUrl} size={95} />
          </div>
        </div>

        {/* Players List */}
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 space-y-3">
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
      <div className="glass-panel p-8 rounded-3xl border border-zinc-800 text-center space-y-6">
        <h2 className="text-4xl font-black tracking-widest text-white uppercase">SPY</h2>

        {mode === 'MAIN' && (
          <div className="space-y-3">
            <button
              onClick={() => { soundEngine.playClick(); setMode('CREATE'); }}
              className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Oda Oluştur</span>
            </button>

            <button
              onClick={() => { soundEngine.playClick(); setMode('JOIN'); }}
              className="w-full py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 font-black text-base flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5 text-zinc-400" />
              <span>Lobiye Katıl</span>
            </button>
          </div>
        )}
      </div>

      {mode === 'CREATE' && (
        <form onSubmit={handleCreateSubmit} className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
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

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Kategori</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const IconComponent = ICON_MAP[cat.icon] || Box;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 border-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}

              {/* CUSTOM CATEGORY SELECTION */}
              <button
                type="button"
                onClick={() => setSelectedCategory('custom')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all ${
                  selectedCategory === 'custom'
                    ? 'bg-zinc-100 text-zinc-950 border-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="truncate">Özel Tema Ekle</span>
              </button>
            </div>
          </div>

          {/* CUSTOM WORDS TEXT AREA */}
          {selectedCategory === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">
                Özel Kelimeler (Min. 20 kelime, virgülle ayırın)
              </label>
              <textarea
                value={customWordsText}
                onChange={(e) => setCustomWordsText(e.target.value)}
                placeholder="Elma, Armut, Muz, Çilek, Kiraz, Şeftali, Karpuz..."
                className="w-full h-20 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Odayı Kur</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {mode === 'JOIN' && (
        <form onSubmit={handleJoinSubmit} className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
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
            className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Katıl</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
