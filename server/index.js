import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { CATEGORIES, getRandomWordsFromCategory } from '../src/data/categories.js';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Robust Fisher-Yates Shuffle for 100% unbiased randomness
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Active rooms in memory: roomCode -> roomState
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function addLogMessage(room, text) {
  const entry = {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    senderName: 'Sistem',
    text
  };
  room.clueLogs.push(entry);
}

function broadcastState(roomCode) {
  const code = (roomCode || '').toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) return;
  console.log(`📢 Broadcasting state for room [${code}], Phase: ${room.phase}, Category: ${room.category}, Mode: ${room.gameMode}`);
  io.to(code).emit('STATE_UPDATE', room);
}

function findRoomBySocket(socket, roomCode) {
  const code = (roomCode || '').toUpperCase().trim();
  if (code && rooms.has(code)) {
    const room = rooms.get(code);
    socket.join(code);
    return room;
  }

  // Fallback: search for room containing socket.id
  for (const [c, room] of rooms.entries()) {
    if (room.players.some(p => p.id === socket.id)) {
      socket.join(c);
      return room;
    }
  }

  return null;
}

function handleClueSubmit(roomCode, senderId, clueText) {
  const code = (roomCode || '').toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) return;

  const player = room.players.find(p => p.id === senderId);
  if (player) {
    const clueEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: player.name,
      senderId: player.id,
      text: clueText || 'İpucunu verdi'
    };
    room.clueLogs.push(clueEntry);

    if (room.currentTurnIndex < room.turnOrder.length - 1) {
      room.currentTurnIndex += 1;
      broadcastState(code);
    } else {
      room.phase = 'VOTING_PHASE';
      addLogMessage(room, `${room.roundNumber}. Tur Tamamlandı. Oylama başladı.`);
      broadcastState(code);
    }
  }
}

function handleCastVote(roomCode, voterId, targetId) {
  const code = (roomCode || '').toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) return;

  const voter = room.players.find(p => p.id === voterId);
  let targetName = 'PAS GEÇTİ';

  if (targetId !== 'PAS') {
    const target = room.players.find(p => p.id === targetId);
    if (target) targetName = target.name;
  }

  room.votes[voterId] = targetId;

  const voteEntry = {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    voterName: voter ? voter.name : 'Oyuncu',
    voterId,
    targetName,
    targetId
  };

  const exists = room.voteLogs.some(v => v.voterId === voterId);
  if (!exists) {
    room.voteLogs.push(voteEntry);
  }

  if (Object.keys(room.votes).length >= room.players.length) {
    evaluateVotes(code);
  } else {
    broadcastState(code);
  }
}

function evaluateVotes(roomCode) {
  const code = (roomCode || '').toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) return;

  const voteCounts = {};
  Object.values(room.votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  let maxVotes = 0;
  let accusedId = null;
  let isTie = false;

  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      accusedId = id;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  });

  // PAS or TIE -> NEXT ROUND
  if (accusedId === 'PAS' || isTie || !accusedId) {
    room.roundNumber += 1;
    addLogMessage(room, `Çoğunluk Pas Geçti veya eşitlik sağlandı. Kimse elenmedi. ${room.roundNumber}. Tur başlıyor...`);

    room.currentTurnIndex = 0;
    room.votes = {};
    room.voteLogs = [];
    room.phase = 'CLUE_PHASE';

    broadcastState(code);
    return;
  }

  const accusedPlayer = room.players.find(p => p.id === accusedId);
  room.accusedPlayerId = accusedId;
  const isSpy = room.spies.includes(accusedId);

  if (isSpy) {
    addLogMessage(room, `${accusedPlayer ? accusedPlayer.name : 'Oyuncu'} CASUS OLARAK YAKALANDI. Son tahmin hakkı açılıyor...`);
    room.phase = 'SPY_GUESS';
  } else {
    addLogMessage(room, `${accusedPlayer ? accusedPlayer.name : 'Oyuncu'} masum bir SİVİL idi. Yanlış kişi elendi, Casus kazandı.`);
    room.winner = 'SPIES';
    room.phase = 'GAME_OVER';
  }

  broadcastState(code);
}

