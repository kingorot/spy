import React, { useState, useEffect } from 'react';
import { insertCoin, getRoomCode, myPlayer, onPlayerJoin, isHost, setState, getState } from 'playroomkit';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import CreateRoomScreen from './components/CreateRoomScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import RulesModal from './components/RulesModal';
import { AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('HOME');
  const [roomState, setRoomState] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState('');
  const [players, setPlayers] = useState([]);
  const [prefilledRoomCode, setPrefilledRoomCode] = useState('');

  // Initial URL check for invite links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setPrefilledRoomCode(roomFromUrl);
      setView('JOIN');
    }
  }, []);

  // Initialize PlayroomKit state synchronization
  const initPlayroom = async (nickname, roomCode = null) => {
    try {
      await insertCoin({
        skipLobby: true,
        gameId: "kelime-casusu",
        roomCode: roomCode || undefined,
      });

      const localPlayer = myPlayer();
      setMyPlayerId(localPlayer.id);
      localPlayer.setState("name", nickname);

      // Set default lobby states if host
      if (isHost()) {
        setState("hostId", localPlayer.id);
        setState("category", "Yemekler");
        setState("gameMode", "Klasik Mod");
        setState("spyCount", 1);
        setState("turnTimeLimit", 30);
        setState("gameState", "LOBBY");
        setState("logs", [{
          id: "init",
          text: `${nickname} odayı oluşturdu.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "info"
        }]);
      } else {
        const currentLogs = getState("logs") || [];
        setState("logs", [...currentLogs, {
          id: `join-${localPlayer.id}`,
          text: `${nickname} odaya katıldı.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "info"
        }]);
      }

      // Track active players
      onPlayerJoin((player) => {
        setPlayers(prev => {
          if (prev.find(p => p.id === player.id)) return prev;
          return [...prev, player];
        });

        player.onQuit(() => {
          setPlayers(prev => prev.filter(p => p.id !== player.id));
          const currentLogs = getState("logs") || [];
          setState("logs", [...currentLogs, {
            id: `leave-${player.id}`,
            text: `${player.getState("name") || "Oyuncu"} ayrıldı.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "warning"
          }]);
        });
      });

      setView('LOBBY');
    } catch (err) {
      setErrorMessage("Odaya bağlanırken hata oluştu.");
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Sync Playroom state updates with React state
  useEffect(() => {
    if (view === 'HOME' || view === 'CREATE' || view === 'JOIN') return;

    const interval = setInterval(() => {
      const category = getState("category");
      const gameMode = getState("gameMode");
      const spyCount = getState("spyCount");
      const turnTimeLimit = getState("turnTimeLimit");
      const gameState = getState("gameState");
      const secretWord = getState("secretWord");
      const madmanWord = getState("madmanWord");
      const cards = getState("cards") || [];
      const turnOrder = getState("turnOrder") || [];
      const currentTurnIndex = getState("currentTurnIndex") || 0;
      const currentRound = getState("currentRound") || 1;
      const clues = getState("clues") || [];
      const votes = getState("votes") || {};
      const logs = getState("logs") || [];
      const winner = getState("winner");
      const winReason = getState("winReason");
      const accusedPlayerId = getState("accusedPlayerId");
      const hostId = getState("hostId") || (isHost() ? myPlayerId : null);
      const myRole = myPlayer()?.getState("role");

      let otherSpies = [];
      if (myRole === 'SPY' && gameMode === 'Klasik Mod') {
        otherSpies = players
          .filter(p => p.id !== myPlayerId && p.getState("role") === 'SPY')
          .map(p => p.getState("name") || "Oyuncu");
      }

      // Determine which word the local player sees highlighted
      let displayedWord = secretWord;
      if (gameMode === 'Delinin OyunAlanı' && myRole === 'MADMAN' && gameState !== 'GAME_OVER') {
        displayedWord = madmanWord;
      }

      const mappedPlayers = players.map(p => ({
        id: p.id,
        name: p.getState("name") || "Oyuncu",
        isHost: hostId ? p.id === hostId : (isHost() && p.id === myPlayerId),
        isAlive: p.getState("isAlive") !== false,
        role: (gameState === 'GAME_OVER' || p.id === myPlayerId) ? p.getState("role") : undefined
      }));

      const stateObj = {
        code: getRoomCode(),
        hostId: hostId || (isHost() ? myPlayerId : null),
        category,
        gameMode,
        spyCount,
        turnTimeLimit,
        gameState,
        players: mappedPlayers,
        otherSpies,
        cards,
        secretWord: (gameState === 'GAME_OVER' || (myRole !== 'SPY' && gameState !== 'LOBBY')) ? displayedWord : null,
        madmanWord,
        turnOrder,
        currentTurnIndex,
        currentRound,
        clues,
        votes,
        logs,
        winner,
        winReason,
        accusedPlayerId
      };

      setRoomState(stateObj);

      if (gameState === 'LOBBY') {
        setView('LOBBY');
      } else {
        setView('GAME');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [view, players, myPlayerId]);

  const handleCreateRoom = (nickname) => {
    initPlayroom(nickname);
  };

  const handleJoinRoom = (roomCode, nickname) => {
    initPlayroom(nickname, roomCode);
  };

  const handleUpdateOptions = (options) => {
    if (!isHost()) return;
    if (options.category) setState("category", options.category);
    if (options.gameMode) setState("gameMode", options.gameMode);
    if (options.spyCount !== undefined) setState("spyCount", options.spyCount);
    if (options.turnTimeLimit !== undefined) setState("turnTimeLimit", options.turnTimeLimit);
  };

  const handleAddBot = () => {
    // PlayroomKit has mock players for testing!
    // We can use PlayroomKit mock players to test locally.
    setErrorMessage("PlayroomKit test modunda mock oyuncuları otomatik senkronize eder.");
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleStartGame = () => {
    if (!isHost()) return;

    const category = getState("category") || "Yemekler";
    // Standard mock word pool logic inside client
    const wordPool = {
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
      ]
    };

    const selectedCategory = wordPool[category] || wordPool["Yemekler"];
    const shuffledPool = [...selectedCategory].sort(() => Math.random() - 0.5);
    const selected20 = shuffledPool.slice(0, 20);
    const secretWord = selected20[Math.floor(Math.random() * 20)];

    const currentGameMode = getState("gameMode");

    if (currentGameMode === 'Delinin OyunAlanı') {
      // Pick 1 random player as MADMAN, all others as CIVILIAN
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      const madmanPlayer = shuffledPlayers[0];

      // Pick madmanWord from remaining 19 cards
      const otherCards = selected20.filter(c => c !== secretWord);
      const madmanWord = otherCards[Math.floor(Math.random() * otherCards.length)];

      players.forEach(p => {
        const isMadman = p.id === madmanPlayer.id;
        p.setState("role", isMadman ? "MADMAN" : "CIVILIAN");
        p.setState("isAlive", true);
      });

      setState("madmanWord", madmanWord);
    } else {
      // Standard Spy roles assignment
      const countSpies = Math.min(getState("spyCount") || 1, players.length - 1);
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      players.forEach((p, idx) => {
        const isSpy = shuffledPlayers.slice(0, countSpies).some(sp => sp.id === p.id);
        p.setState("role", isSpy ? "SPY" : "CIVILIAN");
        p.setState("isAlive", true);
      });

      setState("madmanWord", null);
    }

    setState("cards", selected20);
    setState("secretWord", secretWord);
    setState("currentRound", 1);
    setState("clues", []);
    setState("votes", {});
    setState("winner", null);
    setState("winReason", null);
    setState("accusedPlayerId", null);
    setState("turnOrder", players.map(p => p.id).sort(() => Math.random() - 0.5));
    setState("currentTurnIndex", 0);
    setState("gameState", "CLUE_PHASE");

    const currentLogs = getState("logs") || [];
    setState("logs", [...currentLogs, {
      id: `start-${Date.now()}`,
      text: `Oyun başladı. Kategori: ${category}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "phase"
    }]);
  };

  const handleSubmitClue = (clueText) => {
    const localPlayer = myPlayer();
    const currentClues = getState("clues") || [];
    const round = getState("currentRound") || 1;

    const updatedClues = [...currentClues, {
      round,
      playerId: localPlayer.id,
      playerName: localPlayer.getState("name") || "Oyuncu",
      clueText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];

    setState("clues", updatedClues);

    const currentLogs = getState("logs") || [];
    setState("logs", [...currentLogs, {
      id: `clue-${localPlayer.id}-${Date.now()}`,
      text: `${localPlayer.getState("name")} -> "${clueText}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "clue"
    }]);

    const nextIndex = (getState("currentTurnIndex") || 0) + 1;
    const turnOrder = getState("turnOrder") || [];

    if (nextIndex >= turnOrder.length) {
      setState("gameState", "VOTING_PHASE");
      setState("votes", {});
      setState("logs", [...getState("logs"), {
        id: `voting-${Date.now()}`,
        text: `${round}. Tur ipuçları tamamlandı. Oylama başlıyor.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "phase"
      }]);
    } else {
      setState("currentTurnIndex", nextIndex);
    }
  };

  const checkVotingResults = (currentVotes) => {
    const activePlayers = players.filter(p => p.getState("isAlive") !== false);
    const votesCount = Object.keys(currentVotes).length;

    if (votesCount >= activePlayers.length) {
      const voteCounts = {};
      Object.values(currentVotes).forEach(targetId => {
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

      if (!accusedId || tie || maxVotes <= Math.floor(activePlayers.length / 2)) {
        const round = getState("currentRound") || 1;
        setState("currentRound", round + 1);
        setState("currentTurnIndex", 0);
        setState("gameState", "CLUE_PHASE");
        setState("votes", {});
        setState("logs", [...getState("logs"), {
          id: `tie-${Date.now()}`,
          text: `Çoğunluk pas geçti veya eşitlik sağlandı. Sonraki tura geçiliyor.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "warning"
        }]);
      } else {
        const accusedPlayer = players.find(p => p.id === accusedId);
        setState("accusedPlayerId", accusedId);
        setState("logs", [...getState("logs"), {
          id: `accused-${Date.now()}`,
          text: `Çoğunluk oyuyla ${accusedPlayer?.getState("name")} suçlandı.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "important"
        }]);

        const currentGameMode = getState("gameMode");

        if (currentGameMode === 'Delinin OyunAlanı') {
          const madmanPlayer = players.find(p => p.getState("role") === 'MADMAN');
          const realSecretWord = getState("secretWord");
          const mWord = getState("madmanWord");

          if (accusedPlayer?.getState("role") === 'MADMAN') {
            setState("winner", "CIVILIANS");
            setState("winReason", `Siviller kazandı! Deli (${accusedPlayer?.getState("name")}) tespit edildi ve elendi. Gerçek kelime: "${realSecretWord}", Delinin kelimesi: "${mWord}".`);
          } else {
            setState("winner", "MADMAN");
            setState("winReason", `Deli kazandı! Siviller Deliyi (${madmanPlayer?.getState("name")}) tespit edemedi! Gerçek kelime: "${realSecretWord}", Delinin kelimesi: "${mWord}".`);
          }
          setState("gameState", "GAME_OVER");
        } else {
          if (accusedPlayer?.getState("role") === 'SPY') {
            setState("gameState", "SPY_GUESS_PHASE");
          } else {
            setState("winner", "SPY");
            setState("winReason", `Siviller masum bir oyuncuyu (${accusedPlayer?.getState("name")}) eledi.`);
            setState("gameState", "GAME_OVER");
          }
        }
      }
    }
  };

  const handleSubmitVote = (targetPlayerId) => {
    const localPlayer = myPlayer();
    const currentVotes = getState("votes") || {};
    const updatedVotes = { ...currentVotes, [localPlayer.id]: targetPlayerId };

    setState("votes", updatedVotes);
    checkVotingResults(updatedVotes);
  };

  const handleSpyGuess = (guessedWord) => {
    const secretWord = getState("secretWord");
    const isCorrect = guessedWord.trim().toLowerCase() === secretWord.toLowerCase();

    setState("gameState", "GAME_OVER");
    if (isCorrect) {
      setState("winner", "SPY");
      setState("winReason", `Casus doğru kelimeyi ("${secretWord}") bildi ve kazandı!`);
    } else {
      setState("winner", "CIVILIANS");
      setState("winReason", `Casus yanlış tahminde bulundu. Gizli kelime: "${secretWord}". Siviller kazandı!`);
    }
  };

  const handleReturnToLobby = () => {
    if (!isHost()) return;
    setState("gameState", "LOBBY");
    setState("winner", null);
    setState("winReason", null);
    setState("accusedPlayerId", null);
    players.forEach(p => p.setState("role", null));
  };

  const handleLeaveRoom = () => {
    window.location.href = window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans selection:bg-white selection:text-black">
      <Header
        roomCode={roomState?.code}
        onLeaveRoom={handleLeaveRoom}
        onOpenRules={() => setRulesOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {errorMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-950 border border-zinc-500 text-zinc-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs md:text-sm font-semibold">
          <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            prefilledRoomCode={prefilledRoomCode}
          />
        )}

        {view === 'LOBBY' && (!roomState ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 font-mono text-sm gap-3 my-20">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Lobi yükleniyor...</span>
          </div>
        ) : (
          <LobbyScreen
            roomState={roomState}
            myPlayerId={myPlayerId}
            onUpdateOptions={handleUpdateOptions}
            onStartGame={handleStartGame}
            onAddBot={handleAddBot}
          />
        ))}

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

      <RulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
      />
    </div>
  );
}
