import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LobbyScreen } from './components/LobbyScreen';
import { PlayerRoleBadge } from './components/PlayerRoleBadge';
import { CardGrid } from './components/CardGrid';
import { CluePhase } from './components/CluePhase';
import { ClueTable } from './components/ClueTable';
import { VotingPhase } from './components/VotingPhase';
import { SpyGuessPhase } from './components/SpyGuessPhase';
import { GameLogPanel } from './components/GameLogPanel';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { SpyVoluntaryGuessModal } from './components/SpyVoluntaryGuessModal';
import { networkService } from './services/network';
import { soundEngine } from './utils/audio';

export function App() {
  const [roomState, setRoomState] = useState(networkService.state);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSpyVoluntaryModalOpen, setIsSpyVoluntaryModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    networkService.onStateChange = (newState) => {
      setRoomState({ ...newState });
    };
  }, []);

  const handleHostRoom = async (hostName, categoryId, spyCount, customWords = []) => {
    const { roomCode, peerId } = await networkService.createRoom(hostName, categoryId, spyCount, customWords);
    setMyPlayerId(peerId);
  };

  const handleJoinRoom = async (roomCode, playerName) => {
    const { peerId } = await networkService.joinRoom(roomCode, playerName);
    setMyPlayerId(peerId);
  };

  const handleStartGame = () => {
    soundEngine.playClick();
    networkService.startGame();
  };

  const handleReturnToLobby = () => {
    soundEngine.playClick();
    networkService.returnToLobby();
  };

  const handleSubmitClue = (clueText) => {
    networkService.submitClue(clueText);
  };

  const handleCastVote = (targetId) => {
    networkService.castVote(targetId);
  };

  const handleSpyGuessSubmit = (wordGuess) => {
    networkService.submitSpyGuess(wordGuess);
  };

  const handleLeaveRoom = () => {
    soundEngine.playClick();
    window.location.href = window.location.origin;
  };

  const myPlayer = roomState.players.find(p => p.id === myPlayerId) || { name: 'Oyuncu' };
  const isSpy = roomState.spies.includes(myPlayerId);
  const accusedPlayer = roomState.players.find(p => p.id === roomState.accusedPlayerId);
  const isPlaying = roomState.phase !== 'LOBBY' && roomState.phase !== 'GAME_OVER';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden selection:bg-zinc-800 selection:text-white">
      <Header
        roomCode={roomState.roomCode}
        player={myPlayer}
        onOpenRules={() => setIsRulesOpen(true)}
        onLeaveRoom={handleLeaveRoom}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5 pb-28 relative z-10">
        {roomState.phase === 'LOBBY' && (
          <LobbyScreen
            roomState={roomState}
            onHostRoom={handleHostRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
            isHost={networkService.isHost}
            myPlayerId={myPlayerId}
          />
        )}

        {roomState.phase !== 'LOBBY' && (
          <>
            <PlayerRoleBadge
              isSpy={isSpy}
              secretWord={roomState.secretWord}
              playerName={myPlayer.name}
            />

            {roomState.phase === 'CLUE_PHASE' && (
              <CluePhase
                turnOrder={roomState.turnOrder}
                currentTurnIndex={roomState.currentTurnIndex}
                players={roomState.players}
                myPlayerId={myPlayerId}
                onSubmitClue={handleSubmitClue}
              />
            )}

            {/* Dedicated Clues Table Component on main screen */}
            <ClueTable clueLogs={roomState.clueLogs} />

            {roomState.phase === 'VOTING_PHASE' && (
              <VotingPhase
                players={roomState.players}
                myPlayerId={myPlayerId}
                onCastVote={handleCastVote}
                votes={roomState.votes}
                voteLogs={roomState.voteLogs}
              />
            )}

            {roomState.phase === 'SPY_GUESS' && (
              <SpyGuessPhase
                words={roomState.words}
                isSpy={isSpy}
                onSpyGuessSubmit={handleSpyGuessSubmit}
                accusedPlayerName={accusedPlayer ? accusedPlayer.name : 'Oyuncu'}
              />
            )}

            <CardGrid
              words={roomState.words}
              secretWord={roomState.secretWord}
              isSpy={isSpy}
            />
          </>
        )}
      </main>

      {/* Floating Bottom-Right Voluntary Guess Button for SPY */}
      {isSpy && isPlaying && (
        <button
          onClick={() => { soundEngine.playClick(); setIsSpyVoluntaryModalOpen(true); }}
          className="fixed bottom-4 right-4 z-40 px-4 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-2xl transition-all"
        >
          <span>KELİMEYİ TAHMİN ET</span>
        </button>
      )}

      {/* Game & Vote Log Panel */}
      {roomState.roomCode && (
        <GameLogPanel
          clueLogs={roomState.clueLogs}
          voteLogs={roomState.voteLogs}
        />
      )}

      {/* GameOver Modal */}
      {roomState.phase === 'GAME_OVER' && (
        <GameOverModal
          winner={roomState.winner}
          secretWord={roomState.secretWord}
          spies={roomState.spies}
          players={roomState.players}
          isHost={networkService.isHost}
          onReturnToLobby={handleReturnToLobby}
        />
      )}

      {/* Spy Voluntary Guess Modal */}
      {isSpyVoluntaryModalOpen && (
        <SpyVoluntaryGuessModal
          words={roomState.words}
          onClose={() => setIsSpyVoluntaryModalOpen(false)}
          onSubmitGuess={(guess) => networkService.submitSpyGuess(guess)}
        />
      )}

      {/* Rules Modal */}
      {isRulesOpen && (
        <RulesModal onClose={() => setIsRulesOpen(false)} />
      )}
    </div>
  );
}
