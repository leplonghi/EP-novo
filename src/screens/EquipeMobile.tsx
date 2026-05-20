import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGame } from '../store/GameContext';
import { STUDENTS, ROUNDS, CONDITIONALS, getRank } from '../data/gameData';
import { ChevronDown, Send, Shield, Zap, AlertTriangle, HelpCircle, Map, Target, Trophy, ArrowRight, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Tooltip } from '../components/Tooltip';

function TutorialModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  
  const STEPS = [
    {
      title: "A Cidade é de Todos",
      icon: <Map className="w-16 h-16 text-cyan-400 mb-4 mx-auto" />,
      desc: "Todos atuam na mesma cidade, mas os problemas mudam a cada rodada. O seu objetivo é apresentar a melhor solução para os problemas apresentados."
    },
    {
      title: "Zonas Diferentes, Mesma Batalha",
      icon: <Target className="w-16 h-16 text-rose-400 mb-4 mx-auto" />,
      desc: "Você não disputa apenas com quem escolhe a mesma Zona. A IA julga quem fez o melhor uso dos recursos, independente da zona escolhida! Você pode focar onde seu projeto brilha mais."
    },
    {
      title: "IA e Ranking",
      icon: <Trophy className="w-16 h-16 text-amber-400 mb-4 mx-auto" />,
      desc: "Suas decisões e justificativas são avaliadas pela Inteligência Artificial. Interaja com colegas, defenda sua tese e acumule XP para subir de ranking!"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute right-4 top-4 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>
        
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none"></div>

        <div className="pt-8 text-center min-h-[280px] flex flex-col">
           <AnimatePresence mode="wait">
             <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                {STEPS[step].icon}
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{STEPS[step].title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{STEPS[step].desc}</p>
             </motion.div>
           </AnimatePresence>
           
           <div className="mt-auto pt-8 flex items-center justify-between">
              <div className="flex gap-2">
                 {STEPS.map((_, i) => (
                    <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-cyan-400' : 'w-2 bg-white/20'}`} />
                 ))}
              </div>
              
              <button 
                onClick={() => {
                   if (step < STEPS.length - 1) setStep(step + 1);
                   else onClose();
                }}
                className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-bold text-sm tracking-wide capitalize flex items-center gap-2 hover:bg-slate-200"
              >
                 {step < STEPS.length - 1 ? (
                   <>Próximo <ArrowRight className="w-4 h-4" /></>
                 ) : (
                   "Entendi"
                 )}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function EquipeMobile() {
  const { gameInfo, playerData, myPlayerId, submitAnswer, submissions, sendInteraction, startGame, evaluations, evaluateAll, nextRound } = useGame();
  const navigate = useNavigate();
  
  const [showTutorial, setShowTutorial] = useState(false);
  
  React.useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenTutorial');
    if (!hasSeen) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);
  
  React.useEffect(() => {
    if (gameInfo.state === 'lobby') {
      startGame();
    }
  }, [gameInfo.state, startGame]);

  if (!myPlayerId) {
    return <div className="text-white p-4">Aguardando login...</div>;
  }

  const pConfig = STUDENTS.find(t => t.id === myPlayerId);
  const data = playerData[myPlayerId];
  const rank = getRank(data?.exp || 0);
  const roundConfig = ROUNDS.find(r => r.id === gameInfo.currentRound);
  const conditional = CONDITIONALS.find(c => c.id === gameInfo.conditionalId);
  
  const subKey = `r${gameInfo.currentRound}_${myPlayerId}`;
  const hasSubmitted = !!submissions[subKey];

  // Form states
  const [mainOption, setMainOption] = useState<any>([]);
  const [justification, setJustification] = useState('');
  
  useEffect(() => {
     setJustification('');
     if (roundConfig?.mechanic === 'pick_combo' || roundConfig?.mechanic === 'pick_problem') {
         setMainOption([]); // string[] for selections
     } else if (roundConfig?.mechanic === 'distribute_tokens') {
         setMainOption({}); // record for token distribution
     } else {
         setMainOption('');
     }
  }, [gameInfo.currentRound, roundConfig?.mechanic, roundConfig?.id]);
  


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainOption || !justification) return alert("Preencha tudo");
    
    if (roundConfig?.mechanic === 'pick_combo' || roundConfig?.mechanic === 'pick_problem') {
        const required = roundConfig.mechanic === 'pick_problem' ? 3 : 2;
        if (!Array.isArray(mainOption) || mainOption.length !== required) {
            return alert(`Selecione exatamente ${required} opções.`);
        }
    }
    
    if (roundConfig?.mechanic === 'distribute_tokens') {
        let total = 0;
        Object.values(mainOption).forEach((val: any) => total += (Number(val) || 0));
        if (total !== 10) {
            return alert("Distribua exatamente 10 fichas.");
        }
    }
    
    submitAnswer({ zone: "Terreno do Projeto", mainOption, justification });
  };



  if (gameInfo.state === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: pConfig?.color }}>
                <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold mb-2 text-center text-slate-900">{pConfig?.name}</h2>
            <p className="text-sky-600 mb-8 uppercase tracking-widest text-xs font-black">{rank.name}</p>
            <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="mt-8 text-sm text-slate-500 font-bold tracking-widest uppercase text-center">Iniciando partida...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-slate-800 font-sans relative overflow-hidden">
       {/* MOBILE HEADER */}
       <div className="p-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-3xl shadow-lg border-4 border-white bg-gradient-to-br from-sky-500 to-purple-600 flex flex-col items-center justify-center text-white border-b-8 border-b-sky-700/50">
                 <span className="font-black text-2xl">#{myPlayerId.replace('s', '').replace('test_user', 'U')}</span>
                 <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex flex-col">
                 <div className="text-[10px] text-sky-600 font-bold uppercase tracking-widest leading-none mb-1">Calouro da Calçada</div>
                 <div className="font-extrabold text-slate-900 text-lg leading-tight">{pConfig?.name}</div>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={() => setShowTutorial(true)} className="p-2 rounded-full bg-sky-100 text-sky-600 shadow-sm hover:bg-sky-200 transition-colors">
                  <HelpCircle className="w-6 h-6" />
              </button>
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl border-4 border-sky-100 flex flex-col items-center justify-center p-2">
                  <div className="text-3xl font-extrabold text-sky-600 leading-none">{data?.score || 0}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Score</div>
              </div>
          </div>
       </div>

       {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

       {roundConfig && (
           <div className="flex-1 p-5 pb-24 relative z-10 overflow-auto">
               
               {/* Progress bar */}
               <div className="flex items-center justify-between mb-6">
                   <div className="px-4 py-2 bg-sky-500 text-white font-bold rounded-2xl text-xs uppercase shadow-md border-b-4 border-sky-700">
                       Fase {roundConfig.id} de 5
                   </div>
                   <div className="flex items-center gap-2">
                       {[1, 2, 3, 4, 5].map((i) => (
                           <div key={i} className={`w-3 h-3 rounded-full ${i <= (roundConfig.id || 0) ? 'bg-sky-500' : 'bg-slate-200'}`}></div>
                       ))}
                   </div>
                   <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase bg-white px-3 py-1 rounded-full shadow-sm">
                       <Target className="w-4 h-4" /> Diagnóstico
                   </div>
               </div>

               {/* Mission HEADER AREA */}
               <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm border border-sky-100 flex items-center gap-4">
                   <div className="w-20 h-20 bg-sky-100 rounded-2xl flex items-center justify-center shrink-0">
                       <span className="text-5xl">🔍</span>
                   </div>
                   <div>
                       <h1 className="text-3xl font-extrabold text-sky-900 mb-1 tracking-tight">{roundConfig.title}</h1>
                       <p className="text-slate-500 text-sm leading-relaxed border-l-4 border-sky-300 pl-3 italic">"{roundConfig.subtitle}"</p>
                   </div>
               </div>

               {conditional && roundConfig.id > 1 && (
                   <motion.div 
                       initial={{ opacity: 0, y: -20 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-3xl p-6 mb-8 flex gap-4 items-start shadow-sm"
                   >
                       <AlertTriangle className="w-10 h-10 text-rose-500 shrink-0 mt-1" />
                       <div className="relative z-10 w-full">
                           <div className="font-black text-rose-600 text-[10px] uppercase tracking-[0.2em] mb-2">Condicionante Ativa</div>
                           <div className="font-extrabold text-rose-950 text-lg mb-2 tracking-tight">{conditional.title}</div>
                           <div className="text-sm text-rose-800 leading-relaxed font-medium bg-white/50 p-3 rounded-xl border border-rose-200">{conditional.tooltip}</div>
                       </div>
                   </motion.div>
               )}

               {!hasSubmitted ? (
                   <form onSubmit={handleSubmit} className="space-y-6">
                       
                       {/* MECHANIC SELECT */}
                       <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 space-y-4">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-sky-500 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center text-sm">1</span>
                                Sua Área de Intervenção
                            </label>
                            
                            {(roundConfig.mechanic === 'pick_combo' || roundConfig.mechanic === 'pick_problem') && (
                                <p className="text-sm text-sky-600 font-medium bg-sky-50 p-3 rounded-xl border border-sky-100">
                                    {roundConfig.mechanic === 'pick_problem' 
                                        ? "Selecione exatamente 3 alternativas para o diagnóstico inicial."
                                        : "Selecione exatamente 2 alternativas."}
                                </p>
                            )}
                           
                           {roundConfig.mechanic === 'pick_combo' || roundConfig.mechanic === 'pick_problem' ? (
                               <div className="grid grid-cols-1 gap-2">
                                   {roundConfig.options?.map(o => {
                                       const isSelected = Array.isArray(mainOption) && mainOption.includes(o.id);
                                       return (
                                           <motion.div key={o.id}
                                               initial={{ opacity: 0, y: 10 }}
                                               animate={{ opacity: 1, y: 0 }}
                                               whileHover={{ scale: 1.01 }}
                                               whileTap={{ scale: 0.98 }}
                                               onClick={() => {
                                               if (isSelected) {
                                                   setMainOption((prev: any) => prev.filter((id: string) => id !== o.id));
                                               } else {
                                                   if (Array.isArray(mainOption) && mainOption.length < (roundConfig.mechanic === 'pick_problem' ? 3 : 2)) {
                                                       setMainOption((prev: any) => [...prev, o.id]);
                                                   }
                                               }
                                           }} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${isSelected ? 'bg-sky-50 border-sky-400 shadow-inner' : 'bg-white border-sky-100 hover:border-sky-200'}`}>
                                               <div className="flex items-center justify-between">
                                                   <span className="font-bold text-slate-800 text-sm">{o.title}</span>
                                                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-sky-500 border-sky-600' : 'bg-white border-slate-200'}`}>
                                                       {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                   </div>
                                               </div>
                                               <div className="text-xs text-slate-500 mt-2 pr-6">{o.tooltip}</div>
                                           </motion.div>
                                       );
                                   })}
                                   <div className="text-right text-[10px] text-cyan-400/80 font-mono mt-1">{(Array.isArray(mainOption) ? mainOption.length : 0)}/{roundConfig.mechanic === 'pick_problem' ? 3 : 2} opções selecionadas</div>
                               </div>
                           ) : roundConfig.mechanic === 'distribute_tokens' ? (
                                <div className="space-y-2">
                                   {roundConfig.options?.map(o => (
                                       <div key={o.id} className="flex items-center justify-between bg-sky-50 p-4 rounded-2xl border border-sky-100">
                                            <div className="flex-1 pr-4">
                                                <div className="font-bold text-slate-800 text-sm mb-1">{o.title}</div>
                                                <div className="text-[11px] text-slate-500 leading-tight">{o.tooltip}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => {
                                                    const cur = (mainOption || {})[o.id] || 0;
                                                    if (cur > 0) setMainOption((prev: any) => ({ ...prev, [o.id]: cur - 1 }));
                                                }} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sky-600 border border-sky-200 hover:bg-sky-100 font-bold shadow-sm">-</button>
                                                <div className="w-8 text-center font-extrabold text-sky-700 text-lg">{(mainOption || {})[o.id] || 0}</div>
                                                <button type="button" onClick={() => {
                                                    const cur = (mainOption || {})[o.id] || 0;
                                                    let total = 0;
                                                    Object.values(mainOption || {}).forEach((v: any) => total += v);
                                                    if (total < 10) setMainOption((prev: any) => ({ ...prev, [o.id]: cur + 1 }));
                                                }} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sky-600 border border-sky-200 hover:bg-sky-100 font-bold shadow-sm">+</button>
                                            </div>
                                       </div>
                                   ))}
                                   {(() => {
                                       let total = 0;
                                       Object.values(mainOption || {}).forEach((v: any) => total += v);
                                       return (
                                           <div className={`text-right text-[10px] font-mono mt-2 font-bold ${total === 10 ? 'text-emerald-400' : 'text-cyan-400/80'}`}>{total}/10 fichas utilizadas</div>
                                       );
                                   })()}
                               </div>
                           ) : (
                                <>
                               <div className="relative">
                                   <select value={mainOption as string} onChange={e=>setMainOption(e.target.value)} required={roundConfig.mechanic !== 'distribute_tokens' && roundConfig.mechanic !== 'pick_combo'}
                                     className="w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-4 appearance-none focus:ring-1 focus:ring-cyan-500 focus:outline-none">
                                       <option value="" disabled className="bg-slate-900 text-slate-100">Ponderar e selecionar...</option>
                                       {roundConfig.options?.map(o => <option key={o.id} value={o.id} className="bg-slate-900 text-slate-100">{o.title}</option>)}
                                   </select>
                                   <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-500 pointer-events-none" />
                               </div>
                               {mainOption && (
                                   <div className="mt-2 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30 text-xs text-cyan-100/90 leading-relaxed">
                                       {roundConfig.options?.find(o => o.id === mainOption)?.tooltip}
                                   </div>
                               )}
                               </>
                           )}
                       </div>

                       {/* JUSTIFICATION */}
                       <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-100 space-y-4">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 font-extrabold flex items-center justify-center text-lg">2</div>
                               <label className="text-xs font-black uppercase tracking-[0.2em] text-pink-800">
                                   Sua Defesa Técnica
                               </label>
                           </div>
                           <textarea value={justification} onChange={e=>setJustification(e.target.value)} required maxLength={180}
                             placeholder="A IA será rigorosa. Por que essa é a melhor decisão urbana considerando o contexto?"
                             className="w-full bg-white border-2 border-pink-100 rounded-2xl p-4 min-h-32 focus:ring-2 focus:ring-pink-200 focus:outline-none resize-none placeholder:text-slate-400 text-slate-800"
                           />
                           <div className="text-right text-[11px] text-slate-400 tracking-widest font-bold">{justification.length}/180 caracteres</div>
                       </div>

                       <button type="submit" className="w-full py-5 bg-sky-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-lg shadow-sky-200 hover:bg-sky-400 transition-all flex justify-center items-center gap-2 border-b-4 border-sky-700 active:border-b-0 active:translate-y-1">
                           SUBMETER AO CONSELHO <Send className="w-5 h-5" />
                       </button>

                   </form>
               ) : (
                   <div className="space-y-8">
                       <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                           {(evaluations[`r${gameInfo.currentRound}_${myPlayerId}`] && evaluations[`r${gameInfo.currentRound}_${myPlayerId}`]._loading) ? (
                               <div className="flex flex-col items-center py-8">
                                   <div className="relative w-24 h-24 mb-6">
                                       <div className="absolute inset-0 border-8 border-slate-800 rounded-full"></div>
                                       <div className="absolute inset-0 border-8 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                                       <div className="absolute inset-0 flex items-center justify-center">
                                           <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                                       </div>
                                   </div>
                                   <h3 className="font-black text-cyan-400 text-2xl mb-2 tracking-tight uppercase">O Professor está lendo...</h3>
                                   <p className="text-sm text-cyan-100/70 text-center px-4 animate-pulse">A Inteligência Artificial (Prof. Longhi) está lendo sua justificativa com uma xícara de café...</p>
                                   
                                   <div className="w-full bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                                       <div className="bg-cyan-500 h-full animate-[progress_2s_ease-in-out_infinite]"></div>
                                   </div>
                               </div>
                           ) : evaluations[`r${gameInfo.currentRound}_${myPlayerId}`] && !evaluations[`r${gameInfo.currentRound}_${myPlayerId}`]._loading ? (
                               <>
                                   <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
                                       <Zap className="w-8 h-8" />
                                   </div>
                                   <h3 className="font-bold text-emerald-400 text-lg mb-2 tracking-tight italic">Feedback do Professor!</h3>
                                   <div className="bg-slate-900/50 border border-emerald-900/30 p-4 rounded-xl mb-6 relative">
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                                        </div>
                                        <p className="text-sm text-emerald-100/90 italic font-mono">"{evaluations[`r${gameInfo.currentRound}_${myPlayerId}`].funComment}"</p>
                                   </div>
                                   
                                   <div className="text-left space-y-4 mb-6">
                                       <div>
                                           <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-black mb-1">Ponto Forte</div>
                                           <div className="text-sm text-slate-300 bg-slate-900/30 p-3 rounded-lg border-l-2 border-emerald-500">{evaluations[`r${gameInfo.currentRound}_${myPlayerId}`].strongPoint}</div>
                                       </div>
                                       <div>
                                           <div className="text-[10px] text-rose-400 uppercase tracking-widest font-black mb-1">Atenção</div>
                                           <div className="text-sm text-slate-300 bg-slate-900/30 p-3 rounded-lg border-l-2 border-rose-500">{evaluations[`r${gameInfo.currentRound}_${myPlayerId}`].weakPoint}</div>
                                       </div>
                                   </div>

                                   <button onClick={() => nextRound(gameInfo.conditionalId)} className="w-full py-4 mt-2 bg-emerald-500 text-slate-900 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:-translate-y-1 transition-all">
                                       Próxima Rodada
                                   </button>
                               </>
                           ) : (
                               <div className="flex flex-col items-center">
                               </div>
                           )}
                       </div>


                   </div>
               )}
           </div>
       )}
    </div>
  );
}
