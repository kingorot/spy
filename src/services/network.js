import { io } from 'socket.io-client';

class NetworkService {
  constructor() {
    this.socket = null;
    this.isHost = false;
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
  }

  connectSocket() {
    if (!this.socket) {
      const customUrl = import.meta.env.VITE_SERVER_URL;
      const serverUrl = customUrl || (
        window.location.hostname === 'localhost'
          ? 'http://localhost:4000'
          : 'https://spy-1ehe.onrender.com'
      );

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket.IO Sunucusuna Bağlandı! ID:', this.socket.id);
        this.peerId = this.socket.id;
      });

      this.socket.on('STATE_UPDATE', (newState) => {
        this.state = { ...this.state, ...newState };
        if (newState.roomCode) {
          this.roomCode = newState.roomCode;
        }
        this.isHost = this.state.hostId === this.socket.id || (this.socket && this.socket.id && this.state.players.find(p => p.id === this.socket.id)?.isHost);
        if (this.onStateChange) {
          this.onStateChange(this.state);
        }
      });
    }
  }

  createRoom(hostName, categoryId = 'food', spyCount = 1, customWords = [], gameMode = 'classic') {
    return new Promise((resolve) => {
      this.connectSocket();

      const emitCreate = () => {
        this.socket.emit('CREATE_ROOM', { hostName, category: categoryId, spyCount, customWords, gameMode }, (res) => {
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
    // 1. Optimistic instant local state update
    this.state = { ...this.state, ...settings };
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }

    // 2. Emit to socket backend
    const code = this.roomCode || this.state.roomCode;
    if (this.socket && code) {
      this.socket.emit('UPDATE_SETTINGS', { roomCode: code, ...settings });
    }
  }

  startGame() {
    const code = this.roomCode || this.state.roomCode;
    if (this.socket && code) {
      this.socket.emit('START_GAME', { roomCode: code });
    }
  }

  returnToLobby() {
    const code = this.roomCode || this.state.roomCode;
    if (this.socket && code) {
      this.socket.emit('RETURN_TO_LOBBY', { roomCode: code });
    }
  }

  submitClue(clueText) {
    const code = this.roomCode || this.state.roomCode;
    if (this.socket && code) {
      this.socket.emit('SUBMIT_CLUE', { roomCode: code, clueText });
    }
  }

  castVote(targetId) {
    const code = this.roomCode || this.state.roomCode;
    if (this.socket && code) {
      this.socket.emit('CAST_VOTE', { roomCode: code, targetId });
    }
  }

  submitSpyGuess(wordGuess) {
    const code = this.roomCode || this.state.roomCode;
    if (this.socket && code) {
      this.socket.emit('SPY_GUESS_SUBMIT', { roomCode: code, wordGuess });
    }
  }
}

export const networkService = new NetworkService();