function handleSpyGuessSubmit(roomCode, wordGuess) {
  const code = (roomCode || '').toUpperCase().trim();
  const room = rooms.get(code);
  if (!room) return;

  room.spyGuess = wordGuess;
  const isCorrect = wordGuess.toLowerCase() === room.secretWord.toLowerCase();

  if (isCorrect) {
    room.winner = 'SPIES';
    addLogMessage(room, `CASUS DOĞRU TAHMİN ETTİ. Gizli kelime: "${room.secretWord}". Casus kazandı.`);
    room.phase = 'GAME_OVER';
  } else {
    // If spy guess is wrong, remove this spy from room.spies
    const accusedId = room.accusedPlayerId;
    room.spies = room.spies.filter(id => id !== accusedId);

    // If there are still remaining spies in the room (e.g. Double Spy mode)
    if (room.spies.length > 0) {
      room.roundNumber += 1;
      addLogMessage(room, `Casus yanlış tahmin etti! Ancak masada hala ${room.spies.length} casus var. ${room.roundNumber}. Tur başlıyor...`);
      room.currentTurnIndex = 0;
      room.votes = {};
      room.voteLogs = [];
      room.accusedPlayerId = null;
      room.spyGuess = null;
      room.phase = 'CLUE_PHASE';
    } else {
      room.winner = 'NORMALS';
      addLogMessage(room, `CASUS YANLIŞ TAHMİN ETTİ. Seçimi: "${wordGuess}", Gerçek Kelime: "${room.secretWord}". Tüm casuslar elendi, Siviller kazandı!`);
      room.phase = 'GAME_OVER';
    }
  }

  broadcastState(code);
}

