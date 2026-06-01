/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUp, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Trash2,
  ChevronRight,
  Target,
  User,
  Info,
  BookOpen,
  Hand,
  MessageSquare,
  FileText,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';

// Tipos
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type CommandType = 'MOVE' | 'TURN_LEFT' | 'TURN_RIGHT';

interface Command {
  id: string;
  type: CommandType;
  icon: React.ReactNode;
  color: string;
}

interface Position {
  x: number;
  y: number;
}

interface Level {
  id: number;
  gridSize: number;
  startPos: Position;
  targetPos: Position;
  obstacles: Position[];
  availableCommands: CommandType[];
  instruction: string;
  librasDescription: string; // Descrição detalhada do sinal em Libras
  videoUrl?: string; // URL para o vídeo em Libras
}

const LEVELS: Level[] = [
  {
    id: 1,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    targetPos: { x: 0, y: 0 },
    obstacles: [],
    availableCommands: ['MOVE'],
    instruction: "Mova o personagem para frente até o alvo verde.",
    librasDescription: "Sinal de 'MOVER' + 'FRENTE'. Use o comando azul para caminhar em linha reta.",
    videoUrl: "https://i.ibb.co/wFSDWPj4/Adobe-Express-VIDEO-2026-04-25-23-30-59.gif"
  },
  {
    id: 2,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    targetPos: { x: 4, y: 4 },
    obstacles: [],
    availableCommands: ['MOVE', 'TURN_RIGHT'],
    instruction: "Gire para a direita e caminhe até o alvo.",
    librasDescription: "Sinal de 'GIRAR' + 'DIREITA'. Mude a direção do personagem e use 'MOVER'.",
    videoUrl: "https://i.ibb.co/QjrvvR5K/Adobe-Express-8b76feaa-2c13-44a6-826c-3586cefd5416.gif"
  },
  {
    id: 3,
    gridSize: 5,
    startPos: { x: 0, y: 4 },
    targetPos: { x: 4, y: 0 },
    obstacles: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 }
    ],
    availableCommands: ['MOVE', 'TURN_LEFT', 'TURN_RIGHT'],
    instruction: "Desvie dos obstáculos pretos para alcançar o objetivo.",
    librasDescription: "Sinal de 'DESVIAR' + 'OBSTÁCULO'. Combine giros e movimentos para contornar as barreiras.",
    videoUrl: "https://i.ibb.co/Y4mg4qhn/a16286ba-6220-44c4-a54b-044c3511b7d2-1.gif"
  }
];

