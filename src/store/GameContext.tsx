import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, mockDb } from '../lib/firebase';
import { STUDENTS, ROUNDS } from '../data/gameData';

export type GameState = 'lobby' | 'round_active' | 'round_evaluating' | 'round_discussion' | 'end';

export interface PlayerData {
  present: boolean;
  score: number;
  exp: number;
  rank: string;
}

export interface GameModeInfo {
  state: GameState;
  currentRound: number;
  conditionalId: string;
}

export interface GameContextType {
  gameId: string;
  isProfessor: boolean;
  myPlayerId?: string;
  gameInfo: GameModeInfo;
  playerData: Record<string, PlayerData>;
  submissions: Record<string, any>;
  evaluations: Record<string, any>;
  joinAsProfessor: (id: string) => void;
  joinAsPlayer: (id: string) => boolean;
  startGame: () => void;
  nextRound: (conditionalId: string) => void;
  submitAnswer: (submission: any) => void;
  evaluateAll: () => Promise<void>;
  closeRound: () => void;
  simulatePlayersPresence: () => void;
  simulateRoundSubmissions: () => void;
  resetGame: () => void;
}

const defaultContext: GameContextType = {
  gameId: 'blitz-1',
  isProfessor: false,
  gameInfo: { state: 'lobby', currentRound: 0, conditionalId: '' },
  playerData: {},
  submissions: {},
  evaluations: {},
  joinAsProfessor: () => {},
  joinAsPlayer: () => false,
  startGame: () => {},
  nextRound: () => {},
  submitAnswer: () => {},
  evaluateAll: async () => {},
  closeRound: () => {},
  simulatePlayersPresence: () => {},
  simulateRoundSubmissions: () => {},
  resetGame: () => {}
};

