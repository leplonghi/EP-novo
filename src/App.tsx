/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router';
import { GameProvider, useGame } from './store/GameContext';
import { STUDENTS } from './data/gameData';
import React, { useState } from 'react';

// Placeholders for screens
function Lobby() {
  const { joinAsProfessor, joinAsPlayer } = useGame();
  const navigate = useNavigate();
  const [studentSelection, setStudentSelection] = useState('');
  
  const handleProf = async () => {
    // Automatically join the main blitz-1 room
    await joinAsProfessor('blitz-1');
    navigate('/professor');
  };

  const handlePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentSelection) {
      const ok = await joinAsPlayer(studentSelection);
      if (ok) navigate('/equipe');
    } else {
      alert('Selecione seu nome.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/40 p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl relative z-10">
        <h1 className="font-display text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] bg-clip-text text-transparent text-center mb-2 tracking-tighter italic">
          ENTRE-MARÉS
        </h1>
        <p className="text-center text-slate-400 font-medium mb-8 uppercase tracking-widest text-sm">A Cidade Viva</p>
        
        <button onClick={handleProf} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl mb-8 font-medium transition-colors border border-white/10 text-slate-200">
          Entrar como Professor
        </button>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">OU ENTRAR NO JOGO</span>
            <div className="flex-grow border-t border-white/10"></div>
        </div>

        <form onSubmit={handlePlayer} className="space-y-4">
          <select 
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none font-medium backdrop-blur-md"
            value={studentSelection} onChange={e => setStudentSelection(e.target.value)} required>
            <option value="" disabled>Selecione seu nome...</option>
            {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <button type="submit" className="w-full py-4 bg-cyan-500 hover:bg-white rounded-xl font-black text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all uppercase tracking-widest mt-4">
            CONECTAR
          </button>
        </form>
      </div>
      <p className="mt-8 text-xs text-slate-600 uppercase tracking-widest relative z-10">UNDB | ESPAÇOS PÚBLICOS</p>
    </div>
  );
}

import ProfessorDashboard from './screens/ProfessorDashboard';
import EquipeMobile from './screens/EquipeMobile';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/professor" element={<ProfessorDashboard />} />
          <Route path="/equipe" element={<EquipeMobile />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}
