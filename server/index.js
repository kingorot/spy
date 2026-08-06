import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Categories & Word pools
const CATEGORIES = {
  "Yemekler": [
    "Mantı", "Kokoreç", "Karnıyarık", "Ayran", "Baklava",
    "Tavuk Döner", "Künefe", "İçli Köfte", "Kuzu Tandır", "Menemen",
    "Tiramisu", "Tantuni", "Falafel", "Çiğ Köfte", "Kuru Fasulye",
    "Gözleme", "Ramen", "Kumpir", "Cağ Kebabı", "Türk Kahvesi"
  ],
  "Ülkeler & Şehirler": [
    "Türkiye", "Japonya", "İtalya", "Almanya", "Fransa",
    "İngiltere", "Mısır", "Brezilya", "Kanada", "Avustralya",
    "İstanbul", "Roma", "Tokyo", "Paris", "New York",
    "Londra", "Pekin", "Barselona", "Kahire", "Amsterdam"
  ],
  "Meslekler": [
    "Doktor", "Öğretmen", "Mühendis", "Aşçı", "Pilot",
    "Polis", "İtfaiyeci", "Avukat", "Mimar", "Ressam",
    "Gazeteci", "Berber", "Çiftçi", "Garson", "Eczacı",
    "Şoför", "Dedektif", "Bilim İnsanı", "Kaptan", "Yazılımcı"
  ],
  "Hayvanlar": [
    "Aslan", "Kaplan", "Kartal", "Yunus", "Kurt",
    "Panda", "Zürafa", "Fil", "Penguen", "Kedi",
    "Köpek", "Ayı", "Papağan", "Timsah", "Baykuş",
    "Kanguru", "Zebra", "Koala", "Çita", "Bukalemun"
  ],
  "Filmler & Diziler": [
    "Harry Potter", "Yüzüklerin Efendisi", "Matrix", "Inception", "Interstellar",
    "Star Wars", "Gladiator", "Titanic", "Avatar", "Joker",
    "Breaking Bad", "Game of Thrones", "Sherlock", "Stranger Things", "Squid Game",
    "The Office", "Friends", "La Casa de Papel", "Dark", "Peaky Blinders"
  ],
  "Eşyalar": [
    "Telefon", "Bilgisayar", "Kulaklık", "Televizyon", "Buzdolabı",
    "Kahve Makinesi", "Kamera", "Saat", "Piyano", "Gitar",
    "Bisiklet", "Araba", "Ütü", "Süpürge", "Mikrodalga",
    "Lamba", "Projeksiyon", "Tablet", "Drone", "Akıllı Saat"
  ]
};

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getRandomNickname() {
  const prefixes = ['Gölge', 'Dedektif', 'Şahin', 'Ajan', 'Poyraz', 'Atlas', 'Rüzgar', 'Kobra', 'Kaplan', 'Kartal'];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${num}`;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function addRoomLog(room, text, type = 'info') {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const logItem = {
    id: Date.now() + Math.random().toString(),
    text,
    timestamp,
    type
  };
  room.logs.push(logItem);
  if (room.logs.length > 50) room.logs.shift();
  return logItem;
}

function getSanitizedRoomState(room, playerId) {
  const currentPlayer = room.players.find(p => p.id === playerId);
  const isSpy = currentPlayer?.role === 'SPY';

  return {
    code: room.code,
    hostId: room.hostId,
    category: room.category,
    gameMode: room.gameMode,
    spyCount: room.spyCount,
    turnTimeLimit: room.turnTimeLimit || 30,
    gameState: room.gameState,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isBot: p.isBot,
      isAlive: p.isAlive,
      role: (room.gameState === 'GAME_OVER' || p.id === playerId) ? p.role : undefined
    })),
    cards: room.cards,
    secretWord: (room.gameState === 'GAME_OVER' || (!isSpy && room.gameState !== 'LOBBY')) ? room.secretWord : null,
    turnOrder: room.turnOrder,
    currentTurnIndex: room.currentTurnIndex,
    currentRound: room.currentRound,
    clues: room.clues,
    votes: room.gameState === 'VOTING_PHASE' || room.gameState === 'GAME_OVER' ? room.votes : {},
    logs: room.logs,
    winner: room.winner,
    winReason: room.winReason,
    accusedPlayerId: room.accusedPlayerId || null,
  };
}

function broadcastRoomUpdate(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players.forEach(player => {
    if (!player.isBot) {
      io.to(player.id).emit('room_updated', getSanitizedRoomState(room, player.id));
    }
  });
}

function processBotTurn(room) {
  if (room.gameState !== 'CLUE_PHASE') return;
  const currentSpeakerId = room.turnOrder[room.currentTurnIndex];
  const currentSpeaker = room.players.find(p => p.id === currentSpeakerId);

  if (!currentSpeaker || !currentSpeaker.isBot) return;

  setTimeout(() => {
    if (room.gameState !== 'CLUE_PHASE') return;
    if (room.turnOrder[room.currentTurnIndex] !== currentSpeakerId) return;

    let botClue = '';
    const secret = room.secretWord;
    if (currentSpeaker.role === 'SPY') {
      const genericClues = ['güzel', 'sevilir', 'farklı', 'sıcak', 'tatlı', 'tuzlu', 'popüler', 'leziz', 'renkli'];
      botClue = genericClues[Math.floor(Math.random() * genericClues.length)];
    } else {
      const clueMap = {
        'Menemen': ['domates', 'biber', 'yumurta', 'kahvaltı'],
        'Mantı': ['yoğurt', 'sarımsak', 'kayseri', 'hamur'],
        'Kokoreç': ['ekmek', 'baharat', 'gece', 'sakatat'],
        'Karnıyarık': ['patlıcan', 'kıyma', 'fırın', 'türk'],
        'Ayran': ['yoğurt', 'tuzlu', 'soğuk', 'içecek'],
        'Baklava': ['fıstık', 'şerbet', 'çıtır', 'gaziantep'],
        'Tavuk Döner': ['dürüm', 'sos', 'döner', 'öğle'],
        'Künefe': ['peynir', 'sıcak', 'hatay', 'kadayıf'],
      };
      const cluesList = clueMap[secret] || [secret.substring(0, 3).toLowerCase(), 'lezzetli', 'tarif', 'görsel'];
      botClue = cluesList[Math.floor(Math.random() * cluesList.length)];
    }

    submitClue(room, currentSpeaker.id, botClue);
  }, 1500);
}

function submitClue(room, playerId, clueText) {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  room.clues.push({
    round: room.currentRound,
    playerId: player.id,
    playerName: player.name,
    clueText: clueText.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  addRoomLog(room, `${player.name} -> "${clueText.trim()}"`, 'clue');

  room.currentTurnIndex += 1;

  if (room.currentTurnIndex >= room.turnOrder.length) {
    addRoomLog(room, `${room.currentRound}. Tur ipuçları tamamlandı. Oylama başlıyor.`, 'phase');
    
    room.gameState = 'VOTING_PHASE';
    room.votes = {};
    broadcastRoomUpdate(room.code);

    setTimeout(() => {
      if (room.gameState === 'VOTING_PHASE') {
        processBotVotes(room);
      }
    }, 2000);
  } else {
    broadcastRoomUpdate(room.code);
    processBotTurn(room);
  }
}

function processBotVotes(room) {
  const bots = room.players.filter(p => p.isBot && p.isAlive);
  const candidates = room.players.filter(p => p.isAlive);

  bots.forEach(bot => {
    if (!room.votes[bot.id]) {
      const otherPlayers = candidates.filter(c => c.id !== bot.id);
      if (otherPlayers.length > 0) {
        const target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        room.votes[bot.id] = target.id;
      }
    }
  });

  checkVotingResults(room);
}

function checkVotingResults(room) {
  const activePlayersCount = room.players.filter(p => p.isAlive).length;
  const votesCount = Object.keys(room.votes).length;

  if (votesCount >= activePlayersCount) {
    const voteCounts = {};
    Object.values(room.votes).forEach(targetId => {
      if (targetId && targetId !== 'PASS') {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      }
    });

    let maxVotes = 0;
    let accusedId = null;
    let tie = false;

    Object.entries(voteCounts).forEach(([pid, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        accusedId = pid;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    if (!accusedId || tie || maxVotes <= Math.floor(activePlayersCount / 2)) {
      addRoomLog(room, `Çoğunluk pas geçti veya eşitlik sağlandı. Sonraki tura geçiliyor.`, 'warning');
      
      room.currentRound += 1;
      room.currentTurnIndex = 0;
      room.gameState = 'CLUE_PHASE';
      room.votes = {};
      broadcastRoomUpdate(room.code);
      processBotTurn(room);
    } else {
      const accusedPlayer = room.players.find(p => p.id === accusedId);
      room.accusedPlayerId = accusedId;
      addRoomLog(room, `Çoğunluk oyuyla ${accusedPlayer.name} casus olarak suçlandı.`, 'important');

      if (accusedPlayer.role === 'SPY') {
        room.gameState = 'SPY_GUESS_PHASE';
        addRoomLog(room, `${accusedPlayer.name} CASUS idi! Casus için son şans: Gizli kelimeyi tahmin ediyor...`, 'warning');
        broadcastRoomUpdate(room.code);

        if (accusedPlayer.isBot) {
          setTimeout(() => {
            const randomGuess = room.cards[Math.floor(Math.random() * room.cards.length)];
            handleSpyGuess(room, accusedPlayer.id, randomGuess);
          }, 3000);
        }
      } else {
        room.gameState = 'GAME_OVER';
        room.winner = 'SPY';
        room.winReason = `Siviller masum bir oyuncuyu (${accusedPlayer.name}) eledi. Casus kazandı.`;
        addRoomLog(room, `${accusedPlayer.name} bir SİVİL idi! Casus kazandı.`, 'danger');
        broadcastRoomUpdate(room.code);
      }
    }
  }
}

function handleSpyGuess(room, spyId, guessedWord) {
  const spy = room.players.find(p => p.id === spyId);
  const isCorrect = guessedWord.trim().toLowerCase() === room.secretWord.toLowerCase();

  room.gameState = 'GAME_OVER';
  if (isCorrect) {
    room.winner = 'SPY';
    room.winReason = `Casus (${spy?.name || 'Casus'}) doğru kelimeyi ("${room.secretWord}") tahmin etti ve kazandı!`;
    addRoomLog(room, `Casus "${guessedWord}" tahminini yaptı ve DOĞRU bildi! Casus kazandı.`, 'success');
  } else {
    room.winner = 'CIVILIANS';
    room.winReason = `Casus (${spy?.name || 'Casus'}) yanlış tahmin ("${guessedWord}") yaptı. Gizli kelime: "${room.secretWord}". Siviller kazandı!`;
    addRoomLog(room, `Casus "${guessedWord}" tahmininde bulundu ama YANLIŞTI! Siviller kazandı.`, 'danger');
  }
  broadcastRoomUpdate(room.code);
}

// Socket handlers
io.on('connection', (socket) => {
  socket.on('create_room', ({ nickname }) => {
    let roomCode = generateRoomCode();
    while (rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const hostName = nickname?.trim() || getRandomNickname();
    const room = {
      code: roomCode,
      hostId: socket.id,
      category: 'Yemekler',
      gameMode: 'Klasik Mod',
      spyCount: 1,
      turnTimeLimit: 30,
      gameState: 'LOBBY',
      secretWord: null,
      cards: [],
      turnOrder: [],
      currentTurnIndex: 0,
      currentRound: 1,
      clues: [],
      votes: {},
      logs: [],
      winner: null,
      winReason: null,
      players: [
        {
          id: socket.id,
          name: hostName,
          isHost: true,
          isBot: false,
          isAlive: true,
          role: null
        }
      ]
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    addRoomLog(room, `${hostName} odayı oluşturdu. (Oda: ${roomCode})`, 'info');

    socket.emit('room_joined', getSanitizedRoomState(room, socket.id));
  });

  socket.on('join_room', ({ roomCode, nickname }) => {
    const upperCode = roomCode?.trim().toUpperCase();
    const room = rooms.get(upperCode);

    if (!room) {
      return socket.emit('error_message', 'Oda bulunamadı!');
    }
    if (room.gameState !== 'LOBBY') {
      return socket.emit('error_message', 'Oyun devam ediyor, katılamazsınız!');
    }

    const name = nickname?.trim() || getRandomNickname();
    const existing = room.players.find(p => p.id === socket.id);
    if (!existing) {
      room.players.push({
        id: socket.id,
        name,
        isHost: false,
        isBot: false,
        isAlive: true,
        role: null
      });
    }

    socket.join(upperCode);
    addRoomLog(room, `${name} odaya katıldı.`, 'info');
    socket.emit('room_joined', getSanitizedRoomState(room, socket.id));
    broadcastRoomUpdate(upperCode);
  });

  socket.on('add_bot', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'LOBBY') return;
    if (room.hostId !== socket.id) return;

    const botId = 'bot_' + Math.random().toString(36).substr(2, 9);
    const botName = getRandomNickname();

    room.players.push({
      id: botId,
      name: botName,
      isHost: false,
      isBot: true,
      isAlive: true,
      role: null
    });

    addRoomLog(room, `Bot (${botName}) odaya eklendi.`, 'info');
    broadcastRoomUpdate(roomCode);
  });

  socket.on('update_room_options', ({ roomCode, category, gameMode, spyCount, turnTimeLimit }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'LOBBY') return;
    if (room.hostId !== socket.id) return;

    if (category) room.category = category;
    if (gameMode) room.gameMode = gameMode;
    if (spyCount !== undefined) room.spyCount = Math.max(1, Math.min(10, spyCount));
    if (turnTimeLimit !== undefined) room.turnTimeLimit = Math.max(5, turnTimeLimit);

    addRoomLog(room, `Oyun ayarları güncellendi. (Kategori: ${room.category}, Casus Sayısı: ${room.spyCount})`, 'info');
    broadcastRoomUpdate(roomCode);
  });

  socket.on('start_game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'LOBBY') return;
    if (room.hostId !== socket.id) return;

    if (room.players.length < 3) {
      return socket.emit('error_message', 'Oyunu başlatmak için en az 3 oyuncu gereklidir!');
    }

    const categoryPool = CATEGORIES[room.category] || CATEGORIES['Yemekler'];
    const shuffledPool = shuffleArray(categoryPool);
    const selected20 = shuffledPool.slice(0, 20);

    const secretWord = selected20[Math.floor(Math.random() * selected20.length)];

    // Fix: Allow requested spy count up to N-1 (leaving at least 1 civilian)
    const countSpies = Math.min(room.spyCount, Math.max(1, room.players.length - 1));
    const playerIndices = shuffleArray(room.players.map((_, i) => i));
    const spyIndices = new Set(playerIndices.slice(0, countSpies));

    room.players.forEach((p, idx) => {
      p.role = spyIndices.has(idx) ? 'SPY' : 'CIVILIAN';
      p.isAlive = true;
    });

    room.cards = selected20;
    room.secretWord = secretWord;
    room.gameState = 'CLUE_PHASE';
    room.currentRound = 1;
    room.clues = [];
    room.votes = {};
    room.winner = null;
    room.winReason = null;
    room.accusedPlayerId = null;

    // Fixed turn order sequence for clue giving
    room.turnOrder = shuffleArray(room.players.map(p => p.id));
    room.currentTurnIndex = 0;

    addRoomLog(room, `Oyun başladı. Kategori: ${room.category}, Casus Sayısı: ${countSpies}. Sırayla ipucu verme evresi başladı.`, 'phase');

    broadcastRoomUpdate(roomCode);
    processBotTurn(room);
  });

  socket.on('submit_clue', ({ roomCode, clueText }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'CLUE_PHASE') return;

    const currentSpeakerId = room.turnOrder[room.currentTurnIndex];
    if (currentSpeakerId !== socket.id) {
      return socket.emit('error_message', 'Henüz sizin sıranız değil!');
    }

    submitClue(room, socket.id, clueText);
  });

  socket.on('submit_vote', ({ roomCode, targetPlayerId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'VOTING_PHASE') return;

    const voter = room.players.find(p => p.id === socket.id);
    if (!voter || !voter.isAlive) return;

    room.votes[socket.id] = targetPlayerId;
    addRoomLog(room, `${voter.name} oyunu kullandı.`, 'info');

    broadcastRoomUpdate(roomCode);
    checkVotingResults(room);
  });

  socket.on('spy_guess_word', ({ roomCode, guessedWord }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== 'SPY') return;

    handleSpyGuess(room, socket.id, guessedWord);
  });

  socket.on('return_to_lobby', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    if (room.hostId !== socket.id) return;

    room.gameState = 'LOBBY';
    room.secretWord = null;
    room.cards = [];
    room.turnOrder = [];
    room.clues = [];
    room.votes = {};
    room.winner = null;
    room.winReason = null;
    room.accusedPlayerId = null;
    room.players.forEach(p => p.role = null);

    addRoomLog(room, `Oyun sıfırlandı, lobiye dönüldü.`, 'info');
    broadcastRoomUpdate(roomCode);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, code) => {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leavingPlayer = room.players[idx];
        room.players.splice(idx, 1);
        addRoomLog(room, `${leavingPlayer.name} ayrıldı.`, 'warning');

        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          if (leavingPlayer.isHost) {
            room.players[0].isHost = true;
            room.hostId = room.players[0].id;
            addRoomLog(room, `Yeni oda sahibi: ${room.players[0].name}`, 'info');
          }
          broadcastRoomUpdate(code);
        }
      }
    });
  });
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
