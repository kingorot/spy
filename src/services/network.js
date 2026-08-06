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
      // Connect to Render backend in production
      const customUrl = import.meta.env.VITE_SERVER_URL;
      const serverUrl = customUrl || (
        window.location.hostname === 'localhost'
          ? 'http://localhost:4000'
          : 'https://spy-1ehe.onrender.com'
      );

      console.log('🔌 Connecting to Socket.IO backend at:', serverUrl);

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Socket.IO Sunucusuna Bağlandı! ID:', this.socket.id);
        this.peerId = this.socket.id;
      });

      this.socket.on('STATE_UPDATE', (newState) => {
        this.state = newState;
        this.isHost = this.state.hostId === this.socket.id;
        if (this.onStateChange) {
          this.onStateChange(this.state);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket.IO Sunucu Bağlantısı Kesildi');
      });
    }
  }

  createRoom(hostName, categoryId = 'food', spyCount = 1, customWords = []) {
    return new Promise((resolve) => {
      this.connectSocket();

      const emitCreate = () => {
        this.socket.emit('CREATE_ROOM', { hostName, category: categoryId, spyCount, customWords }, (res) => {
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

  startGame() {
    if (this.socket && this.roomCode) {
      this.socket.emit('START_GAME', { roomCode: this.roomCode });
    }
  }

  submitClue(clueText) {
    if (this.socket && this.roomCode) {
      this.socket.emit('SUBMIT_CLUE', { roomCode: this.roomCode, clueText });
    }
  }

  castVote(targetId) {
    if (this.socket && this.roomCode) {
      this.socket.emit('CAST_VOTE', { roomCode: this.roomCode, targetId });
    }
  }

  submitSpyGuess(wordGuess) {
    if (this.socket && this.roomCode) {
      this.socket.emit('SPY_GUESS_SUBMIT', { roomCode: this.roomCode, wordGuess });
    }
  }
}

export const networkService = new NetworkService();
