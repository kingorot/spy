import { io } from 'socket.io-client';

class NetworkService {
  constructor() {
    this.socket = null;
    this.isHost = false;
    this.isRoomCreator = false;
    this.roomCode = null;
    this.peerId = null;
    this.onStateChange = null;

    this.state = {
      roomCode: '',
      hostId: '',
      players: [],
      phase: 'LOBBY',
      category: 'food',
      customWords: [],
      spyCount: 1,
      gameMode: 'classic',
      turnDuration: 30,
      words: [],
      secretWord: '',
      spies: [],
      eliminatedPlayers: [],
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
  }

  connectSocket() {
    if (!this.socket) {
      const customUrl = import.meta.env.VITE_SERVER_URL;
      const serverUrl = customUrl || (
        window.location.hostname === 'localhost'
          ? 'http://localhost:4000'
          : 'https://spy-1ehe.onrender.com'
      );

      console.log('🔌 Connecting Socket.IO to:', serverUrl);
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket.IO Sunucusuna Bağlandı! ID:', this.socket.id);
        this.peerId = this.socket.id;
      });

      this.socket.on('STATE_UPDATE', (incomingState) => {
        if (!incomingState) return;

        // Guaranteed Client-Side Fallback Normalization
        const newState = {
          ...incomingState,
          category: incomingState.category || incomingState.Category || 'food',
          gameMode: incomingState.gameMode || incomingState.Mode || 'classic',
          spyCount: incomingState.spyCount !== undefined ? incomingState.spyCount : (incomingState.Spies !== undefined ? incomingState.Spies : 1),
          turnDuration: incomingState.turnDuration !== undefined ? incomingState.turnDuration : (incomingState.TurnDuration !== undefined ? incomingState.TurnDuration : 30)
        };

        console.log('3. Diğer oyuncu yeni durumu sunucudan aldı:', newState.roomCode, 'category:', newState.category, 'gameMode:', newState.gameMode, 'spyCount:', newState.spyCount, 'turnDuration:', newState.turnDuration);

        this.state = newState;
        if (newState.roomCode) {
          this.roomCode = newState.roomCode;
        }

        // Robust host determination
        const isServerHost = this.socket && this.socket.id && (
          this.state.hostId === this.socket.id ||
          this.state.players.some(p => p.id === this.socket.id && p.isHost)
        );
        this.isHost = Boolean(this.isRoomCreator || isServerHost);

        if (this.onStateChange) {
          this.onStateChange(this.state);
        }
      });
    }
  }

  createRoom(hostName, categoryId = 'food', spyCount = 1, customWords = [], gameMode = 'classic', turnDuration = 30) {
    return new Promise((resolve) => {
      this.connectSocket();
      this.isRoomCreator = true;
      this.isHost = true;

      const emitCreate = () => {
        this.socket.emit('CREATE_ROOM', { hostName, category: categoryId, spyCount, customWords, gameMode, turnDuration }, (res) => {
          this.isRoomCreator = true;
          this.isHost = true;
          this.roomCode = res.roomCode;
          this.peerId = res.peerId;
          resolve({ roomCode: res.roomCode, peerId: res.peerId });
        });
      };

      if (this.socket.connected) {
        emitCreate();
      } else {
        this.socket.once('connect', emitCreate);
      }
    });
  }

  joinRoom(roomCode, playerName) {
    return new Promise((resolve, reject) => {
      this.connectSocket();
      this.isRoomCreator = false;

      const emitJoin = () => {
        this.socket.emit('JOIN_ROOM', { roomCode, playerName }, (res) => {
          if (res.error) {
            alert(res.error);
            reject(res.error);
            return;
          }
          this.roomCode = res.roomCode;
          this.peerId = res.peerId;
          resolve({ roomCode: res.roomCode, peerId: res.peerId });
        });
      };

      if (this.socket.connected) {
        emitJoin();
      } else {
        this.socket.once('connect', emitJoin);
      }
    });
  }

  updateSettings(settings) {
    const code = (this.roomCode || this.state.roomCode || '').toUpperCase().trim();
    console.log('1. Host sunucuya mod değiştirme isteği atıyor:', code, settings);
    if (this.socket) {
      this.socket.emit('UPDATE_SETTINGS', { roomCode: code, ...settings });
    }
  }

  startGame() {
    const code = (this.roomCode || this.state.roomCode || '').toUpperCase().trim();
    console.log('🚀 Host sunucuya oyunu başlat isteği atıyor:', code);
    if (this.socket) {
      this.socket.emit('START_GAME', { roomCode: code });
    }
  }

  returnToLobby() {
    const code = (this.roomCode || this.state.roomCode || '').toUpperCase().trim();
    if (this.socket) {
      this.socket.emit('RETURN_TO_LOBBY', { roomCode: code });
    }
  }

  submitClue(clueText) {
    const code = (this.roomCode || this.state.roomCode || '').toUpperCase().trim();
    if (this.socket) {
      this.socket.emit('SUBMIT_CLUE', { roomCode: code, clueText });
    }
  }

  castVote(targetId) {
    const code = (this.roomCode || this.state.roomCode || '').toUpperCase().trim();
    if (this.socket) {
      this.socket.emit('CAST_VOTE', { roomCode: code, targetId });
    }
  }

  submitSpyGuess(wordGuess) {
    const code = (this.roomCode || this.state.roomCode || '').toUpperCase().trim();
    if (this.socket) {
      this.socket.emit('SPY_GUESS_SUBMIT', { roomCode: code, wordGuess });
    }
  }
}

export const networkService = new NetworkService();
