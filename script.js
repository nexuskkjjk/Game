const niveis = [
  {
    id: 1,
    tamanhoGrid: 5,
    posInicio: { x: 0, y: 4 },
    posAlvo: { x: 0, y: 0 },
    obstaculos: [],
    comandosDisponiveis: ['MOVER'],
    instrucao: "Mova o personagem para frente até o alvo verde.",
    descricaoLibras: "Sinal de 'MOVER' para caminhar em linha reta.",
    videoUrl: "https://i.ibb.co/wFSDWPj4/Adobe-Express-VIDEO-2026-04-25-23-30-59.gif"
  },
  {
    id: 2,
    tamanhoGrid: 5,
    posInicio: { x: 0, y: 4 },
    posAlvo: { x: 4, y: 4 },
    obstaculos: [],
    comandosDisponiveis: ['MOVER', 'GIRAR_DIREITA'],
    instrucao: "Gire para a direita e caminhe até o alvo.",
    descricaoLibras: "Sinaleira de 'GIRAR DIREITA' para mudar a orientação do personagem, em seguida 'MOVER'.",
    videoUrl: "https://i.ibb.co/QjrvvR5K/Adobe-Express-8b76feaa-2c13-44a6-826c-3586cefd5416.gif"
  },
  {
    id: 3,
    tamanhoGrid: 5,
    posInicio: { x: 0, y: 4 },
    posAlvo: { x: 4, y: 0 },
    obstaculos: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 }
    ],
    comandosDisponiveis: ['MOVER', 'GIRAR_ESQUERDA', 'GIRAR_DIREITA'],
    instrucao: "Desvie dos blocos de obstáculo pretos para alcançar o objetivo.",
    descricaoLibras: "Combine giros inteligentes de esquerda/direita e passos em linha reta.",
    videoUrl: "https://i.ibb.co/Y4mg4qhn/a16286ba-6220-44c4-a54b-044c3511b7d2-1.gif"
  }
];

const definiuComandos = {
  MOVER: {
    nome: "Frente",
    colorClass: "bg-btn-mover",
    icon: "arrow-up",
  },
  GIRAR_ESQUERDA: {
    nome: "Esquerda",
    colorClass: "bg-btn-girar-esquerda",
    icon: "arrow-left",
  },
  GIRAR_DIREITA: {
    nome: "Direita",
    colorClass: "bg-btn-girar-direita",
    icon: "arrow-right",
  }
};

const SynthAudio = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      try {
        this.ctx.resume();
      } catch(e) {}
    }
  },
  playClick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  },
  playRemove() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  },
  playStep() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.setValueAtTime(500, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  },
  playRotate() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  },
  playWin() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const playTone = (freq, start, duration) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, now, 0.15);      // C5
      playTone(659.25, now + 0.1, 0.15);  // E5
      playTone(783.99, now + 0.2, 0.15);  // G5
      playTone(1046.50, now + 0.3, 0.3); // C6
    } catch (e) {}
  },
  playLose() {
    try {
      this.init();
      const now = this.ctx.currentTime;
      const playTone = (freq, start, duration) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.linearRampToValueAtTime(freq - 100, start + duration);
        gain.gain.setValueAtTime(0.05, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(220, now, 0.25);      // A3
      playTone(165, now + 0.18, 0.4);  // E3
    } catch (e) {}
  }
};

let indiceNivelAtual = 0;
let sequencia = [];
let estaExecutando = false;
let posicaoJogador = { x: 0, y: 4 };
let direcaoJogador = 'UP';

const selectNiveis = document.getElementById('level-selector');
const containerGrid = document.getElementById('grid-container');
const containerSequencia = document.getElementById('sequence-container');
const gridComandosSelect = document.getElementById('command-selector-grid');
const tagInstrucao = document.getElementById('instrucao-game');
const tagDescricaoLibras = document.getElementById('libras-descricao');
const imgLibrasWidget = document.getElementById('libras-animator');
const btnExecutar = document.getElementById('btn-execute-sequence');

window.addEventListener('DOMContentLoaded', () => {
  carregarNiveisDropdown();
  carregarNivel(0);
});

function carregarNiveisDropdown() {
  if (!selectNiveis) return;
  selectNiveis.innerHTML = '';
  niveis.forEach((lvl, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = `${lvl.id}`;
    if (index === indiceNivelAtual) {
      opt.selected = true;
    }
    selectNiveis.appendChild(opt);
  });
}

