import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { STUDENTS, ROUNDS, getRank, CONDITIONALS } from '../data/gameData';
import { Play, Users, Trophy, ChevronRight, Activity, ArrowRight, Zap, Target, Eye, Info, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from '../components/Tooltip';

export default function ProfessorDashboard() {
  const { gameInfo, playerData, startGame, nextRound, evaluateAll, isProfessor, submissions, evaluations, simulatePlayersPresence, simulateRoundSubmissions, sendInteraction, resetGame } = useGame();
  
  const [selectedEvals, setSelectedEvals] = useState<string[]>([]);
  
  React.useEffect(() => {
    setSelectedEvals([]);
  }, [gameInfo.currentRound, gameInfo.state]);

  if (!isProfessor) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Acesso Negado</div>;
  }

  const activePlayers = Object.keys(playerData).filter(pid => playerData[pid].present);
  const roundConfig = ROUNDS.find(r => r.id === gameInfo.currentRound);
  const conditional = CONDITIONALS.find(c => c.id === gameInfo.conditionalId);

  const handleStart = () => {
    // Pick first round, first cond
    startGame();
  };

  const handleNextRound = () => {
    nextRound(gameInfo.conditionalId);
  };

  const [contextMenu, setContextMenu] = useState<{pid: string, x: number; y: number} | null>(null);

  const handleContextMenu = (e: React.MouseEvent, pid: string) => {
      e.preventDefault();
      setContextMenu({ pid, x: e.clientX, y: e.clientY });
  };
  
  React.useEffect(() => {
      const clickAway = () => setContextMenu(null);
      if (contextMenu) {
          window.addEventListener('click', clickAway);
          return () => window.removeEventListener('click', clickAway);
      }
  }, [contextMenu]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl relative z-10 shadow-2xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter">ENTRE-MARÉS</h1>
          <div className="flex items-center gap-3">
             <p className="text-[10px] tracking-widest text-slate-400 uppercase">Blitz Urbana</p>
             {gameInfo.state === 'lobby' && (
                <button onClick={simulatePlayersPresence} className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 hover:bg-indigo-500/40 transition-colors">Test: Add Players</button>
             )}
             {gameInfo.state !== 'lobby' && (
                 <button onClick={resetGame} className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30 hover:bg-red-500/40 transition-colors">Reset Game</button>
             )}
             {gameInfo.state === 'round_active' && (
                <button onClick={simulateRoundSubmissions} className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 hover:bg-cyan-500/40 transition-colors">Test: Autoplay Round</button>
             )}
          </div>
        </div>
        <div className="flex gap-4 items-center">
            {gameInfo.state === 'lobby' && (
              <button onClick={handleStart} className="flex items-center gap-2 bg-cyan-500 text-black hover:bg-white px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-all">
                <Play className="w-4 h-4" /> INICIAR PARTIDA
              </button>
            )}
            {gameInfo.state === 'round_active' && (
               <button onClick={evaluateAll} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-900/50 transition-colors">
                 <Zap className="w-4 h-4" /> ENCERRAR E AVALIAR
               </button>
            )}
            {gameInfo.state === 'round_discussion' && (
               <button onClick={handleNextRound} className="flex items-center gap-2 bg-white text-slate-900 hover:bg-cyan-400 px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-colors">
                 <ChevronRight className="w-4 h-4" /> PRÓXIMA RODADA
               </button>
            )}
        </div>
      </header>

      {/* LOBBY STATE */}
      {gameInfo.state === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
            <h2 className="text-4xl font-bold mb-4 italic text-white">Aguardando Alunos...</h2>
            <p className="text-slate-400 mb-12">Projete o link para os alunos se conectarem pelo celular.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl">
                {STUDENTS.map(student => {
                    const isActive = playerData[student.id]?.present;
                    return (
                        <div key={student.id} className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-[0_0_10px_rgba(79,70,229,0.15)]' : 'bg-white/5 border-white/5 opacity-40'}`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm" style={{ color: student.color }}>{student.name}</span>
                                {isActive ? <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div> : <div className="w-2 h-2 rounded-full bg-slate-700"></div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* GAME RUNNING */}
      {gameInfo.state !== 'lobby' && (
          <div className="flex-1 flex p-6 gap-6 h-[calc(100vh-85px)] relative z-10">
             {/* LEFT PANEL - GAMEPLAY TRUTH */}
             <div className="flex-1 flex flex-col gap-6">
                
                {/* HEADLINE */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 flex justify-between items-center relative overflow-hidden shadow-2xl shrink-0">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                   
                   <div className="relative z-10 pl-4 border-l-4 border-cyan-500 max-w-2xl">
                       <h3 className="text-cyan-400 font-black tracking-[0.2em] text-sm uppercase mb-2">Rodada {roundConfig?.id} de 5</h3>
                       <h2 className="font-display text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-3 tracking-tighter leading-tight italic">
                           {roundConfig?.title}
                       </h2>
                       <p className="text-lg text-cyan-100/70 font-medium leading-relaxed">{roundConfig?.subtitle}</p>
                   </div>
                   
                   {conditional && (
                       <div className="relative z-10 bg-white/5 border border-white/10 p-4 rounded-xl max-w-xs backdrop-blur-md">
                           <div className="flex items-center gap-2 mb-2 text-indigo-400">
                               <Target className="w-4 h-4" />
                               <span className="font-bold text-xs uppercase tracking-widest">Condicionante Ativa</span>
                           </div>
                           <h4 className="font-bold text-white text-sm mb-1">{conditional.title}</h4>
                           <p className="text-xs text-slate-400 leading-tight">{conditional.tooltip}</p>
                       </div>
                   )}
                </div>

                {/* THE MAP OR EVALUATION */}
                {gameInfo.state === 'round_discussion' ? (
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden relative z-20">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between items-center">
                            <span>Avaliações da Rodada</span>
                            <span className="text-cyan-400">Selecione até 3 para o telão ({selectedEvals.length}/3)</span>
                        </div>
                        <div className="flex-1 overflow-y-auto grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 pr-2">
                            {activePlayers.map(pid => {
                                const subKey = `r${gameInfo.currentRound}_${pid}`;
                                const ev = evaluations[subKey];
                                const pConfig = STUDENTS.find(t=>t.id===pid);
                                if (!ev) return null;
                                const isSelected = selectedEvals.includes(pid);
                                return (
                                    <div key={pid} onClick={() => {
                                        if (isSelected) setSelectedEvals(prev => prev.filter(id => id !== pid));
                                        else if (selectedEvals.length < 3) setSelectedEvals(prev => [...prev, pid]);
                                    }} className={`cursor-pointer p-5 rounded-2xl border backdrop-blur-md transition-all flex flex-col ${isSelected ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-2 ring-indigo-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-sm uppercase tracking-widest" style={{ color: pConfig?.color }}>{pConfig?.name}</span>
                                            <span className="font-mono text-cyan-400 font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">Nota: {ev.score}</span>
                                        </div>
                                        <div className="text-sm text-slate-200 italic flex-1 mb-4 leading-relaxed font-medium">"{ev.funComment}"</div>
                                        <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-black mb-1">Ponto Forte</div>
                                        <div className="text-xs text-emerald-100/70 mb-3">{ev.strongPoint}</div>
                                        <div className="text-[10px] text-rose-400 uppercase tracking-widest font-black">Atenção</div>
                                        <div className="text-xs text-rose-100/70">{ev.weakPoint}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* PROFESSOR IA MULTI PANEL */}
                        {selectedEvals.length > 0 && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-indigo-950 to-blue-900/50 rounded-2xl border border-indigo-500/50 p-6 flex flex-col gap-6 shadow-2xl mt-auto relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/30 pb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400 shrink-0">
                                           <Activity className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <h4 className="text-indigo-300 font-black text-sm uppercase tracking-widest">Destaques da Rodada</h4>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] text-indigo-400/70 uppercase tracking-widest font-bold mr-2">Legenda de Interações:</span>
                                        {INTERACTION_TYPES.map(inter => (
                                            <Tooltip key={inter.id} content={inter.tooltip}>
                                                <button type="button" className="text-[10px] uppercase font-bold tracking-widest bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg cursor-help hover:bg-indigo-900 transition-colors whitespace-nowrap">
                                                    {inter.title}
                                                </button>
                                            </Tooltip>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={`grid gap-6 relative z-10 ${selectedEvals.length === 1 ? 'grid-cols-1' : selectedEvals.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                    <AnimatePresence>
                                    {selectedEvals.map(pid => {
                                        const ev = evaluations[`r${gameInfo.currentRound}_${pid}`];
                                        const pConfig = STUDENTS.find(t=>t.id===pid);
                                        if (!ev) return null;
                                        return (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={pid} className="flex flex-col gap-3 bg-black/40 p-5 rounded-xl border border-indigo-500/20 backdrop-blur-md shadow-inner">
                                                <span className="font-bold text-xs uppercase tracking-widest" style={{ color: pConfig?.color }}>{pConfig?.name}</span>
                                                <p className="text-indigo-100 font-medium italic text-[15px] leading-relaxed">
                                                    "{ev.funComment}"
                                                </p>
                                                <div className="mt-auto pt-4 border-t border-indigo-500/20">
                                                    <p className="text-indigo-300 text-[10px] uppercase tracking-widest font-black mb-1">Debate:</p>
                                                    <p className="text-indigo-100/70 text-xs leading-relaxed mb-4">{ev.discussionPrompt}</p>


                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 relative flex overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>
                        <div className="p-8 w-full h-full relative z-20 flex flex-wrap gap-4 overflow-y-auto content-start">
                           {roundConfig?.options?.map((opt, index) => {
                               const oNum = index + 1;
                               return (
                               <div key={opt.id} className="bg-white/5 border border-white/5 w-64 rounded-xl p-4 flex flex-col justify-between relative shadow-inner backdrop-blur-sm transition-colors group hover:bg-white/10 hover:border-white/20 shrink-0">
                                  <div className="flex flex-col gap-1 z-10 relative">
                                    <span className="text-slate-600 text-3xl opacity-30 font-black tracking-tighter absolute -top-2 -right-2 pointer-events-none group-hover:opacity-50 transition-opacity">#{oNum}</span>
                                    <h4 className="text-white font-bold text-sm tracking-tight leading-tight pr-6">{opt.title}</h4>
                                    <span className="text-[9px] text-cyan-400/80 tracking-widest font-bold line-clamp-2" title={opt.tooltip}>{opt.tooltip}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-4 relative z-10 min-h-4">
                                      {activePlayers.map(pid => {
                                          const subKey = `r${gameInfo.currentRound}_${pid}`;
                                          const sub = submissions[subKey];
                                          let matched = false;
                                          if (sub && sub.mainOption) {
                                              if (Array.isArray(sub.mainOption)) {
                                                  matched = sub.mainOption.includes(opt.id);
                                              } else if (typeof sub.mainOption === 'object') {
                                                  matched = (sub.mainOption[opt.id] || 0) > 0;
                                              } else {
                                                  matched = sub.mainOption === opt.id;
                                              }
                                          }
                                          if (matched) {
                                              return (
                                                <div key={pid} className="w-5 h-5 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)] flex items-center justify-center font-bold text-[8px] text-white overflow-hidden" style={{ backgroundColor: STUDENTS.find(t=>t.id===pid)?.color }} title={STUDENTS.find(t=>t.id===pid)?.name}>
                                                   {typeof sub.mainOption === 'object' && !Array.isArray(sub.mainOption) ? sub.mainOption[opt.id] : ''}
                                                </div>
                                              );
                                          }
                                          return null;
                                      })}
                                  </div>
                               </div>
                           )})}
                           <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <h2 className="text-slate-100/5 font-black text-6xl rotate-[-5deg] select-none uppercase italic tracking-tighter mix-blend-overlay">DISTRITO<br/>ENTRE-MARÉS</h2>
                           </div>
                        </div>
                    </div>
                )}

             </div>

             {/* RIGHT PANEL - RANKING */}
             <div className="w-1/3 flex flex-col gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl flex-1 rounded-2xl border border-white/10 p-6 flex flex-col shadow-2xl">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <Trophy className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold tracking-tight">Ranking Ativo</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {activePlayers
                            .sort((a, b) => (playerData[b].score || 0) - (playerData[a].score || 0))
                            .map((pid, index) => {
                            const config = STUDENTS.find(t => t.id === pid);
                            const pData = playerData[pid];
                            const rnk = getRank(pData?.exp || 0);
                            const subKey = `r${gameInfo.currentRound}_${pid}`;
                            const hasSubmitted = !!submissions[subKey];

                            return (
                                <motion.div 
                                    layout 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={pid} 
                                    onContextMenu={(e) => handleContextMenu(e, pid)}
                                    // simple touch support for long press (mobile)
                                    // in a real app, you'd use a dedicated library or a timer for exact long-press
                                    className={`rounded-xl p-4 relative backdrop-blur-md transition-all duration-300 border cursor-context-menu ${
                                        index === 0 
                                            ? 'bg-gradient-to-r from-indigo-900/40 to-cyan-900/10 border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/20' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    {index === 0 && (
                                        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit transform shadow-lg shadow-cyan-500/30 flex items-center gap-1 z-10">
                                            <Trophy className="w-3 h-3" /> Líder
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white border shadow-inner ${
                                                index === 0 ? 'bg-cyan-500/20 border-cyan-400/50' : 'bg-white/10 border-white/20'
                                            }`} style={{ color: index === 0 ? '#22d3ee' : config?.color }}>
                                                {index + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg leading-none mt-1" style={{ color: config?.color }}>{config?.name}</span>
                                                    {gameInfo.state !== 'lobby' && (
                                                        hasSubmitted ? (
                                                            <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md mt-1" title="Jogada Recebida">
                                                                <Target className="w-3 h-3" />
                                                                <span className="text-[9px] uppercase tracking-widest font-black leading-none mt-0.5">OK</span>
                                                            </div>
                                                        ) : gameInfo.state === 'round_active' ? (
                                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse mt-1" title="Aguardando jogada" />
                                                        ) : null
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{rnk.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <motion.div 
                                                key={pData?.score || 0}
                                                initial={{ scale: 1.2, color: '#4ade80' }}
                                                animate={{ scale: 1, color: index === 0 ? '#22d3ee' : '#38bdf8' }}
                                                transition={{ duration: 0.5 }}
                                                className={`text-xl font-mono font-bold ${index === 0 ? 'text-cyan-400' : 'text-sky-400'}`}
                                            >
                                                {pData?.score || 0} pts
                                            </motion.div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/10 pt-3 uppercase tracking-widest font-bold">
                                        <span className={`px-2 py-1 rounded text-slate-300 ${index === 0 ? 'bg-cyan-900/40 text-cyan-200' : 'bg-white/10'}`}>{rnk.name}</span>
                                        {gameInfo.state === 'round_active' && (
                                            <span className={hasSubmitted ? 'text-cyan-400' : 'text-slate-500'}>
                                                {hasSubmitted ? 'Jogada Solta' : 'Pensando...'}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
             </div>
          </div>
      )}
      {/* CONTEXT MENU */}
      <AnimatePresence>
          {contextMenu && (
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ top: contextMenu.y, left: contextMenu.x }}
                  className="fixed z-[9999] w-48 bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col py-1"
              >
                  <button 
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
                      onClick={() => alert(`Ver detalhes do aluno ${STUDENTS.find(s=>s.id === contextMenu.pid)?.name}`)}
                  >
                      <Eye className="w-4 h-4 text-cyan-400" /> Ver Detalhes
                  </button>
                  <button 
                      className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors cursor-pointer"
                      onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}?pid=${contextMenu.pid}`;
                          navigator.clipboard.writeText(url);
                          setContextMenu(null);
                          alert('Link copiado para a área de transferência!');
                      }}
                  >
                      <Share2 className="w-4 h-4 text-indigo-400" /> Compartilhar
                  </button>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
