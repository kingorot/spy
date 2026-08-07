import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import CreateRoomScreen from './components/CreateRoomScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import RulesModal from './components/RulesModal';
import { AlertTriangle, X } from 'lucide-react';

let socket;

export default function App() {
  const [view, setView] = useState('HOME');
  const [roomState, setRoomState] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState('');

  useEffect(() => {
    // Initialize Socket connection
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : window.location.origin;
    socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      upgrade: true
    });

    socket.on('connect', () => {
      setMyPlayerId(socket.id);
    });

    socket.on('room_joined', (data) => {
      setRoomState(data);
      if (data.gameState === 'LOBBY') {
        setView('LOBBY');
      } else {
        setView('GAME');
      }
    });

    socket.on('room_updated', (data) => {
      setRoomState(data);
      if (data.gameState === 'LOBBY') {
        setView('LOBBY');
      } else {
        setView('GAME');
      }
    });

    socket.on('error_message', (msg) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    // Check URL parameters for direct room joining
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setView('JOIN');
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = (nickname) => {
    if (!socket) return;
    socket.emit('create_room', { nickname });
  };

  const handleJoinRoom = (roomCode, nickname) => {
    if (!socket) return;
    socket.emit('join_room', { roomCode, nickname });
  };

  const handleUpdateOptions = (options) => {
    if (!socket || !roomState) return;
    socket.emit('update_room_options', { roomCode: roomState.code, ...options });
  };

  const handleAddBot = () => {
    if (!socket || !roomState) return;
    socket.emit('add_bot', { roomCode: roomState.code });
  };

  const handleStartGame = () => {
    if (!socket || !roomState) return;
    socket.emit('start_game', { roomCode: roomState.code });
  };

  const handleSubmitClue = (clueText) => {
    if (!socket || !roomState) return;
    socket.emit('submit_clue', { roomCode: roomState.code, clueText });
  };

  const handleSubmitVote = (targetPlayerId) => {
    if (!socket || !roomState) return;
    socket.emit('submit_vote', { roomCode: roomState.code, targetPlayerId });
  };

  const handleSpyGuess = (guessedWord) => {
    if (!socket || !roomState) return;
    socket.emit('spy_guess_word', { roomCode: roomState.code, guessedWord });
  };

  const handleReturnToLobby = () => {
    if (!socket || !roomState) return;
    socket.emit('return_to_lobby', { roomCode: roomState.code });
  };

  const handleLeaveRoom = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header component */}
      <Header
        roomCode={roomState?.code}
        onLeaveRoom={handleLeaveRoom}
        onOpenRules={() => setRulesOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Error Toast notification */}
      {errorMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-950 border border-red-500 text-red-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs md:text-sm font-semibold animate-bounce">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View routing */}
      <main className="flex-1 flex flex-col">
        {view === 'HOME' && (
          <HomeScreen
            onCreateRoomClick={() => setView('CREATE')}
            onJoinRoomClick={() => setView('JOIN')}
          />
        )}

        {view === 'CREATE' && (
          <CreateRoomScreen
            mode="CREATE"
            onCreateRoom={handleCreateRoom}
            onBack={() => setView('HOME')}
          />
        )}

        {view === 'JOIN' && (
          <CreateRoomScreen
            mode="JOIN"
            onJoinRoom={handleJoinRoom}
            onBack={() => setView('HOME')}
          />
        )}

        {view === 'LOBBY' && roomState && (
          <LobbyScreen
            roomState={roomState}
            myPlayerId={myPlayerId}
            onUpdateOptions={handleUpdateOptions}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
          />
        )}

        {view === 'GAME' && roomState && (
          <GameScreen
            roomState={roomState}
            myPlayerId={myPlayerId}
            onSubmitClue={handleSubmitClue}
            onSubmitVote={handleSubmitVote}
            onSpyGuess={handleSpyGuess}
            onReturnToLobby={handleReturnToLobby}
          />
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </div>
  );
}
