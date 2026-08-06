import React, { useState } from 'react';
import PlayerRoleBadge from './PlayerRoleBadge';
import CluePhase from './CluePhase';
import CardGrid from './CardGrid';
import ClueTable from './ClueTable';
import GameLogPanel from './GameLogPanel';
import VotingPhase from './VotingPhase';
import SpyGuessPhase from './SpyGuessPhase';
import GameOverModal from './GameOverModal';
import { Target } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameScreen({
  roomState,
  myPlayerId,
  onSubmitClue,
  onSubmitVote,
  onSpyGuess,
  onReturnToLobby
}) {
  const [showSpyGuessModal, setShowSpyGuessModal] = useState(false);

  if (!roomState) return null;

  const me = roomState.players.find(p => p.id === myPlayerId);
  const isSpy = me?.role === 'SPY';

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 md:p-5 max-w-5xl mx-auto w-full relative pb-28">
      {/* 1. Top Player Role Banner */}
      <PlayerRoleBadge myRole={me?.role} myName={me?.name} />

      {/* 2. Turn Order & Clue Input Header */}
      <CluePhase
        roomState={roomState}
        myPlayerId={myPlayerId}
        onSubmitClue={onSubmitClue}
      />

      {/* 3. 4x5 Grid of 20 Theme Cards */}
      <CardGrid
        cards={roomState.cards}
        secretWord={roomState.secretWord}
        isSpy={isSpy}
        isMyTurn={roomState.turnOrder?.[roomState.currentTurnIndex] === myPlayerId}
        onSpyGuess={onSpyGuess}
      />

      {/* 4. Left Floating Panels (İPUÇLARI & GEÇMİŞ Stacked) */}
      <div className="fixed bottom-4 left-4 z-30 w-72 md:w-80 flex flex-col gap-2.5 max-h-[70vh] pointer-events-auto">
        <ClueTable clues={roomState.clues} />
        <GameLogPanel logs={roomState.logs} />
      </div>

      {/* 5. Spy Voluntary Guess Button in Bottom Right Corner */}
      {isSpy && roomState.gameState === 'CLUE_PHASE' && (
        <div className="fixed bottom-4 right-4 z-30">
          <button
            onClick={() => {
              sounds.playClick();
              setShowSpyGuessModal(true);
            }}
            className="bg-white hover:bg-zinc-200 text-black font-extrabold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs md:text-sm font-mono border border-zinc-300 transition active:scale-95"
          >
            <Target className="w-4 h-4 text-black" />
            <span>Kelime Tahmin Et</span>
          </button>
        </div>
      )}

      {/* Spy Voluntary Guess Modal when bottom-right button is clicked */}
      {showSpyGuessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-[#101116] border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-xl font-extrabold text-white tracking-widest font-mono mb-2">
              KELİME TAHMİN ET
            </h2>
            <p className="text-xs text-zinc-400 mb-4 font-medium">
              Gizli kelimeyi tahmin etmek istediğiniz kartı seçin. Yanlış tahmin ederseniz Siviller kazanacaktır.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-2 bg-[#090a0d] rounded-xl border border-zinc-800 w-full mb-4">
              {roomState.cards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowSpyGuessModal(false);
                    onSpyGuess(card);
                  }}
                  className="bg-[#171822] hover:bg-white hover:text-black text-zinc-200 border border-zinc-700 font-bold py-2.5 px-2 rounded-xl text-xs transition shadow-sm active:scale-95 font-mono"
                >
                  {card}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSpyGuessModal(false)}
              className="w-full bg-[#161720] hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Modals for Phases */}
      {roomState.gameState === 'VOTING_PHASE' && (
        <VotingPhase
          roomState={roomState}
          myPlayerId={myPlayerId}
          onSubmitVote={onSubmitVote}
        />
      )}

      {roomState.gameState === 'SPY_GUESS_PHASE' && (
        <SpyGuessPhase
          roomState={roomState}
          myPlayerId={myPlayerId}
          onSpyGuess={onSpyGuess}
        />
      )}

      {roomState.gameState === 'GAME_OVER' && (
        <GameOverModal
          roomState={roomState}
          myPlayerId={myPlayerId}
          onReturnToLobby={onReturnToLobby}
        />
      )}
    </div>
  );
}