function selecionarNivel(index) {
  if (estaExecutando) return;
  carregarNivel(parseInt(index));
}

function carregarNivel(index, skipIntro = false) {
  indiceNivelAtual = index;
  if (selectNiveis) {
    selectNiveis.value = index;
  }
  
  const nivel = niveis[indiceNivelAtual];
  posicaoJogador = { ...nivel.posInicio };
  direcaoJogador = 'UP';
  sequencia = [];
  estaExecutando = false;

  if (tagInstrucao) tagInstrucao.textContent = nivel.instrucao;
  if (tagDescricaoLibras) tagDescricaoLibras.textContent = nivel.descricaoLibras;
  if (imgLibrasWidget) imgLibrasWidget.src = nivel.videoUrl || '';

  renderizarGrid(true);
  renderizarListaComandosDisponiveis();
  renderizarSequencia();
  atualizarBotoes();

  if (!skipIntro) {
    const modalT = document.getElementById('modal-tutorial');
    const isTutorialVisible = modalT && !modalT.classList.contains('hidden');
    if (!isTutorialVisible) {
      abrirLevelIntro();
    }
  }
}

function renderizarGrid(forceRebuild = false) {
  if (!containerGrid) return;
  const nivel = niveis[indiceNivelAtual];
  
  const totalCellsNeeded = nivel.tamanhoGrid * nivel.tamanhoGrid;
  const currentUnitCount = containerGrid.querySelectorAll('.grid-unit').length;
  
  if (forceRebuild || currentUnitCount !== totalCellsNeeded) {
    containerGrid.style.gridTemplateColumns = `repeat(${nivel.tamanhoGrid}, minmax(0, 1fr))`;
    containerGrid.style.gridTemplateRows = `repeat(${nivel.tamanhoGrid}, minmax(0, 1fr))`;
    
    // Clear everything except elements we want to keep (such as the persistent player token if any)
    const oldCells = containerGrid.querySelectorAll('.grid-unit');
    oldCells.forEach(el => el.remove());

    for (let y = 0; y < nivel.tamanhoGrid; y++) {
      for (let x = 0; x < nivel.tamanhoGrid; x++) {
        const cell = document.createElement('div');
        cell.className = `grid-unit cell-${x}-${y}`;
        
        const isObstaculo = nivel.obstaculos.some(o => o.x === x && o.y === y);
        const isAlvo = nivel.posAlvo.x === x && nivel.posAlvo.y === y;
        const isInicio = nivel.posInicio.x === x && nivel.posInicio.y === y;

        if (isObstaculo) {
          cell.classList.add("grid-unit-obstacle");
          cell.innerHTML = `<i data-lucide="x-circle"></i>`;
        } else if (isAlvo) {
          cell.classList.add("grid-unit-target");
          cell.innerHTML = `
            <div class="target-glow-ring"></div>
            <div class="target-inner-core">
              <div class="target-inner-dot"></div>
            </div>
          `;
        } else if (isInicio) {
          cell.classList.add("grid-unit-start-base");
          cell.innerHTML = `<span class="start-indicator-label">Início</span>`;
        }

        containerGrid.appendChild(cell);
      }
    }
  }

  // Draw or update the player token
  atualizarPosicaoJogador();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function atualizarPosicaoJogador() {
  if (!containerGrid) return;
  const nivel = niveis[indiceNivelAtual];
  
  let playerToken = document.getElementById('player-token');
  if (!playerToken) {
    playerToken = document.createElement('div');
    playerToken.id = 'player-token';
    playerToken.className = 'player-sprite-wrapper';
    playerToken.style.position = 'absolute';
    playerToken.style.zIndex = '50';
    playerToken.style.boxShadow = '0 12px 24px -4px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2)';
    playerToken.style.borderRadius = 'var(--radius-md)';
    playerToken.style.transition = 'left 0.35s cubic-bezier(0.25, 1, 0.5, 1), top 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
    containerGrid.appendChild(playerToken);
  }

  const rotationClasses = {
    UP: "rotate-0",
    RIGHT: "rotate-90",
    DOWN: "rotate-180",
    LEFT: "rotate-minus-90"
  };

  // set classes for rotation animation
  playerToken.className = `player-sprite-wrapper ${rotationClasses[direcaoJogador]}`;
  
  playerToken.innerHTML = `
    <i data-lucide="arrow-up" style="width: 24px; height: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2))"></i>
    <span class="player-sprite-label" style="font-size: 10px; font-weight: 800; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.05em;">Robô</span>
  `;

  const targetCell = containerGrid.querySelector(`.cell-${posicaoJogador.x}-${posicaoJogador.y}`);
  if (targetCell) {
    const align = () => {
      playerToken.style.left = `${targetCell.offsetLeft}px`;
      playerToken.style.top = `${targetCell.offsetTop}px`;
      playerToken.style.width = `${targetCell.offsetWidth}px`;
      playerToken.style.height = `${targetCell.offsetHeight}px`;
    };
    align();
    setTimeout(align, 50);
  }
}

function renderizarListaComandosDisponiveis() {
  if (!gridComandosSelect) return;
  const nivel = niveis[indiceNivelAtual];
  gridComandosSelect.innerHTML = '';

  nivel.comandosDisponiveis.forEach(cmdType => {
    const cmdDef = definiuComandos[cmdType];
    const btn = document.createElement('button');
    btn.className = `cmd-block-btn ${cmdDef.colorClass}`;
    btn.onclick = () => adicionarComando(cmdType);
    btn.innerHTML = `
      <i data-lucide="${cmdDef.icon}"></i>
      <span>${cmdDef.nome}</span>
    `;
    gridComandosSelect.appendChild(btn);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function adicionarComando(cmdType) {
  if (estaExecutando || sequencia.length >= 10) return;
  SynthAudio.playClick();
  sequencia.push({
    id: Math.random().toString(36).substring(2, 9),
    type: cmdType,
    ...definiuComandos[cmdType]
  });
  renderizarSequencia();
}

function removerComandoNoIndice(id) {
  if (estaExecutando) return;
  SynthAudio.playRemove();
  sequencia = sequencia.filter(cmd => cmd.id !== id);
  renderizarSequencia();
}

function limparSequencia() {
  if (estaExecutando) return;
  SynthAudio.playRemove();
  sequencia = [];
  renderizarSequencia();
}

function renderizarSequencia() {
  if (!containerSequencia) return;
  containerSequencia.innerHTML = '';
  
  if (sequencia.length === 0) {
    containerSequencia.innerHTML = `
      <div class="sequence-empty-tip-card">
        <div class="sequence-empty-dotted-box">
          <i data-lucide="message-square"></i>
        </div>
        <p class="sequence-empty-tip-text">Toque nos comandos acima</p>
      </div>
    `;
    if (window.lucide) {
      window.lucide.createIcons();
    }
    atualizarBotoes();
    return;
  }

  sequencia.forEach((cmd, idx) => {
    const item = document.createElement('div');
    item.className = `queued-command-item ${cmd.colorClass}`;
    item.onclick = () => removerComandoNoIndice(cmd.id);
    item.innerHTML = `
      <i data-lucide="${cmd.icon}"></i>
      <div class="queued-command-badge-index">${idx + 1}</div>
    `;
    containerSequencia.appendChild(item);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
  atualizarBotoes();
}

function atualizarBotoes() {
  if (!btnExecutar) return;
  const isBlocked = estaExecutando || sequencia.length === 0;
  
  if (isBlocked) {
    btnExecutar.disabled = true;
    btnExecutar.className = "btn-launch-sequence btn-launch-sequence-disabled";
  } else {
    btnExecutar.disabled = false;
    btnExecutar.className = "btn-launch-sequence btn-launch-sequence-active";
  }
}

function limparTrilha() {
  if (!containerGrid) return;
  containerGrid.querySelectorAll('.cell-trail-glowing').forEach(cell => {
    cell.classList.remove('cell-trail-glowing');
  });
}

function marcarTrilha(x, y) {
  if (!containerGrid) return;
  const cellElement = containerGrid.querySelector(`.cell-${x}-${y}`);
  if (cellElement) {
    cellElement.classList.add('cell-trail-glowing');
  }
}

function destacarPasso(idx) {
  if (!containerSequencia) return;
  const items = containerSequencia.querySelectorAll('.queued-command-item');
  items.forEach((item, i) => {
    if (i === idx) {
      item.classList.add('active-step');
    } else {
      item.classList.remove('active-step');
    }
  });
}

function limparDestacarPasso() {
  if (!containerSequencia) return;
  const items = containerSequencia.querySelectorAll('.queued-command-item');
  items.forEach((item) => {
    item.classList.remove('active-step');
  });
}

async function executarSequencia() {
  if (sequencia.length === 0 || estaExecutando) return;

  estaExecutando = true;
  atualizarBotoes();
  limparTrilha();
  
  const nivel = niveis[indiceNivelAtual];
  posicaoJogador = { ...nivel.posInicio };
  direcaoJogador = 'UP';
  renderizarGrid();
  
  // Highlight the start cell in the path trail
  marcarTrilha(posicaoJogador.x, posicaoJogador.y);

  let currentStepIdx = 0;
  for (const cmd of sequencia) {
    destacarPasso(currentStepIdx);
    await new Promise(resolve => setTimeout(resolve, 600));

    if (cmd.type === 'MOVER') {
      const novaPos = { ...posicaoJogador };
      if (direcaoJogador === 'UP') novaPos.y -= 1;
      else if (direcaoJogador === 'DOWN') novaPos.y += 1;
      else if (direcaoJogador === 'LEFT') novaPos.x -= 1;
      else if (direcaoJogador === 'RIGHT') novaPos.x += 1;

      if (novaPos.x < 0 || novaPos.x >= nivel.tamanhoGrid ||
          novaPos.y < 0 || novaPos.y >= nivel.tamanhoGrid) {
        limparDestacarPasso();
        finalizarJogoErrado("colisao_borda");
        return;
      }

      if (nivel.obstaculos.some(o => o.x === novaPos.x && o.y === novaPos.y)) {
        limparDestacarPasso();
        finalizarJogoErrado("colisao_obstaculo");
        return;
      }

      posicaoJogador = novaPos;
      renderizarGrid();
      marcarTrilha(posicaoJogador.x, posicaoJogador.y);
      SynthAudio.playStep();
    } 
    else if (cmd.type === 'GIRAR_ESQUERDA') {
      const direcoes = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
      const idx = direcoes.indexOf(direcaoJogador);
      direcaoJogador = direcoes[(idx + 1) % 4];
      renderizarGrid();
      SynthAudio.playRotate();
    } 
    else if (cmd.type === 'GIRAR_DIREITA') {
      const direcoes = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
      const idx = direcoes.indexOf(direcaoJogador);
      direcaoJogador = direcoes[(idx + 1) % 4];
      renderizarGrid();
      SynthAudio.playRotate();
    }
    currentStepIdx++;
  }

  limparDestacarPasso();
  await new Promise(resolve => setTimeout(resolve, 400));

  if (posicaoJogador.x === nivel.posAlvo.x && posicaoJogador.y === nivel.posAlvo.y) {
    finalizarJogoSucesso();
  } else {
    finalizarJogoErrado("nao_chegou");
  }
}

function finalizarJogoSucesso() {
  estaExecutando = false;
  SynthAudio.playWin();
  
  const cardBox = document.getElementById('gameover-content-box');
  if (!cardBox) return;

  cardBox.innerHTML = `
    <div class="deck-color-bar-top" style="background-color: var(--color-emerald)"></div>
    <div class="deck-modal-center-layout">
      <div class="modal-icon-badge-round" style="background-color: var(--color-emerald-light); color: var(--color-emerald)">
        <i data-lucide="check-circle-2"></i>
      </div>
      <div class="modal-headline-block">
        <h3 class="modal-heading-text">Algoritmo Correto!</h3>
        <p class="modal-tagline-text">
          Excelente! Você guiou o personagem ao alvo usando a lógica de Libras.
        </p>
      </div>
      <div style="display: flex; flex-direction: column; width: 100%; gap: 10px; margin-top: 16px;">
        ${indiceNivelAtual < niveis.length - 1 ? `
          <button onclick="proximoNivel()" class="modal-primary-action-btn" style="background-color: var(--color-emerald); box-shadow: 0 10px 15px rgba(16, 185, 129, 0.2)">
            <span>PRÓXIMO NÍVEL</span> <i data-lucide="chevron-right"></i>
          </button>
        ` : `
          <p style="font-size: 11.5px; font-weight: 900; color: var(--color-emerald); text-transform: uppercase; letter-spacing: 0.12em; padding: 10px 0; text-align: center;">Parabéns! Você completou todos os níveis!</p>
        `}
        <button onclick="reiniciarNivelAtual()" class="modal-secondary-cancel-btn">
          Jogar Novamente
        </button>
      </div>
    </div>
  `;
  
  const modalG = document.getElementById('modal-gameover');
  if (modalG) modalG.classList.remove('hidden');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function finalizarJogoErrado(motivo) {
  estaExecutando = false;
  atualizarBotoes();
  SynthAudio.playLose();

  const playerToken = document.getElementById('player-token');
  if (playerToken) {
    playerToken.classList.add('shake-token');
    setTimeout(() => {
      playerToken.classList.remove('shake-token');
    }, 1000);
  }

  let mensagem = "O trajeto planejado não alcançou o objetivo. Revise seus blocos.";
  if (motivo === "colisao_borda") {
    mensagem = "Cuidado! O personagem colidiu com as paredes externas da grid.";
  } else if (motivo === "colisao_obstaculo") {
    mensagem = "Colisão! O personagem bateu em um bloco preto de obstáculo.";
  }

  const cardBox = document.getElementById('gameover-content-box');
  if (!cardBox) return;

  cardBox.innerHTML = `
    <div class="deck-color-bar-top" style="background-color: var(--color-rose)"></div>
    <div class="deck-modal-center-layout">
      <div class="modal-icon-badge-round" style="background-color: var(--color-rose-light); color: var(--color-rose)">
        <i data-lucide="x-circle"></i>
      </div>
      <div class="modal-headline-block">
        <h3 class="modal-heading-text">Lógica Incorreta</h3>
        <p class="modal-tagline-text">${mensagem}</p>
      </div>
      <div style="display: flex; flex-direction: column; width: 100%; gap: 10px; margin-top: 16px;">
        <button onclick="reiniciarNivelAtual()" class="modal-primary-action-btn" style="background-color: var(--color-rose); box-shadow: 0 10px 15px rgba(244, 63, 94, 0.2)">
          <span>REENTRAR DESAFIO</span> <i data-lucide="rotate-ccw"></i>
        </button>
        <button onclick="fecharGameOverModal()" class="modal-secondary-cancel-btn">
          Ajustar Minha Lógica
        </button>
      </div>
    </div>
  `;

  const modalG = document.getElementById('modal-gameover');
  if (modalG) modalG.classList.remove('hidden');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function proximoNivel() {
  fecharGameOverModal();
  if (indiceNivelAtual < niveis.length - 1) {
    carregarNivel(indiceNivelAtual + 1);
  }
}

function reiniciarNivelAtual() {
  fecharGameOverModal();
  carregarNivel(indiceNivelAtual, true);
}

function fecharGameOverModal() {
  const modalG = document.getElementById('modal-gameover');
  if (modalG) modalG.classList.add('hidden');
}

function fecharTutorial() {
  const modalT = document.getElementById('modal-tutorial');
  if (modalT) modalT.classList.add('hidden');
  abrirLevelIntro();
}

function abrirLevelIntro() {
  const nivel = niveis[indiceNivelAtual];
  const titleTag = document.getElementById('level-intro-title');
  const videoTag = document.getElementById('level-intro-video');
  const instTag = document.getElementById('level-intro-instruction');
  const descTag = document.getElementById('level-intro-desc');
  const modalL = document.getElementById('modal-level-intro');

  if (titleTag) titleTag.textContent = `Introdução: Nível ${nivel.id}`;
  if (videoTag) videoTag.src = nivel.videoUrl || '';
  if (instTag) instTag.textContent = nivel.instrucao;
  if (descTag) descTag.textContent = nivel.descricaoLibras;

  if (modalL) modalL.classList.remove('hidden');

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function fecharLevelIntro() {
  const modalL = document.getElementById('modal-level-intro');
  if (modalL) modalL.classList.add('hidden');
}

function abrirDicionario() {
  const modalD = document.getElementById('modal-dictionary');
  if (modalD) modalD.classList.remove('hidden');
}

function fecharDicionario() {
  const modalD = document.getElementById('modal-dictionary');
  if (modalD) modalD.classList.add('hidden');
}

window.addEventListener('resize', () => {
  renderizarGrid(false);
});

window.selecionarNivel = selecionarNivel;
window.limparSequencia = limparSequencia;
window.executarSequencia = executarSequencia;
window.proximoNivel = proximoNivel;
window.reiniciarNivelAtual = reiniciarNivelAtual;
window.fecharGameOverModal = fecharGameOverModal;
window.fecharTutorial = fecharTutorial;
window.abrirDicionario = abrirDicionario;
window.fecharDicionario = fecharDicionario;
window.abrirLevelIntro = abrirLevelIntro;
window.fecharLevelIntro = fecharLevelIntro;