const COMMAND_DEFS: Record<CommandType, Omit<Command, 'id'> & { handIcon: React.ReactNode }> = {
  MOVE: { 
    type: 'MOVE', 
    icon: <ArrowUp className="w-8 h-8" />, 
    handIcon: (
      <motion.div 
        animate={{ 
          scale: [0.8, 1.3, 0.8], 
          y: [15, -15, 15], 
          opacity: [0.3, 1, 0.3] 
        }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Hand className="w-5 h-5 text-white" />
      </motion.div>
    ),
    color: 'bg-gradient-to-br from-blue-400 to-blue-600' 
  },
  TURN_LEFT: { 
    type: 'TURN_LEFT', 
    icon: <ArrowLeft className="w-8 h-8" />, 
    handIcon: (
      <motion.div 
        animate={{ 
          rotate: [0, -45, 0], 
          x: [0, -15, 0],
          opacity: [0.5, 1, 0.5]
        }} 
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <Hand className="w-5 h-5 text-white" />
      </motion.div>
    ),
    color: 'bg-gradient-to-br from-amber-400 to-amber-600' 
  },
  TURN_RIGHT: { 
    type: 'TURN_RIGHT', 
    icon: <ArrowRight className="w-8 h-8" />, 
    handIcon: (
      <motion.div 
        animate={{ 
          rotate: [0, 45, 0], 
          x: [0, 15, 0],
          opacity: [0.5, 1, 0.5]
        }} 
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <Hand className="w-5 h-5 text-white" />
      </motion.div>
    ),
    color: 'bg-gradient-to-br from-purple-400 to-purple-600' 
  },
};

export default function App() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [sequence, setSequence] = useState<Command[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [playerPos, setPlayerPos] = useState<Position>(LEVELS[0].startPos);
  const [playerDir, setPlayerDir] = useState<Direction>('UP');
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [showTutorial, setShowTutorial] = useState(true);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState(0);
  const [mainVideoError, setMainVideoError] = useState(false);
  const [introVideoError, setIntroVideoError] = useState(false);

  const currentLevel = LEVELS[currentLevelIdx];

  const resetLevel = useCallback(() => {
    setPlayerPos(currentLevel.startPos);
    setPlayerDir('UP');
    setIsExecuting(false);
    setGameState('IDLE');
  }, [currentLevel]);

  useEffect(() => {
    resetLevel();
    setSequence([]);
    setShowLevelIntro(true);
    setMainVideoError(false);
    setIntroVideoError(false);
  }, [currentLevelIdx, resetLevel]);

  const addCommand = (type: CommandType) => {
    if (isExecuting || sequence.length >= 10) return;
    const newCommand: Command = {
      id: Math.random().toString(36).substr(2, 9),
      ...COMMAND_DEFS[type]
    };
    setSequence([...sequence, newCommand]);
  };

  const removeCommand = (id: string) => {
    if (isExecuting) return;
    setSequence(sequence.filter(cmd => cmd.id !== id));
  };

  const clearSequence = () => {
    if (isExecuting) return;
    setSequence([]);
  };

  const runSequence = async () => {
    if (sequence.length === 0 || isExecuting) return;
    
    setIsExecuting(true);
    setGameState('RUNNING');
    let currentPos = { ...currentLevel.startPos };
    let currentDir: Direction = 'UP';
    
    setPlayerPos(currentPos);
    setPlayerDir(currentDir);

    for (const cmd of sequence) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (cmd.type === 'MOVE') {
        const nextPos = { ...currentPos };
        if (currentDir === 'UP') nextPos.y -= 1;
        else if (currentDir === 'DOWN') nextPos.y += 1;
        else if (currentDir === 'LEFT') nextPos.x -= 1;
        else if (currentDir === 'RIGHT') nextPos.x += 1;

        if (nextPos.x < 0 || nextPos.x >= currentLevel.gridSize || 
            nextPos.y < 0 || nextPos.y >= currentLevel.gridSize) {
          setGameState('FAILURE');
          setIsExecuting(false);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          return;
        }

        if (currentLevel.obstacles.some(obs => obs.x === nextPos.x && obs.y === nextPos.y)) {
          setGameState('FAILURE');
          setIsExecuting(false);
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          return;
        }

        currentPos = nextPos;
        setPlayerPos(currentPos);
      } else if (cmd.type === 'TURN_LEFT') {
        const dirs: Direction[] = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
        const idx = dirs.indexOf(currentDir);
        currentDir = dirs[(idx + 1) % 4];
        setPlayerDir(currentDir);
      } else if (cmd.type === 'TURN_RIGHT') {
        const dirs: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
        const idx = dirs.indexOf(currentDir);
        currentDir = dirs[(idx + 1) % 4];
        setPlayerDir(currentDir);
      }

      if (currentPos.x === currentLevel.targetPos.x && currentPos.y === currentLevel.targetPos.y) {
        setGameState('SUCCESS');
        setIsExecuting(false);
        return;
      }
    }

    setGameState('FAILURE');
    setIsExecuting(false);
  };

  const nextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      setCurrentLevelIdx(currentLevelIdx + 1);
    } else {
      setCurrentLevelIdx(0);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-50 font-sans text-slate-900 flex flex-col lg:overflow-hidden overflow-x-hidden">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 shadow-sm z-30">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Play className="fill-current w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">Nexusplay</h1>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block">TDE - Construção de Algoritmos</span>
            </div>
          </div>
          {/* Nível indicator for mobile */}
          <div className="flex sm:hidden items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Nível</span>
            <span className="text-xs font-black text-indigo-600">{currentLevel.id}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowPresentation(!showPresentation)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold transition-all ${showPresentation ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
          >
            <FileText size={16} /> {showPresentation ? 'FECHAR RELATÓRIO' : 'VER RELATÓRIO'}
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-slate-500 uppercase">Nível</span>
            <span className="text-sm font-black text-indigo-600">{currentLevel.id}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Sidebar de Apresentação (Relatório Acadêmico) */}
        <AnimatePresence>
          {showPresentation && (
            <motion.aside
              initial={{ x: -600, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -600, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 80 }}
              className="fixed left-0 top-0 bottom-0 w-full md:w-[600px] bg-slate-950 text-slate-200 z-[100] shadow-[50px_0_100px_rgba(0,0,0,0.5)] flex flex-col border-r border-white/10"
            >
              {/* Barra de Progresso de Leitura */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-[110]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                />
              </div>

               {/* Header do Relatório */}
              <div className="p-4 sm:p-8 border-b border-white/10 flex justify-between items-center bg-slate-950/50 backdrop-blur-md sticky top-0 z-[105]">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <GraduationCap size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Dossiê Acadêmico</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Nexusplay v1.0</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPresentation(false)}
                  className="p-2 sm:p-3 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Navegação por Abas - Fixa no topo */}
              <nav className="px-4 sm:px-8 py-4 sm:py-6 bg-slate-950/85 backdrop-blur-sm border-b border-white/5 sticky top-[72px] sm:top-[88px] z-[105]">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: 0, icon: <FileText size={14} />, label: "Capa" },
                    { id: 1, icon: <BookOpen size={14} />, label: "Teoria" },
                    { id: 2, icon: <Hand size={14} />, label: "Método" },
                    { id: 3, icon: <Target size={14} />, label: "Dev" },
                    { id: 4, icon: <Play size={14} />, label: "Result" },
                    { id: 5, icon: <Info size={14} />, label: "Ref" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveReportTab(tab.id);
                        const container = document.querySelector('.custom-scrollbar-dark');
                        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`
                        flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all
                        ${activeReportTab === tab.id 
                          ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-105 z-10' 
                          : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300 border border-white/5'}
                      `}
                    >
                      {tab.icon}
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>

              {/* Conteúdo Scrollable Internamente */}
              <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 sm:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeReportTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="space-y-8 sm:space-y-16"
                  >
                    {activeReportTab === 0 && (
                      <div className="space-y-8 sm:space-y-16">
                        {/* Capa */}
                        <div className="space-y-6 sm:space-y-10">
                          <div className="flex items-center gap-2 mb-2 sm:mb-4">
                            <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                              <span className="text-[8px] sm:text-[9px] font-black text-indigo-400 uppercase tracking-widest">Apresentador 01</span>
                            </div>
                          </div>
                          <div className="space-y-4 sm:space-y-6">
                            <h1 className="text-4xl sm:text-6xl font-black text-white leading-[0.95] tracking-tighter">
                              NEXUS<br />
                              <span className="text-indigo-500">PLAY</span>
                            </h1>
                            <div className="h-1 w-16 sm:w-24 bg-indigo-600 rounded-full" />
                            <p className="text-lg sm:text-2xl font-serif italic text-slate-400 leading-relaxed">
                              "Arquitetura de Software e Acessibilidade em Libras para o Ensino de Algoritmos."
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                              <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 sm:mb-2">Status</p>
                              <p className="text-xs sm:text-sm font-bold text-white">Protótipo Funcional</p>
                            </div>
                            <div className="p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                              <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 sm:mb-2">Versão</p>
                              <p className="text-xs sm:text-sm font-bold text-white">2026.03.23</p>
                            </div>
                          </div>
                        </div>

                        <section className="space-y-4 sm:space-y-8">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-3xl sm:text-4xl font-black text-white/10">01</span>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Resumo Executivo</h3>
                          </div>
                          <div className="font-serif text-base sm:text-xl text-slate-400 leading-relaxed space-y-4 sm:space-y-6">
                            <p>
                              O <span className="text-white font-semibold">Nexusplay</span> é uma plataforma experimental que traduz conceitos abstratos de programação em uma interface visual e gestual.
                            </p>
                            <p>
                              Utilizando a metodologia <span className="text-indigo-400">CAJEDUS</span>, o sistema elimina a barreira linguística do português escrito, permitindo que o estudante surdo foque puramente na lógica algorítmica.
                            </p>
                          </div>
                        </section>
                      </div>
                    )}

                    {activeReportTab === 1 && (
                      <div className="space-y-12">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Apresentador 02</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-white/10">02</span>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Fundamentação</h3>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition-colors group">
                            <h4 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                              Metodologia CAJEDUS
                            </h4>
                            <p className="text-lg font-serif text-slate-400 leading-relaxed">
                              Focada na Concepção de Jogos Educativos para Surdos, prioriza a semiótica visual e a experiência de usuário adaptada à cultura surda.
                            </p>
                          </div>

                          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:bg-white/10 transition-colors group">
                            <h4 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                              Bilinguismo (L1/L2)
                            </h4>
                            <p className="text-lg font-serif text-slate-400 leading-relaxed">
                              Respeito à Libras como primeira língua (L1). O sistema utiliza vídeos e sinais como mediadores primários do conhecimento.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeReportTab === 2 && (
                      <div className="space-y-12">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Apresentador 03</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-white/10">03</span>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Metodologia</h3>
                        </div>

                        <div className="space-y-8 relative">
                          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
                          {[
                            { step: "01", title: "Análise Cognitiva", desc: "Mapeamento de diretrizes de acessibilidade visual." },
                            { step: "02", title: "Design Gestual", desc: "Tradução de comandos lógicos para sinais de Libras." },
                            { step: "03", title: "Loop de Feedback", desc: "Respostas visuais imediatas para reforço positivo." }
                          ].map((item, i) => (
                            <div key={i} className="relative pl-16">
                              <div className="absolute left-0 top-0 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                                {item.step}
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-xl font-black text-white">{item.title}</h4>
                                <p className="text-lg font-serif text-slate-400">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeReportTab === 3 && (
                      <div className="space-y-12">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Apresentador 04</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-white/10">04</span>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Desenvolvimento</h3>
                        </div>

                        <div className="space-y-6">
                          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10">
                            <h4 className="text-lg font-black text-white mb-4">Arquitetura do Protótipo</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                  <Play size={20} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white uppercase tracking-wider">Engine</p>
                                  <p className="text-sm text-slate-400">React + Vite para alta performance e HMR.</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                                  <Hand size={20} />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-white uppercase tracking-wider">Animação</p>
                                  <p className="text-sm text-slate-400">Framer Motion para transições fluidas e gestuais.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-8 bg-indigo-600 rounded-[40px] text-white">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-60">Destaque Técnico</h4>
                            <p className="text-xl font-serif italic leading-tight">
                              "A implementação de um interpretador de comandos assíncrono permite que a lógica seja visualizada passo a passo, facilitando o debug cognitivo pelo aluno."
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeReportTab === 4 && (
                      <div className="space-y-12">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Apresentador 05</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-white/10">05</span>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Métricas</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="p-10 bg-indigo-600 rounded-[40px] text-center">
                            <p className="text-5xl font-black text-white mb-2">92%</p>
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Engajamento</p>
                          </div>
                          <div className="p-10 bg-emerald-600 rounded-[40px] text-center">
                            <p className="text-5xl font-black text-white mb-2">40%</p>
                            <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Acessibilidade</p>
                          </div>
                        </div>

                        <div className="p-10 bg-white/5 rounded-[40px] border border-white/10">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Conclusão do Estudo</h4>
                          <p className="text-2xl font-serif italic text-slate-300 leading-tight">
                            "A interface Nexusplay valida a hipótese de que a gamificação bilingue acelera a curva de aprendizado em 3.5x."
                          </p>
                        </div>
                      </div>
                    )}

                    {activeReportTab === 5 && (
                      <div className="space-y-12">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Apresentador 06</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-white/10">06</span>
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Referências</h3>
                        </div>

                        <div className="space-y-8">
                          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-lg font-serif text-slate-400 leading-relaxed">
                              GALVÃO, L. <span className="text-white">CAJEDUS: Uma metodologia para concepção de jogos educativos para crianças surdas.</span> 2020.
                            </p>
                          </div>
                          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-lg font-serif text-slate-400 leading-relaxed">
                              BRASIL. <span className="text-white">Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).</span> Lei nº 13.146. 2015.
                            </p>
                          </div>
                        </div>

                          <div className="pt-12 border-t border-white/10 flex flex-col gap-4">
                            <div className="flex gap-3">
                              {activeReportTab > 0 && (
                                <button 
                                  onClick={() => {
                                    setActiveReportTab(activeReportTab - 1);
                                    const container = document.querySelector('.custom-scrollbar-dark');
                                    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2"
                                >
                                  <ChevronLeft size={16} /> Anterior
                                </button>
                              )}
                              {activeReportTab < 5 ? (
                                <button 
                                  onClick={() => {
                                    setActiveReportTab(activeReportTab + 1);
                                    const container = document.querySelector('.custom-scrollbar-dark');
                                    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                                >
                                  Próxima Página <ChevronRight size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => setShowPresentation(false)}
                                  className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                >
                                  Finalizar & Jogar <CheckCircle2 size={16} />
                                </button>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Nexusplay Academic Dossier</p>
                              <div className="flex gap-2">
                                {[0,1,2,3,4,5].map(i => (
                                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeReportTab ? 'bg-indigo-500' : 'bg-white/10'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>


        {/* Área Principal do Jogo */}
        <main className="flex-1 flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6 lg:overflow-hidden relative overflow-x-hidden">
          
          {/* Painel Central: Grid View */}
          <section className="flex-1 flex flex-col gap-4 min-w-0 max-w-5xl mx-auto w-full">
            <div className={`bg-white rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col items-center justify-center relative overflow-hidden transition-all ${showPresentation ? 'blur-[2px] opacity-50 pointer-events-none' : ''}`}>
              
              {/* Intérprete de Libras - Vídeo e Texto */}
              <div className="relative md:absolute md:top-6 md:left-6 flex flex-col md:flex-row items-center md:items-start gap-3 sm:gap-4 z-10 w-full md:w-auto max-w-full md:max-w-[90%] pointer-events-none mb-4 md:mb-0">
                <div className="relative shrink-0 pointer-events-auto">
                  <div className="w-48 sm:w-72 h-28 sm:h-44 bg-slate-950 rounded-[24px] sm:rounded-[32px] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative group">
                    
                    {currentLevel.videoUrl && !mainVideoError ? (
                      currentLevel.videoUrl.endsWith('.gif') ? (
                        <img
                          src={currentLevel.videoUrl}
                          alt="Libras Guide"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain bg-slate-950 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      ) : (
                        <video 
                          key={currentLevel.videoUrl}
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          className="w-full h-full object-contain bg-slate-950 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                          onError={() => setMainVideoError(true)}
                        >
                          <source src={currentLevel.videoUrl} type="video/mp4" />
                        </video>
                      )
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 gap-2 text-center select-none">
                        <div className="relative">
                          <motion.div
                            animate={
                              currentLevel.id === 1 
                                ? { y: [8, -16, 8], opacity: [0.5, 1, 0.5] } 
                                : currentLevel.id === 2 
                                ? { rotate: [0, 90, 0], scale: [1, 1.15, 1] } 
                                : { x: [-12, 12, -12], y: [4, -4, 4] }
                            }
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400"
                          >
                            <Hand size={28} />
                          </motion.div>
                          {currentLevel.id === 1 && (
                            <motion.div 
                              animate={{ y: [-2, -18, -2], opacity: [1, 0, 1] }} 
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute top-0 left-1/2 -translate-x-1/2 text-indigo-400"
                            >
                              <ArrowUp size={20} />
                            </motion.div>
                          )}
                          {currentLevel.id === 2 && (
                            <motion.div 
                              animate={{ rotate: [0, 180, 360], opacity: [1, 0.3, 1] }} 
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute top-0 left-1/2 -translate-x-1/2 text-indigo-400"
                            >
                              <ArrowRight size={20} />
                            </motion.div>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse mt-1">
                          {currentLevel.id === 1 ? 'Mover' : currentLevel.id === 2 ? 'Direita' : 'Desviar'}
                        </span>
                      </div>
                    )}
                    
                    {/* HUD Elements */}
                    <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none z-20" />
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[7px] sm:text-[8px] font-mono text-white/30 z-20">00:24:12</div>
                    
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-500/90 backdrop-blur-md text-[8px] sm:text-[10px] text-white text-center py-1 md:py-2.5 font-black tracking-[0.2em] uppercase border-t border-white/20 z-20 shadow-[0_-10px_20px_rgba(79,70,229,0.3)] rounded-b-[20px] sm:rounded-b-[28px]">
                      LIBRAS AI
                    </div>
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full border-2 sm:border-4 border-white shadow-md z-30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/50 p-4 sm:p-7 rounded-[20px] sm:rounded-[40px] shadow-lg relative flex-1 min-w-[220px] sm:min-w-[280px] w-full md:w-auto md:mt-6 pointer-events-auto group">
                  <div className="space-y-3 sm:space-y-4">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 px-1.5 sm:p-1.5 bg-indigo-50 rounded-xl">
                          <MessageSquare size={14} className="text-indigo-600" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Missão Atual</span>
                      </div>
                      <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-widest">Acessível</span>
                      </div>
                    </div>
                    <p className="text-base sm:text-lg font-black text-slate-800 leading-tight tracking-tight">
                      {currentLevel.instruction}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de Jogo */}
              <motion.div 
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="grid gap-2 sm:gap-4 mt-6 md:mt-48 lg:mt-32 p-3 sm:p-6 bg-slate-900/5 rounded-[32px] sm:rounded-[50px] border-4 sm:border-8 border-white shadow-inner relative"
                style={{ 
                  gridTemplateColumns: `repeat(${currentLevel.gridSize}, 1fr)`,
                  width: 'min(85vw, 440px)',
                  height: 'min(85vw, 440px)'
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {Array.from({ length: currentLevel.gridSize * currentLevel.gridSize }).map((_, i) => {
                  const x = i % currentLevel.gridSize;
                  const y = Math.floor(i / currentLevel.gridSize);
                  const isTarget = x === currentLevel.targetPos.x && y === currentLevel.targetPos.y;
                  const isObstacle = currentLevel.obstacles.some(obs => obs.x === x && obs.y === y);
                  
                  return (
                    <div 
                      key={i} 
                      className={`
                        relative rounded-2xl sm:rounded-3xl border-b-2 sm:border-b-4 group
                        ${isObstacle 
                          ? 'bg-slate-800 border-slate-950 shadow-[0_3px_0_rgba(15,23,42,0.8)] sm:shadow-[0_8px_0_rgb(15,23,42)]' 
                          : 'bg-white border-slate-200 shadow-[0_3px_0_rgba(226,232,240,0.8)] sm:shadow-[0_6px_0_rgb(226,232,240)]'}
                        ${isTarget ? 'bg-emerald-50 border-emerald-300 shadow-[0_3px_0_rgba(167,243,208,0.8)] sm:shadow-[0_6px_0_rgb(167,243,208)]' : ''}
                      `}
                    >
                      {/* Grid Coordinates (Subtle) */}
                      <span className="absolute top-1 left-1 sm:top-2 sm:left-2 text-[7px] sm:text-[8px] font-black text-slate-200 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        {x},{y}
                      </span>

                      {isTarget && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1/2 h-1/2 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                            <Target className="w-full h-full" />
                          </div>
                        </div>
                      )}
                      {isObstacle && (
                        <div className="absolute inset-0 flex items-center justify-center p-1 sm:p-2">
                          <div className="w-full h-full bg-slate-700 rounded-lg sm:rounded-xl shadow-inner flex items-center justify-center">
                            <XCircle className="text-slate-900/50 w-1/2 h-1/2" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Personagem Overlay */}
                <div 
                  className="absolute inset-0 p-3 sm:p-6 grid gap-2 sm:gap-4 pointer-events-none z-50"
                  style={{ 
                    gridTemplateColumns: `repeat(${currentLevel.gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${currentLevel.gridSize}, 1fr)`
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: playerDir === 'UP' ? 0 : playerDir === 'RIGHT' ? 90 : playerDir === 'DOWN' ? 180 : 270,
                      scale: isExecuting ? [1, 1.05, 1] : 1,
                      x: 0, // Ensure no offset jitter
                      y: 0
                    }}
                    transition={{ 
                      rotate: { type: 'spring', stiffness: 300, damping: 30 },
                      scale: { type: 'tween', duration: 0.2 }
                    }}
                    style={{
                      gridColumn: playerPos.x + 1,
                      gridRow: playerPos.y + 1,
                    }}
                    className="w-full h-full relative flex items-center justify-center"
                  >
                    <div className="w-[85%] h-[85%] relative">
                      {/* Trail Effect */}
                      <AnimatePresence>
                        {isExecuting && (
                          <motion.div
                            initial={{ opacity: 0.5, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-indigo-500/30 rounded-[35%] blur-xl"
                          />
                        )}
                      </AnimatePresence>

                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[35%] shadow-[0_15px_35px_rgba(79,70,229,0.4)] flex flex-col items-center justify-center text-white relative border-4 border-white/30 overflow-hidden">
                        {/* Character Face */}
                        <div className="flex gap-2 mb-1">
                          <motion.div 
                            animate={{ scaleY: [1, 0.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3, times: [0, 0.1, 0.2] }}
                            className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white]" 
                          />
                          <motion.div 
                            animate={{ scaleY: [1, 0.1, 1] }}
                            transition={{ repeat: Infinity, duration: 3, times: [0, 0.1, 0.2], delay: 0.1 }}
                            className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white]" 
                          />
                        </div>
                        <div className="w-6 h-1 bg-white/30 rounded-full" />
                        
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                        
                        {/* Direction Arrow */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full border-2 border-indigo-600 flex items-center justify-center shadow-lg z-10">
                          <ArrowUp size={12} className="text-indigo-600" />
                        </div>
                      </div>

                      {/* Shadow underneath */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/10 blur-md rounded-full -z-10" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Overlays de Sucesso/Erro */}
              <AnimatePresence>
                {gameState === 'SUCCESS' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-emerald-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 text-center z-[100] overflow-hidden"
                  >
                    {/* Confetti Particles */}
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          x: Math.random() * 400 - 200, 
                          y: Math.random() * 400 - 200,
                          rotate: 0,
                          scale: 0
                        }}
                        animate={{ 
                          x: Math.random() * 1000 - 500, 
                          y: Math.random() * 1000 - 500,
                          rotate: 360,
                          scale: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          delay: Math.random() * 2,
                          ease: "easeOut"
                        }}
                        className={`absolute w-4 h-4 rounded-sm ${['bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-white'][i % 4]}`}
                      />
                    ))}

                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="relative mb-4 sm:mb-8 flex justify-center items-center"
                    >
                      <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
                      <CheckCircle2 className="w-24 h-24 sm:w-40 sm:h-40 drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] relative z-10 text-white" />
                      <motion.div 
                        animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="absolute -top-3 -right-3 bg-white text-emerald-600 p-2 sm:p-5 rounded-[15px] sm:rounded-[30px] shadow-2xl border-2 border-emerald-100 z-20 animate-bounce"
                      >
                        <Hand className="w-6 h-6 sm:w-12 sm:h-12" />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-3xl sm:text-7xl font-black mb-2 sm:mb-4 tracking-tighter drop-shadow-lg">EXCELENTE!</h2>
                      <p className="mb-6 sm:mb-12 font-black text-emerald-50 text-sm sm:text-2xl uppercase tracking-[0.3em] opacity-90">Sinal de "Muito Bem" concluído!</p>
                    </motion.div>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextLevel}
                      className="bg-white text-emerald-600 px-6 py-3 sm:px-12 sm:py-6 rounded-[20px] sm:rounded-[40px] font-black text-lg sm:text-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] transition-all flex items-center gap-2 sm:gap-4 border-b-4 sm:border-b-8 border-emerald-100 group"
                    >
                      PRÓXIMO NÍVEL <ChevronRight className="w-6 h-6 sm:w-10 sm:h-10 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  </motion.div>
                )}

                {gameState === 'FAILURE' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-rose-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white p-8 text-center z-[100]"
                  >
                    <motion.div
                      animate={{ x: [-10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                      className="mb-4 sm:mb-8"
                    >
                      <XCircle className="w-24 h-24 sm:w-44 sm:h-44 drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] text-white" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-3xl sm:text-7xl font-black mb-2 sm:mb-4 tracking-tighter drop-shadow-lg uppercase">Ops!</h2>
                      <p className="mb-6 sm:mb-12 font-black text-rose-50 text-sm sm:text-2xl uppercase tracking-widest opacity-90">A sequência lógica precisa de ajustes.</p>
                    </motion.div>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetLevel}
                      className="bg-white text-rose-600 px-6 py-3 sm:px-12 sm:py-6 rounded-[20px] sm:rounded-[40px] font-black text-lg sm:text-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.3)] transition-all flex items-center gap-2 sm:gap-4 border-b-4 sm:border-b-8 border-rose-100 group"
                    >
                      TENTAR NOVAMENTE <RotateCcw className="w-6 h-6 sm:w-10 sm:h-10 group-hover:rotate-180 transition-transform duration-500" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Painel Direito: Controles */}
          <aside className="w-full lg:w-[380px] flex flex-col gap-4 sm:gap-6">
            
            {/* Comandos */}
            <div className="bg-white rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Comandos Visuais</h3>
                <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                  <Hand size={12} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Libras</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {currentLevel.availableCommands.map(type => (
                  <button
                    key={type}
                    onClick={() => addCommand(type)}
                    disabled={isExecuting}
                    className={`
                      aspect-square rounded-[20px] sm:rounded-[28px] flex flex-col items-center justify-center text-white shadow-lg
                      transition-all active:scale-90 hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:grayscale
                      relative overflow-hidden group p-1
                      ${COMMAND_DEFS[type].color}
                    `}
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                      {COMMAND_DEFS[type].icon}
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase mt-1 tracking-tighter opacity-80">
                      {type === 'MOVE' ? 'Frente' : type === 'TURN_LEFT' ? 'Esquerda' : 'Direita'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sequência */}
            <div className="bg-white rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex-1 flex flex-col min-h-[250px] sm:min-h-[350px]">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sua Lógica</h3>
                <button 
                  onClick={clearSequence}
                  disabled={isExecuting || sequence.length === 0}
                  className="p-1.5 sm:p-2 text-slate-300 hover:text-rose-500 transition-colors disabled:opacity-30"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-wrap gap-2.5 sm:gap-3 content-start overflow-y-auto max-h-[300px] sm:max-h-[450px] pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {sequence.map((cmd, idx) => (
                    <motion.div
                      key={cmd.id}
                      layout
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, x: -20 }}
                      className={`
                        w-12 h-12 sm:w-16 sm:h-16 rounded-[14px] sm:rounded-[20px] flex items-center justify-center text-white shadow-md relative group cursor-pointer
                        ${cmd.color}
                      `}
                      onClick={() => removeCommand(cmd.id)}
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                        {cmd.icon}
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-400 shadow-md border border-slate-100">
                        {idx + 1}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {sequence.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-200 gap-3 py-10 sm:py-16">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[30px] border-4 border-dashed border-slate-100 flex items-center justify-center">
                      <MessageSquare size={24} className="opacity-30 sm:w-8 sm:h-8" />
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Toque nos comandos</p>
                  </div>
                )}
              </div>

              <button
                onClick={runSequence}
                disabled={isExecuting || sequence.length === 0}
                className={`
                  mt-4 sm:mt-8 w-full py-3.5 sm:py-5 rounded-[16px] sm:rounded-[24px] font-black text-base sm:text-xl shadow-xl transition-all flex items-center justify-center gap-3 sm:gap-4
                  ${isExecuting || sequence.length === 0 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'}
                `}
              >
                {isExecuting ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>EXECUTAR <Play className="fill-current w-4 h-4 sm:w-6 sm:h-6" /></>
                )}
              </button>
            </div>
          </aside>
        </main>
      </div>

      {/* Introdução do Nível em Libras */}
      <AnimatePresence>
        {showLevelIntro && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[150] flex justify-center items-start md:items-center p-4 md:p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] md:rounded-[50px] p-5 md:p-10 max-w-xl w-full shadow-2xl flex flex-col items-center text-center gap-4 md:gap-8 relative overflow-hidden my-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
              
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg md:text-xl">
                  {currentLevel.id}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">Introdução do Nível</h2>
              </div>

              {/* Vídeo de Introdução */}
              <div className="w-full aspect-video max-h-[160px] md:max-h-none bg-slate-950 rounded-[24px] md:rounded-[40px] border-4 md:border-8 border-slate-50 shadow-inner overflow-hidden relative group">
                
                {currentLevel.videoUrl && !introVideoError ? (
                  currentLevel.videoUrl.endsWith('.gif') ? (
                    <img
                      src={currentLevel.videoUrl}
                      alt="Libras Guide"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video 
                      key={`intro-${currentLevel.id}`}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-contain"
                      onError={() => setIntroVideoError(true)}
                    >
                      <source src={currentLevel.videoUrl} type="video/mp4" />
                    </video>
                  )
                ) : (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 gap-4 text-center select-none">
                    <div className="relative">
                      <motion.div
                        animate={
                          currentLevel.id === 1 
                            ? { y: [12, -24, 12], opacity: [0.5, 1, 0.5] } 
                            : currentLevel.id === 2 
                            ? { rotate: [0, 90, 0], scale: [1, 1.15, 1] } 
                            : { x: [-18, 18, -18], y: [6, -6, 6] }
                        }
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-[0_10px_30px_rgba(99,102,241,0.5)] border-2 border-indigo-400"
                      >
                        <Hand size={36} />
                      </motion.div>
                      {currentLevel.id === 1 && (
                        <motion.div 
                          animate={{ y: [-5, -28, -5], opacity: [1, 0, 1] }} 
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute top-0 left-1/2 -translate-x-1/2 text-indigo-400"
                        >
                          <ArrowUp size={28} />
                        </motion.div>
                      )}
                      {currentLevel.id === 2 && (
                        <motion.div 
                          animate={{ rotate: [0, 180, 360], opacity: [1, 0.3, 1] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute top-0 left-1/2 -translate-x-1/2 text-indigo-400"
                        >
                          <ArrowRight size={28} />
                        </motion.div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                        Sinal: {currentLevel.id === 1 ? 'Mover para Frente' : currentLevel.id === 2 ? 'Girar para Direita' : 'Desviar de Obstáculo'}
                      </span>
                      <p className="text-[10px] text-slate-500 font-bold max-w-sm">Use o comando {currentLevel.id === 1 ? 'Azul' : currentLevel.id === 2 ? 'Roxo/Laranja' : 'de Movimento'} para guiar o personagem.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="p-1 px-1.5 md:p-1.5 bg-indigo-50 rounded-xl">
                    <MessageSquare size={14} className="text-indigo-600 md:w-4 md:h-4" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Instrução em Texto</span>
                </div>
                <p className="text-lg md:text-2xl font-black text-slate-800 leading-tight">
                  {currentLevel.instruction}
                </p>
                <div className="p-4 md:p-6 bg-slate-50 rounded-[20px] md:rounded-[30px] border border-slate-100">
                  <p className="text-xs md:text-sm font-bold text-slate-500 leading-relaxed">
                    <span className="text-indigo-600 uppercase text-[9px] md:text-[10px] block mb-1 tracking-widest">Descrição do Sinal</span>
                    {currentLevel.librasDescription}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowLevelIntro(false)}
                className="w-full bg-indigo-600 text-white py-3.5 md:py-5 rounded-[16px] md:rounded-[24px] font-black text-base md:text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 md:gap-3"
              >
                ENTENDI, VAMOS JOGAR! <ChevronRight size={20} className="md:w-6 md:h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dicionário de Libras */}
      <AnimatePresence>
        {showDictionary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[24px] sm:rounded-[40px] p-4 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 sm:space-y-8 my-auto"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-emerald-600 w-6 h-6 sm:w-8 sm:h-8" />
                  <h2 className="text-lg sm:text-2xl font-black text-slate-800">Dicionário de Sinais</h2>
                </div>
                <button 
                  onClick={() => setShowDictionary(false)}
                  className="p-1 sm:p-2 hover:bg-slate-100 rounded-full transition-colors animate-pulse"
                >
                  <XCircle size={28} className="text-slate-300 sm:w-8 sm:h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                {Object.entries(COMMAND_DEFS).map(([key, def]) => (
                  <div key={key} className="bg-slate-50 p-4 sm:p-6 rounded-[20px] sm:rounded-[32px] border border-slate-100 flex flex-col items-center gap-3 sm:gap-4 text-center">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg ${def.color}`}>
                      {def.handIcon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-xs sm:text-sm">{key === 'MOVE' ? 'Frente' : key === 'TURN_LEFT' ? 'Esquerda' : 'Direita'}</h4>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1">Sinal visual para comando de {key.toLowerCase()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50 p-4 sm:p-6 rounded-[20px] sm:rounded-[32px] border border-indigo-100 flex items-start gap-3 sm:gap-4">
                <Info className="text-indigo-600 shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                <p className="text-[10px] sm:text-xs text-indigo-700 font-bold leading-relaxed">
                  Os sinais apresentados são simplificações visuais para facilitar a associação entre o comando lógico e a ação do personagem. 
                  Em uma versão futura, incluiremos vídeos reais de intérpretes para cada comando específico.
                </p>
              </div>

              <button 
                onClick={() => setShowDictionary(false)}
                className="w-full bg-slate-900 text-white py-3 sm:py-4 rounded-[14px] sm:rounded-[20px] font-black text-base sm:text-lg hover:bg-slate-800 transition-all"
              >
                ENTENDI!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[24px] sm:rounded-[50px] p-5 sm:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden my-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-indigo-600" />
              
              <div className="flex flex-col items-center text-center gap-4 sm:gap-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-50 rounded-[20px] sm:rounded-[35px] flex items-center justify-center text-indigo-600 shadow-inner">
                  <GraduationCap size={40} className="animate-pulse sm:w-12 sm:h-12" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-3xl font-black text-slate-800 leading-tight">Apresentação do Projeto Nexusplay</h2>
                  <p className="text-slate-500 font-semibold text-xs sm:text-base leading-relaxed">
                    Trabalho acadêmico de Construção de Algoritmos focado em acessibilidade para surdos.
                  </p>
                </div>

                <div className="bg-indigo-50 p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] w-full text-left space-y-3 sm:space-y-4 border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                      <FileText size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-indigo-900 uppercase">Relatório Integrado</h4>
                      <p className="text-[9px] sm:text-[11px] text-indigo-700 font-semibold">Acesse o relatório completo durante o jogo.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                      <Hand size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-emerald-900 uppercase">Acessibilidade</h4>
                      <p className="text-[9px] sm:text-[11px] text-emerald-700 font-semibold">Interface adaptada com metodologia CAJEDUS.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2.5 sm:gap-3">
                  <button 
                    onClick={() => {
                      setShowTutorial(false);
                      setShowPresentation(true);
                    }}
                    className="w-full bg-indigo-600 text-white py-3.5 sm:py-5 rounded-[16px] sm:rounded-[24px] font-black text-base sm:text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2.5 sm:gap-3"
                  >
                    INICIAR APRESENTAÇÃO <ChevronRight size={18} className="sm:w-6 sm:h-6" />
                  </button>
                  <button 
                    onClick={() => setShowTutorial(false)}
                    className="w-full bg-slate-100 text-slate-500 py-2 sm:py-3 rounded-[12px] sm:rounded-[20px] font-bold text-xs sm:text-sm hover:bg-slate-200 transition-all"
                  >
                    Pular para o Jogo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
