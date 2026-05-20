import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc, collection, writeBatch, serverTimestamp, query, getDocs, deleteDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
  joinAsPlayer: (id: string) => Promise<boolean>;
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
  joinAsPlayer: async () => false,
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

  useEffect(() => {
    if (!db) return;

    // Sign in anonymously if possible, but don't block if disabled
    signInAnonymously(auth).catch(e => {
       if (e.code !== 'auth/admin-restricted-operation') {
         console.error("Auth error", e);
       }
    });

    // Listen to Game Info
    const unsubGame = onSnapshot(doc(db, 'games', gameId), (snapshot) => {
      if (snapshot.exists()) {
        setGameInfo(snapshot.data() as GameModeInfo);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `games/${gameId}`));

    const unsubPlayers = onSnapshot(collection(db, 'games', gameId, 'players'), (snapshot) => {
      const data: Record<string, PlayerData> = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data() as PlayerData;
      });
      setPlayerData(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, `games/${gameId}/players`));

    const unsubSubs = onSnapshot(collection(db, 'games', gameId, 'submissions'), (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setSubmissions(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, `games/${gameId}/submissions`));

    const unsubEvals = onSnapshot(collection(db, 'games', gameId, 'evaluations'), (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setEvaluations(data);
    }, (error) => handleFirestoreError(error, OperationType.GET, `games/${gameId}/evaluations`));

    return () => {
      unsubGame();
      unsubPlayers();
      unsubSubs();
      unsubEvals();
    };
  }, [gameId]);

  const joinAsProfessor = async (id: string) => {
    setGameId(id);
    setIsProfessor(true);
    if (!db) return;
    
    try {
      const gameDoc = await getDoc(doc(db, 'games', id));
      if (!gameDoc.exists()) {
        await setDoc(doc(db, 'games', id), { 
          state: 'lobby', 
          currentRound: 0, 
          conditionalId: '',
          updatedAt: serverTimestamp()
        });
      }
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, `games/${id}`);
    }
  };

  const joinAsPlayer = async (id: string) => {
    if (!db) return false;

    try {
      // Ensure room exists
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      if (!gameDoc.exists()) {
        await setDoc(doc(db, 'games', gameId), { 
          state: 'lobby', 
          currentRound: 0, 
          conditionalId: '',
          updatedAt: serverTimestamp()
        });
      }

      const pConfig = STUDENTS.find(t => t.id === id);
      if (pConfig) {
        setMyPlayerId(id);
        await setDoc(doc(db, 'games', gameId, 'players', id), {
          present: true, 
          score: playerData[id]?.score || 0, 
          exp: playerData[id]?.exp || 0, 
          rank: playerData[id]?.rank || 'Calouro da Calçada',
          updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
      }
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, `games/${gameId}/players/${id}`);
    }
    return false;
  };

  const startGame = async () => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'games', gameId), { 
        state: 'round_active', 
        currentRound: 1, 
        conditionalId: 'cond1',
        updatedAt: serverTimestamp() 
      });
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  const nextRound = async (currentCondId: string) => {
    if (!db) return;
    try {
      const nextR = gameInfo.currentRound + 1;
      if (nextR > 5) {
        await updateDoc(doc(db, 'games', gameId), { 
          state: 'end',
          updatedAt: serverTimestamp()
        });
      } else {
        const condForRound = `cond${nextR}`;
        await updateDoc(doc(db, 'games', gameId), { 
          state: 'round_active', 
          currentRound: nextR, 
          conditionalId: condForRound,
          updatedAt: serverTimestamp()
        });
      }
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  const validateSubmission = (submission: any, roundConfig: any) => {
    if (!submission.justification || submission.justification.length > 180) {
      throw new Error("Justificação deve ter entre 1 e 180 caracteres.");
    }

    const { mechanic, options } = roundConfig;
    const optionIds = options?.map((o: any) => o.id) || [];

    if (mechanic === 'pick_problem' || mechanic === 'pick_combo') {
      const required = mechanic === 'pick_problem' ? 3 : 2;
      if (!Array.isArray(submission.mainOption) || submission.mainOption.length !== required) {
        throw new Error(`Selecione exatamente ${required} opções.`);
      }
      if (!submission.mainOption.every((id: string) => optionIds.includes(id))) {
        throw new Error("Uma ou mais opções selecionadas são inválidas para esta rodada.");
      }
    } else if (mechanic === 'distribute_tokens') {
      if (typeof submission.mainOption !== 'object') {
        throw new Error("Formato de distribuição de tokens inválido.");
      }
      let total = 0;
      for (const [id, value] of Object.entries(submission.mainOption)) {
        if (!optionIds.includes(id)) {
          throw new Error(`Opção ${id} inválida para distribuição.`);
        }
        total += (Number(value) || 0);
      }
      if (total !== 10) {
        throw new Error("Distribua exatamente 10 fichas.");
      }
    } else {
      // Default single choice
      if (!submission.mainOption || !optionIds.includes(submission.mainOption)) {
        throw new Error("Seleção principal inválida ou ausente.");
      }
    }
    return true;
  };

  const submitAnswer = async (submission: any) => {
    if (!myPlayerId || !db) return;
    const roundConfig = ROUNDS.find(r => r.id === gameInfo.currentRound);
    if (!roundConfig) return;

    try {
      validateSubmission(submission, roundConfig);
    } catch (valErr: any) {
      alert(valErr.message);
      return;
    }

    const key = `r${gameInfo.currentRound}_${myPlayerId}`;
    
    try {
      await setDoc(doc(db, 'games', gameId, 'submissions', key), {
        ...submission,
        roundId: gameInfo.currentRound,
        playerId: myPlayerId,
        updatedAt: serverTimestamp()
      });

      const pConfig = STUDENTS.find(t => t.id === myPlayerId);
      await setDoc(doc(db, 'games', gameId, 'evaluations', key), { _loading: true }, { merge: true });
      
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
      
      await setDoc(doc(db, 'games', gameId, 'evaluations', key), {
        ...ev,
        updatedAt: serverTimestamp()
      });
      
      const currentExp = playerData[myPlayerId]?.exp || 0;
      let bonusExp = 20; 
      if (ev.score >= 55) bonusExp += 40;
      
      await updateDoc(doc(db, 'games', gameId, 'players', myPlayerId), {
        exp: currentExp + bonusExp, 
        score: (playerData[myPlayerId]?.score || 0) + (ev.score || 0),
        updatedAt: serverTimestamp()
      });
      
    } catch(e) {
      console.error("Eval error", e);
      const key = `r${gameInfo.currentRound}_${myPlayerId}`;
      await setDoc(doc(db, 'games', gameId, 'evaluations', key), { 
        score: 40, strongPoint: "Boa tentativa.", weakPoint: "Falta detalhe.", recommendation: "Aprofunde.", funComment: "Na trave!", discussionPrompt: "Quais os desafios reais aqui?",
        updatedAt: serverTimestamp()
      });
      handleFirestoreError(e, OperationType.WRITE, `games/${gameId}/submissions/${key}`);
    }
  };

  const evaluateAll = async () => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'games', gameId), { state: 'round_evaluating' });
      
      const currentSubsEntries = Object.entries(submissions).filter(([k]) => k.startsWith(`r${gameInfo.currentRound}_`));
      
      for (const [key, sub] of currentSubsEntries) {
        const playerId = key.split('_')[1];
        const pConfig = STUDENTS.find(t => t.id === playerId);

        try {
          const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              roundId: gameInfo.currentRound,
              teamName: pConfig?.name,
              submission: sub,
              conditional: { title: "Condicionante", tooltip: "Teste" }
            })
          });
          const ev = await res.json();
          
          await setDoc(doc(db, 'games', gameId, 'evaluations', key), {
            ...ev,
            updatedAt: serverTimestamp()
          });

          if (playerData[playerId]) {
               let bonusExp = 0;
               if (ev.score >= 55) bonusExp += 40;
               await updateDoc(doc(db, 'games', gameId, 'players', playerId), {
                 score: (playerData[playerId].score || 0) + (ev.score || 0),
                 exp: (playerData[playerId].exp || 0) + bonusExp,
                 updatedAt: serverTimestamp()
               });
          }
        } catch(e) {
          console.error("Eval error", e);
          await setDoc(doc(db, 'games', gameId, 'evaluations', key), { 
            score: 40, strongPoint: "Boa tentativa.", weakPoint: "Falta detalhe.", recommendation: "Aprofunde.", funComment: "Na trave!", discussionPrompt: "Quais os desafios reias aqui?",
            updatedAt: serverTimestamp()
          });
        }
      }
      
      await updateDoc(doc(db, 'games', gameId), { state: 'round_discussion', updatedAt: serverTimestamp() });
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, `games/${gameId}`);
    }
  };

  const closeRound = () => {};

  const simulatePlayersPresence = async () => {
    if (!db) return;
    try {
      const batch = writeBatch(db);
      STUDENTS.forEach(t => {
        const ref = doc(db, 'games', gameId, 'players', t.id);
        batch.set(ref, { 
          present: true, 
          score: 0, 
          exp: 0, 
          rank: 'Calouro da Calçada',
          updatedAt: serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, `games/${gameId}/players`);
    }
  };

  const simulateRoundSubmissions = async () => {
    if (!db) return;
    try {
      const activePlayers = Object.keys(playerData).filter(pid => playerData[pid].present);
      const roundConfig = ROUNDS.find(r => r.id === gameInfo.currentRound);
      if (!roundConfig) return;

      const batch = writeBatch(db);
      activePlayers.forEach((pid, i) => {
          const key = `r${gameInfo.currentRound}_${pid}`;
          const ref = doc(db, 'games', gameId, 'submissions', key);
          
          let mainOption: any;
          const { mechanic, options } = roundConfig;
          
          if (mechanic === 'pick_problem') {
            mainOption = options!.slice(0, 3).map(o => o.id);
          } else if (mechanic === 'pick_combo') {
            mainOption = options!.slice(0, 2).map(o => o.id);
          } else if (mechanic === 'distribute_tokens') {
            mainOption = { [options![0].id]: 10 };
          } else {
            mainOption = options?.[i % (options?.length || 1)]?.id;
          }

          batch.set(ref, {
              roundId: gameInfo.currentRound,
              playerId: pid,
              zone: "Terreno do Projeto",
              mainOption: mainOption,
              justification: `Simulated justification for ${pid} in round ${gameInfo.currentRound}.`,
              updatedAt: serverTimestamp()
          });
      });
      await batch.commit();
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, `games/${gameId}/submissions`);
    }
  };

  const resetGame = async () => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'games', gameId), { 
        state: 'lobby', 
        currentRound: 0, 
        conditionalId: '',
        updatedAt: serverTimestamp()
      });
      
      // Clear submissions and evaluations
      const subs = await getDocs(collection(db, 'games', gameId, 'submissions'));
      const evals = await getDocs(collection(db, 'games', gameId, 'evaluations'));
      
      const batch = writeBatch(db);
      subs.forEach(d => batch.delete(d.ref));
      evals.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch(e) {
      handleFirestoreError(e, OperationType.UPDATE, `games/${gameId}`);
    }
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
