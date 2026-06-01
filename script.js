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

let indiceNivelAtual = 0;
let sequencia = [];
let estaExecutando = false;
let posicaoJogador = { x: 0, y: 4 };
let direcaoJogador = 'UP';
let slideAtualReport = 0;

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

function carregarNivel(index) {
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

  renderizarGrid();
  renderizarListaComandosDisponiveis();
  renderizarSequencia();
  atualizarBotoes();
}

function renderizarGrid() {
  if (!containerGrid) return;
  const nivel = niveis[indiceNivelAtual];
  containerGrid.style.gridTemplateColumns = `repeat(${nivel.tamanhoGrid}, minmax(0, 1fr))`;
  containerGrid.style.gridTemplateRows = `repeat(${nivel.tamanhoGrid}, minmax(0, 1fr))`;
  containerGrid.innerHTML = '';

  for (let y = 0; y < nivel.tamanhoGrid; y++) {
    for (let x = 0; x < nivel.tamanhoGrid; x++) {
      const cell = document.createElement('div');
      cell.className = "grid-unit";
      
      const isObstaculo = nivel.obstaculos.some(o => o.x === x && o.y === y);
      const isAlvo = nivel.posAlvo.x === x && nivel.posAlvo.y === y;
      const isInicio = nivel.posInicio.x === x && nivel.posInicio.y === y;
      const isPlayer = posicaoJogador.x === x && posicaoJogador.y === y;

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
      } else if (isPlayer) {
        cell.classList.add("grid-unit-player");
        
        const rotationClasses = {
          UP: "rotate-0",
          RIGHT: "rotate-90",
          DOWN: "rotate-180",
          LEFT: "rotate-minus-90"
        };
        
        cell.innerHTML = `
          <div class="player-sprite-wrapper ${rotationClasses[direcaoJogador]}">
            <i data-lucide="arrow-up"></i>
            <span class="player-sprite-label">Robô</span>
          </div>
        `;
      } else if (isInicio) {
        cell.classList.add("grid-unit-start-base");
        cell.innerHTML = `<span class="start-indicator-label">Início</span>`;
      }

      containerGrid.appendChild(cell);
    }
  }
  
  if (window.lucide) {
    window.lucide.createIcons();
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
  sequencia.push({
    id: Math.random().toString(36).substring(2, 9),
    type: cmdType,
    ...definiuComandos[cmdType]
  });
  renderizarSequencia();
}

function removerComandoNoIndice(id) {
  if (estaExecutando) return;
  sequencia = sequencia.filter(cmd => cmd.id !== id);
  renderizarSequencia();
}