io.on('connection', (socket) => {
  console.log(`🔌 Yeni Bağlantı (Socket ID): ${socket.id}`);

  // 1. CREATE ROOM (Host)
  socket.on('CREATE_ROOM', ({ hostName, category, spyCount, customWords, gameMode, turnDuration }, callback) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);

    let initialSpyCount = Number(spyCount) || 1;
    if (gameMode === 'double') {
      initialSpyCount = Math.max(2, initialSpyCount);
    }

    const roomState = {
      roomCode,
      hostId: socket.id,
      players: [{ id: socket.id, name: hostName || 'Ev Sahibi', isHost: true, isReady: true }],
      phase: 'LOBBY',
      category: category || 'food',
      customWords: customWords || [],
      spyCount: initialSpyCount,
      gameMode: gameMode || 'classic',
      turnDuration: Number(turnDuration) || 30,
      words: [],
      secretWord: '',
      spies: [],
      turnOrder: [],
      currentTurnIndex: 0,
      roundNumber: 1,
      clueLogs: [],
      votes: {},
      voteLogs: [],
      accusedPlayerId: null,
      spyGuess: null,
      winner: null
    };

    rooms.set(roomCode, roomState);
    console.log(`🏠 Oda Oluşturuldu: [${roomCode}] Ev Sahibi: ${hostName}, Mod: ${gameMode}`);

    if (callback) callback({ roomCode, peerId: socket.id });
    broadcastState(roomCode);
  });

  // 2. JOIN ROOM (Client)
  socket.on('JOIN_ROOM', ({ roomCode, playerName }, callback) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      if (callback) callback({ error: 'Oda bulunamadı!' });
      return;
    }

    socket.join(code);

    const existing = room.players.find(p => p.id === socket.id);
    if (!existing) {
      const newPlayer = {
        id: socket.id,
        name: playerName || 'Oyuncu',
        isHost: false,
        isReady: true
      };
      room.players.push(newPlayer);
      addLogMessage(room, `${newPlayer.name} lobiye katıldı.`);
    }

    if (callback) callback({ roomCode: code, peerId: socket.id });
    broadcastState(code);
  });

  // 3. UPDATE SETTINGS (In Lobby)
  socket.on('UPDATE_SETTINGS', (data) => {
    const roomCode = data?.roomCode || data?.code;
    const room = findRoomBySocket(socket, roomCode);
    if (!room) return;

    if (data.category) room.category = data.category;
    if (data.gameMode) room.gameMode = data.gameMode;
    if (data.turnDuration) room.turnDuration = Math.max(5, parseInt(data.turnDuration, 10) || 30);
    if (data.customWords && Array.isArray(data.customWords)) room.customWords = data.customWords;

    let targetSpyCount = data.spyCount ? Math.max(1, parseInt(data.spyCount, 10) || 1) : room.spyCount;
    if (room.gameMode === 'double') {
      targetSpyCount = Math.max(2, targetSpyCount);
    }
    room.spyCount = targetSpyCount;

    console.log(`⚙️ Room [${room.roomCode}] settings updated: Category=${room.category}, Mode=${room.gameMode}, Spies=${room.spyCount}, TurnDuration=${room.turnDuration}`);
    broadcastState(room.roomCode);
  });

  // 4. START GAME
  socket.on('START_GAME', (data) => {
    const roomCode = data?.roomCode || data?.code;
    const room = findRoomBySocket(socket, roomCode);
    if (!room) return;

    const words = getRandomWordsFromCategory(room.category, 20, room.customWords);
    const secretWord = words[Math.floor(Math.random() * words.length)];
    const playerIds = room.players.map(p => p.id);

    let activeSpyCount = Math.max(1, parseInt(room.spyCount, 10) || 1);
    if (room.gameMode === 'double') {
      activeSpyCount = Math.max(2, activeSpyCount);
    }
    activeSpyCount = Math.min(activeSpyCount, Math.max(1, playerIds.length - 1));

    const spies = shuffleArray(playerIds).slice(0, activeSpyCount);
    const turnOrder = shuffleArray(playerIds);

    room.phase = 'CLUE_PHASE';
    room.words = words;
    room.secretWord = secretWord;
    room.spies = spies;
    room.turnOrder = turnOrder;
    room.currentTurnIndex = 0;
    room.roundNumber = 1;
    room.clueLogs = [
      {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: 'Sistem',
        text: `1. Tur Başladı.`
      }
    ];
    room.votes = {};
    room.voteLogs = [];
    room.accusedPlayerId = null;
    room.spyGuess = null;
    room.winner = null;

    console.log(`🚀 Room [${room.roomCode}] started game: Category=${room.category}, Mode=${room.gameMode}, ActiveSpies=${spies.length}, Secret=${secretWord}`);
    broadcastState(room.roomCode);
  });

  // 5. RETURN TO LOBBY
  socket.on('RETURN_TO_LOBBY', (data) => {
    const roomCode = data?.roomCode || data?.code;
    const room = findRoomBySocket(socket, roomCode);
    if (!room) return;

    const cleanPlayers = room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.id === room.hostId || p.isHost,
      isReady: true
    }));

    const freshLobbyState = {
      roomCode: room.roomCode,
      hostId: room.hostId,
      players: cleanPlayers,
      phase: 'LOBBY',
      category: room.category || 'food',
      customWords: room.customWords || [],
      spyCount: room.gameMode === 'double' ? Math.max(2, room.spyCount || 2) : (room.spyCount || 1),
      gameMode: room.gameMode || 'classic',
      turnDuration: room.turnDuration || 30,
      words: [],
      secretWord: '',
      spies: [],
      turnOrder: [],
      currentTurnIndex: 0,
      roundNumber: 1,
      clueLogs: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          senderName: 'Sistem',
          text: 'Yeni Lobiye Dönüldü.'
        }
      ],
      votes: {},
      voteLogs: [],
      accusedPlayerId: null,
      spyGuess: null,
      winner: null
    };

    rooms.set(room.roomCode, freshLobbyState);
    console.log(`🔄 Room [${room.roomCode}] returned to lobby`);
    broadcastState(room.roomCode);
  });

  // 6. SUBMIT CLUE
  socket.on('SUBMIT_CLUE', ({ roomCode, clueText }) => {
    const room = findRoomBySocket(socket, roomCode);
    if (room) {
      handleClueSubmit(room.roomCode, socket.id, clueText);
    }
  });

  // 7. CAST VOTE
  socket.on('CAST_VOTE', ({ roomCode, targetId }) => {
    const room = findRoomBySocket(socket, roomCode);
    if (room) {
      handleCastVote(room.roomCode, socket.id, targetId);
    }
  });

  // 8. SPY GUESS SUBMIT
  socket.on('SPY_GUESS_SUBMIT', ({ roomCode, wordGuess }) => {
    const room = findRoomBySocket(socket, roomCode);
    if (room) {
      handleSpyGuessSubmit(room.roomCode, wordGuess);
    }
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    rooms.forEach((room, code) => {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leavingPlayer = room.players[idx];
        room.players.splice(idx, 1);
        addLogMessage(room, `${leavingPlayer.name} odadan ayrıldı.`);

        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          if (room.hostId === socket.id && room.players.length > 0) {
            const newHost = room.players[0];
            newHost.isHost = true;
            room.hostId = newHost.id;
          }
          broadcastState(code);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Node.js Socket.IO Oyun Sunucusu http://localhost:${PORT} adresinde aktif!`);
});