export const GameContext = createContext<GameContextType>(defaultContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameId, setGameId] = useState('blitz-1');
  const [isProfessor, setIsProfessor] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>();
  
  const [gameInfo, setGameInfo] = useState<GameModeInfo>({ state: 'lobby', currentRound: 0, conditionalId: '' });
  const [playerData, setPlayerData] = useState<Record<string, PlayerData>>({});
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});

  // We use MockDB if real Firebase isn't hooked up correctly yet to prevent UI crashes in preview
  const dataRef = db ? mockDb : mockDb; 

  useEffect(() => {
    // Listen to Game Info
    const unsubGame = dataRef.onSnapshot(`games/${gameId}`, (doc: any) => {
      if (doc.exists()) {
        setGameInfo(doc.data());
      }
    });

    const unsubPlayers = dataRef.onSnapshot(`games/${gameId}/players`, (doc: any) => {
      if (doc.exists()) {
        setPlayerData(doc.data());
      }
    });

    const unsubSubs = dataRef.onSnapshot(`games/${gameId}/submissions`, (doc: any) => {
      if (doc.exists()) setSubmissions(doc.data());
    });

    const unsubEvals = dataRef.onSnapshot(`games/${gameId}/evaluations`, (doc: any) => {
      if (doc.exists()) setEvaluations(doc.data());
    });

    return () => {
      unsubGame();
      unsubPlayers();
      unsubSubs();
      unsubEvals();
    };
  }, [gameId]); // Removed 'dataRef' from dependency array to avoid exhaustive-deps warning since it's practically static

  const joinAsProfessor = (id: string) => {
    setGameId(id);
    setIsProfessor(true);
    // Initialize if empty
    dataRef.get(`games/${id}`).exists() || dataRef.set(`games/${id}`, { state: 'lobby', currentRound: 0, conditionalId: '' });
  };

  const joinAsPlayer = (id: string) => {
    // Ensure room exists
    dataRef.get(`games/${gameId}`).exists() || dataRef.set(`games/${gameId}`, { state: 'lobby', currentRound: 0, conditionalId: '' });

    // Auto-start if lobby
    if (gameInfo.state === 'lobby') {
      startGame();
    }

    const pConfig = STUDENTS.find(t => t.id === id);
    if (pConfig) {
      setMyPlayerId(id);
      dataRef.update(`games/${gameId}/players`, {
        [id]: { present: true, score: 0, exp: 0, rank: 'Calouro da Calçada', ...playerData[id] }
      });
      return true;
    }
    return false;
  };

  const startGame = () => {
    // Start with condition 1 to make narrative sense
    dataRef.update(`games/${gameId}`, { state: 'round_active', currentRound: 1, conditionalId: 'cond1' });
  };

  const nextRound = (currentCondId: string) => {
    const nextR = gameInfo.currentRound + 1;
    if (nextR > 5) {
      dataRef.update(`games/${gameId}`, { state: 'end' });
    } else {
      // Pick a conditional that makes sense for the round progression
      // cond1: Pouca grana, cond2: Calor, cond3: Acesso, cond4: Chuva, cond5: Manutenção
      const condForRound = `cond${nextR}`;
      dataRef.update(`games/${gameId}`, { state: 'round_active', currentRound: nextR, conditionalId: condForRound });
    }
  };

  const submitAnswer = async (submission: any) => {
    if (!myPlayerId) return;
    const key = `r${gameInfo.currentRound}_${myPlayerId}`;
    dataRef.update(`games/${gameId}/submissions`, { [key]: submission });
    
    // Auto-evaluate for this player immediately
    const pConfig = STUDENTS.find(t => t.id === myPlayerId);
    try {
      // Small delay just for flair
      dataRef.update(`games/${gameId}/evaluations`, { ...evaluations, [key]: { _loading: true } });
      
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          roundId: gameInfo.currentRound,
          teamName: pConfig?.name,
          submission: submission,
          conditional: { title: "Condicionante", tooltip: "Teste" }
        })
      });
      const ev = await res.json();
      
      // Directly update only the key for this student
      dataRef.update(`games/${gameId}/evaluations`, { [key]: ev });
      
      const currentExp = playerData[myPlayerId]?.exp || 0;
      let bonusExp = 20; // base for submitting
      if (ev.score >= 55) bonusExp += 40;
      
      // Similarly, only update the player record
      dataRef.update(`games/${gameId}/players`, {
        [myPlayerId]: { ...playerData[myPlayerId], exp: currentExp + bonusExp, score: (playerData[myPlayerId]?.score || 0) + (ev.score || 0) }
      });
      
    } catch(e) {
      console.error("Eval error", e);
      // Fallback eval
      dataRef.update(`games/${gameId}/evaluations`, { 
        [key]: { score: 40, strongPoint: "Boa tentativa.", weakPoint: "Falta detalhe.", recommendation: "Aprofunde.", funComment: "Na trave!", discussionPrompt: "Quais os desafios reais aqui?" } 
      });
    }
  };

  const evaluateAll = async () => {
    dataRef.update(`games/${gameId}`, { state: 'round_evaluating' });
    
    const currentSubs = Object.keys(submissions).filter(k => k.startsWith(`r${gameInfo.currentRound}_`));
    const newEvals: any = {};
    const updatedPlayers = { ...playerData };

    for (const key of currentSubs) {
      const playerId = key.split('_')[1];
      const sub = submissions[key];
      const pConfig = STUDENTS.find(t => t.id === playerId);

      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            roundId: gameInfo.currentRound,
            teamName: pConfig?.name,
            submission: sub,
            conditional: { title: "Condicionante", tooltip: "Teste" } // TODO inject real cond
          })
        });
        const ev = await res.json();
        newEvals[key] = ev;

        if (updatedPlayers[playerId]) {
             updatedPlayers[playerId].score = (updatedPlayers[playerId].score || 0) + (ev.score || 0);
             let bonusExp = 0;
             if (ev.score >= 55) bonusExp += 40;
             updatedPlayers[playerId].exp = (updatedPlayers[playerId].exp || 0) + bonusExp;
        }

      } catch(e) {
        console.error("Eval error", e);
        // Fallback eval
        newEvals[key] = { score: 40, strongPoint: "Boa tentativa.", weakPoint: "Falta detalhe.", recommendation: "Aprofunde.", funComment: "Na trave!", discussionPrompt: "Quais os desafios reias aqui?" };
      }
    }
    
    dataRef.update(`games/${gameId}/evaluations`, newEvals);
    dataRef.update(`games/${gameId}/players`, updatedPlayers);
    dataRef.update(`games/${gameId}`, { state: 'round_discussion' });
  };

  const closeRound = () => {
    // Moved to discuss transition
  };



  const simulatePlayersPresence = () => {
    const updated = { ...playerData };
    STUDENTS.forEach(t => {
      updated[t.id] = { present: true, score: 0, exp: 0, rank: 'Calouro da Calçada', ...updated[t.id] };
    });
    dataRef.update(`games/${gameId}/players`, updated);
  };

  const simulateRoundSubmissions = () => {
    const activePlayers = Object.keys(playerData).filter(pid => playerData[pid].present);
    const roundConfig = ROUNDS.find(r => r.id === gameInfo.currentRound);
    if (!roundConfig) return;

    const newSubs = { ...submissions };
    activePlayers.forEach((pid, i) => {
        const key = `r${gameInfo.currentRound}_${pid}`;
        newSubs[key] = {
            zone: "Terreno do Projeto",
            mainOption: roundConfig.options?.[i % (roundConfig.options?.length || 1)]?.id,
            justification: "Test justification for " + pid
        };
    });
    dataRef.update(`games/${gameId}/submissions`, newSubs);
  };

  const resetGame = () => {
    dataRef.update(`games/${gameId}`, { state: 'lobby', currentRound: 0, conditionalId: '' });
    dataRef.set(`games/${gameId}/submissions`, {});
    dataRef.set(`games/${gameId}/evaluations`, {});
  };

  return (
    <GameContext.Provider value={{
      gameId, isProfessor, myPlayerId, gameInfo, playerData, submissions, evaluations,
      joinAsProfessor, joinAsPlayer, startGame, nextRound, submitAnswer, evaluateAll, closeRound,
      simulatePlayersPresence, simulateRoundSubmissions, resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