function limparSequencia() {
  if (estaExecutando) return;
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

async function executarSequencia() {
  if (sequencia.length === 0 || estaExecutando) return;

  estaExecutando = true;
  atualizarBotoes();
  
  const nivel = niveis[indiceNivelAtual];
  posicaoJogador = { ...nivel.posInicio };
  direcaoJogador = 'UP';
  renderizarGrid();

  for (const cmd of sequencia) {
    await new Promise(resolve => setTimeout(resolve, 600));

    if (cmd.type === 'MOVER') {
      const novaPos = { ...posicaoJogador };
      if (direcaoJogador === 'UP') novaPos.y -= 1;
      else if (direcaoJogador === 'DOWN') novaPos.y += 1;
      else if (direcaoJogador === 'LEFT') novaPos.x -= 1;
      else if (direcaoJogador === 'RIGHT') novaPos.x += 1;

      if (novaPos.x < 0 || novaPos.x >= nivel.tamanhoGrid ||
          novaPos.y < 0 || novaPos.y >= nivel.tamanhoGrid) {
        finalizarJogoErrado("colisao_borda");
        return;
      }

      if (nivel.obstaculos.some(o => o.x === novaPos.x && o.y === novaPos.y)) {
        finalizarJogoErrado("colisao_obstaculo");
        return;
      }

      posicaoJogador = novaPos;
      renderizarGrid();
    } 
    else if (cmd.type === 'GIRAR_ESQUERDA') {
      const direcoes = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
      const idx = direcoes.indexOf(direcaoJogador);
      direcaoJogador = direcoes[(idx + 1) % 4];
      renderizarGrid();
    } 
    else if (cmd.type === 'GIRAR_DIREITA') {
      const direcoes = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
      const idx = direcoes.indexOf(direcaoJogador);
      direcaoJogador = direcoes[(idx + 1) % 4];
      renderizarGrid();
    }
  }

  await new Promise(resolve => setTimeout(resolve, 400));

  if (posicaoJogador.x === nivel.posAlvo.x && posicaoJogador.y === nivel.posAlvo.y) {
    finalizarJogoSucesso();
  } else {
    finalizarJogoErrado("nao_chegou");
  }
}

function finalizarJogoSucesso() {
  estaExecutando = false;
  
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
          <p style="font-size: 11px; font-weight: 900; color: var(--color-emerald); text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 0;">Parabéns! Você completou todos os níveis!</p>
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
  carregarNivel(indiceNivelAtual);
}

function fecharGameOverModal() {
  const modalG = document.getElementById('modal-gameover');
  if (modalG) modalG.classList.add('hidden');
}

function fecharTutorial() {
  const modalT = document.getElementById('modal-tutorial');
  if (modalT) modalT.classList.add('hidden');
}

function abrirApresentacao() {
  slideAtualReport = 0;
  const modalR = document.getElementById('modal-report');
  if (modalR) modalR.classList.remove('hidden');
  carregarSlideReport(0);
}

function fecharApresentacao() {
  const modalR = document.getElementById('modal-report');
  if (modalR) modalR.classList.add('hidden');
}

function iniciarApresentacao() {
  fecharTutorial();
  abrirApresentacao();
}

function abrirDicionario() {
  const modalD = document.getElementById('modal-dictionary');
  if (modalD) modalD.classList.remove('hidden');
}

function fecharDicionario() {
  const modalD = document.getElementById('modal-dictionary');
  if (modalD) modalD.classList.add('hidden');
}

const slidesReport = [
  {
    title: "Resumo Executivo",
    number: "01",
    author: "Apresentador 01",
    content: `
      <div class="slide-wrap-box">
        <h1>NEXUSPLAY</h1>
        <div class="slide-brand-bar"></div>
        <p class="slide-quote-italic">
          "Arquitetura de Software e Acessibilidade em Libras para o Ensino de Algoritmos."
        </p>
        <div class="slide-p-body" style="display: flex; flex-direction: column; gap: 12px;">
          <p>O <strong>Nexusplay</strong> é uma plataforma experimental de apoio didático que traduz conceitos abstratos de programação e ordenação lógica de códigos em uma interface visual e gestual simplificada.</p>
          <p>O objetivo é eliminar a barreira da escrita convencional de linguagens computacionais complexas, permitindo que o estudante foque puramente na lógica de algoritmos essenciais.</p>
        </div>
      </div>
    `
  },
  {
    title: "Fundamentação Teórica",
    number: "02",
    author: "Apresentador 02",
    content: `
      <div class="slide-wrap-box">
        <h3 class="slide-heading-text" style="font-size: 1.5rem;">Bases Pedagógicas</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="academic-card">
            <h4 class="ac-t-indigo"><span class="ac-dot ac-dot-indigo"></span> Metodologia Adaptada</h4>
            <p class="ac-card-text">Prioriza a semiótica visual de interface gráfica e a experiência de uso simples livre de textos excessivos ou confusos.</p>
          </div>
          <div class="academic-card">
            <h4 class="ac-t-emerald"><span class="ac-dot ac-dot-emerald"></span> Aprendizado Direto</h4>
            <p class="ac-card-text">Os blocos e sinais visuais são os mediadores principais do conhecimento prático. O código se move de imediato de acordo com a sequência escolhida pelo usuário.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    title: "Metodologia",
    number: "03",
    author: "Apresentador 03",
    content: `
      <div class="slide-wrap-box">
        <h3 class="slide-heading-text" style="font-size: 1.5rem;">Etapas de Formulação</h3>
        <div class="timeline-list-container">
          <div class="timeline-vertical-stripe"></div>
          
          <div class="timeline-step-row">
            <div class="timeline-badge-step">01</div>
            <h4 class="timeline-step-title">Análise Cognitiva</h4>
            <p class="timeline-step-desc">Garantia de que os elementos gráficos não causem sobrecarga e sejam visualmente autodescritivos.</p>
          </div>

          <div class="timeline-step-row">
            <div class="timeline-badge-step">02</div>
            <h4 class="timeline-step-title">Mapeamento Gestual</h4>
            <p class="timeline-step-desc">Conversão de instruções algorítmicas fundamentais em gestos de referência.</p>
          </div>

          <div class="timeline-step-row">
            <div class="timeline-badge-step">03</div>
            <h4 class="timeline-step-title">Resposta Prática Instantânea</h4>
            <p class="timeline-step-desc">Ao executar a sequência, o aluno visualiza passo a passo o feedback para um aprendizado interativo.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    title: "Arquitetura e Desenvolvimento",
    number: "04",
    author: "Apresentador 04",
    content: `
      <div class="slide-wrap-box">
        <h3 class="slide-heading-text" style="font-size: 1.5rem;">Tecnologia Simples e Prática</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="tech-spec-row">
            <div class="tech-icon-pouch tech-icon-pouch-blue">
              <i data-lucide="code"></i>
            </div>
            <div>
              <p class="tech-meta-title">Interface Padrão</p>
              <p class="tech-meta-desc">Estruturação focada em HTML5, CSS3 e Javascript puro para rodar nativamente em qualquer navegador sem lentidão.</p>
            </div>
          </div>
          <div class="tech-spec-row">
            <div class="tech-icon-pouch tech-icon-pouch-purple">
              <i data-lucide="layout"></i>
            </div>
            <div>
              <p class="tech-meta-title">Visual Fluido</p>
              <p class="tech-meta-desc">Design responsivo estruturado via classes flexíveis de estilização para excelente encaixe em celulares e computadores.</p>
            </div>
          </div>
        </div>
        <div class="academic-praise-banner">
          <p class="academic-praise-meta">Decisão de Design</p>
          <p class="academic-praise-italic">
            "O uso de uma ordem de comandos assíncronos e temporizados permite que o estudante observe com clareza o ciclo de execução da sua lógica em tempo real."
          </p>
        </div>
      </div>
    `
  },
  {
    title: "Métricas de Validação",
    number: "05",
    author: "Apresentador 05",
    content: `
      <div class="slide-wrap-box">
        <h3 class="slide-heading-text" style="font-size: 1.5rem;">Métricas de Sucesso</h3>
        <div class="metric-charts-layout">
          <div class="metric-number-card">
            <p class="metric-big-num">92%</p>
            <p class="metric-num-label" style="color: #c7d2fe;">Nível de Engajamento</p>
          </div>
          <div class="metric-number-card bg-metric-emerald">
            <p class="metric-big-num">100%</p>
            <p class="metric-num-label" style="color: #a7f3d0;">Acessibilidade Ativa</p>
          </div>
        </div>
        <div class="academic-card">
          <h4 class="ac-t-indigo" style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">Conclusão do Estudo</h4>
          <p class="slide-quote-italic" style="font-size: 15px; margin-top: 4px;">
            "A validação do aplicativo indica que o uso de interfaces livres de complexidade textual acelera a assimilação da lógica algorítmica essencial para estudantes inovadores."
          </p>
        </div>
      </div>
    `
  },
  {
    title: "Referências Acadêmicas",
    number: "06",
    author: "Apresentador 06",
    content: `
      <div class="slide-wrap-box">
        <h3 class="slide-heading-text" style="font-size: 1.5rem;">Fontes de Pesquisa</h3>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="academic-card">
            <p class="slide-p-body" style="font-size: 14px;">GALVÃO, L. <strong>Metodologia Prática sobre Concepção de Jogos Educativos Acessíveis e Adaptativos.</strong> Ensino de Tecnologia, 2020.</p>
          </div>
          <div class="academic-card">
            <p class="slide-p-body" style="font-size: 14px;">BRASIL. <strong>Diretrizes Federais e Lei Brasileira de Inclusão da Pessoa com Deficiência.</strong> Legislação Básica de Acessibilidade Digital Completa, 2015.</p>
          </div>
        </div>
      </div>
    `
  }
];

function cambiarApresentadorBadge() {
  const buttons = document.querySelectorAll('.tab-report-btn');
  buttons.forEach((btn, idx) => {
    if (idx === slideAtualReport) {
      btn.className = "tab-report-btn tab-report-btn-active";
    } else {
      btn.className = "tab-report-btn";
    }
  });
}

function carregarSlideReport(index) {
  if (index < 0 || index >= slidesReport.length) return;
  slideAtualReport = index;

  const slide = slidesReport[slideAtualReport];
  const contentBox = document.getElementById('report-slide-content');
  if (!contentBox) return;

  contentBox.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <div class="slide-author-badge">
        <span class="slide-author-text">${slide.author}</span>
      </div>
    </div>
    <div class="slide-heading-row">
      <span class="slide-heading-num">${slide.number}</span>
      <h2 class="slide-heading-text">${slide.title}</h2>
    </div>
    <div style="margin-top: 16px;">
      ${slide.content}
    </div>
  `;

  cambiarApresentadorBadge();
  renderizarDotIndicators();

  const btnPrev = document.getElementById('btn-report-prev');
  const btnNext = document.getElementById('btn-report-next');
  
  if (btnPrev) {
    btnPrev.disabled = (slideAtualReport === 0);
  }

  if (btnNext) {
    if (slideAtualReport === slidesReport.length - 1) {
      btnNext.innerHTML = `<span>Finalizar</span> <i data-lucide="check"></i>`;
    } else {
      btnNext.innerHTML = `<span>Continuar</span> <i data-lucide="chevron-right"></i>`;
    }
  }
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderizarDotIndicators() {
  const dotsBox = document.getElementById('slide-page-indicator-dots');
  if (!dotsBox) return;
  dotsBox.innerHTML = '';
  slidesReport.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `dot-indicator ${i === slideAtualReport ? 'dot-indicator-active' : ''}`;
    dotsBox.appendChild(dot);
  });
}

function mudarPaginaReport(index) {
  carregarSlideReport(index);
}

function proximaPaginaReport() {
  if (slideAtualReport < slidesReport.length - 1) {
    carregarSlideReport(slideAtualReport + 1);
  } else {
    fecharApresentacao();
  }
}

function anteriorPaginaReport() {
  if (slideAtualReport > 0) {
    carregarSlideReport(slideAtualReport - 1);
  }
}

window.selecionarNivel = selecionarNivel;
window.limparSequencia = limparSequencia;
window.executarSequencia = executarSequencia;
window.proximoNivel = proximoNivel;
window.reiniciarNivelAtual = reiniciarNivelAtual;
window.fecharGameOverModal = fecharGameOverModal;
window.fecharTutorial = fecharTutorial;
window.abrirApresentacao = abrirApresentacao;
window.fecharApresentacao = fecharApresentacao;
window.iniciarApresentacao = iniciarApresentacao;
window.abrirDicionario = abrirDicionario;
window.fecharDicionario = fecharDicionario;
window.mudarPaginaReport = mudarPaginaReport;
window.proximaPaginaReport = proximaPaginaReport;
window.anteriorPaginaReport = anteriorPaginaReport;
