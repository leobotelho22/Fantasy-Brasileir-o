/**
 * Motor do Snake Draft — Fantasy Brasileirão (estilo Sleeper)
 *
 * O snake draft funciona assim:
 *   Rodada 1 (ímpar):  posição 1 → 2 → 3 → ... → N
 *   Rodada 2 (par):    posição N → N-1 → ... → 1   (cobra de volta)
 *   Rodada 3 (ímpar):  posição 1 → 2 → 3 → ... → N
 *   ...
 *
 * Uso:
 *   const draft = criarEstadoDraft({ leagueId, teams, rosterSize: 15 });
 *   const draft2 = fazerPick(draft, players, 'ply_gabigol');
 *   const draft3 = fazerPick(draft2, players, 'ply_hulk');
 */

// ---------------------------------------------------------------------------
// Criação do estado inicial do draft
// ---------------------------------------------------------------------------

/**
 * Inicializa um draft com ordem embaralhada aleatoriamente.
 *
 * @param {{ leagueId: string, teams: Array<{teamId, name}>, rosterSize: number, timePerPick?: number }} opts
 * @returns {Object} estado completo do draft
 */
function criarEstadoDraft({ leagueId, teams, rosterSize, timePerPick = 60 }) {
  if (teams.length < 2) throw new Error('Um draft precisa de pelo menos 2 times.');
  if (rosterSize < 1)   throw new Error('rosterSize deve ser pelo menos 1.');

  const shuffled = embaralhar([...teams]);
  const draftOrder = shuffled.map(t => t.teamId);
  const teamNames  = Object.fromEntries(shuffled.map(t => [t.teamId, t.name]));

  return {
    leagueId,
    status:        'active',
    draftType:     'snake',
    numTeams:      teams.length,
    totalRounds:   rosterSize,
    totalPicks:    teams.length * rosterSize,
    timePerPick,
    currentPick:   1,
    currentRound:  1,
    currentTeamId: draftOrder[0],
    pickDeadline:  calcularDeadline(timePerPick),
    draftOrder,
    teamNames,
    picks:         [],         // histórico de picks feitos
    roster:        inicializarElencos(draftOrder),  // { teamId: [playerId] }
    availablePlayers: null,    // preenchido externamente (lista de playerIds)
    startedAt:     new Date().toISOString(),
    completedAt:   null,
  };
}

// ---------------------------------------------------------------------------
// Realizar um pick
// ---------------------------------------------------------------------------

/**
 * Registra a escolha de um jogador no draft.
 *
 * @param {Object} draft        - Estado atual do draft
 * @param {string[]} playerPool - IDs de todos os jogadores disponíveis
 * @param {string} playerId     - ID do jogador escolhido
 * @param {boolean} isAutoPick  - true se o timer expirou (auto-pick do servidor)
 * @returns {Object} novo estado do draft (imutável)
 */
function fazerPick(draft, playerPool, playerId, isAutoPick = false) {
  const erros = validarPick(draft, playerPool, playerId);
  if (erros.length > 0) return { ...draft, erro: erros[0] };

  const { round, pickInRound } = posicaoDoPick(draft.currentPick, draft.numTeams);
  const teamId   = draft.currentTeamId;
  const teamName = draft.teamNames[teamId];

  // Registra o pick
  const novoPick = {
    pickNumber:     draft.currentPick,
    round,
    pickInRound,
    teamId,
    teamName,
    playerId,
    isAutoPick,
    pickedAt:       new Date().toISOString(),
  };

  // Atualiza o elenco do time
  const novoRoster = {
    ...draft.roster,
    [teamId]: [...draft.roster[teamId], playerId],
  };

  // Remove o jogador da pool de disponíveis
  const novaPool = playerPool.filter(id => id !== playerId);

  const proximoPick = draft.currentPick + 1;
  const draftConcluido = proximoPick > draft.totalPicks;

  let proximo = {};
  if (!draftConcluido) {
    const { round: proxRound } = posicaoDoPick(proximoPick, draft.numTeams);
    const proxTeamId = timeParaPick(proximoPick, draft.numTeams, draft.draftOrder);
    proximo = {
      currentPick:   proximoPick,
      currentRound:  proxRound,
      currentTeamId: proxTeamId,
      pickDeadline:  calcularDeadline(draft.timePerPick),
    };
  }

  return {
    ...draft,
    ...proximo,
    status:  draftConcluido ? 'completed' : 'active',
    picks:   [...draft.picks, novoPick],
    roster:  novoRoster,
    completedAt: draftConcluido ? new Date().toISOString() : null,
    erro:    null,
  };
}

// ---------------------------------------------------------------------------
// Auto-pick (quando o timer expira)
// ---------------------------------------------------------------------------

/**
 * Escolhe automaticamente o melhor jogador disponível quando o timer expira.
 * Prioridade: preenche posições que o time ainda precisa, por média de pontos.
 *
 * @param {Object} draft
 * @param {Array<{id, position, averagePoints}>} playersInfo - info dos jogadores disponíveis
 * @returns {Object} novo estado do draft
 */
function autoPick(draft, playersInfo) {
  const teamId      = draft.currentTeamId;
  const elencoAtual = draft.roster[teamId];
  const disponiveis = playersInfo.filter(p => !elencoAtual.includes(p.id));

  if (disponiveis.length === 0) {
    return { ...draft, erro: 'Sem jogadores disponíveis para auto-pick.' };
  }

  // Seleciona o melhor por média de pontos
  const melhor = disponiveis.reduce((best, p) =>
    p.averagePoints > best.averagePoints ? p : best
  );

  const pool = disponiveis.map(p => p.id);
  return fazerPick(draft, pool, melhor.id, true);
}

// ---------------------------------------------------------------------------
// Consultas sobre o estado do draft
// ---------------------------------------------------------------------------

/**
 * Retorna o time que deve fazer o pick na posição `pickNumber`.
 *
 * @param {number} pickNumber - pick geral (1-indexado)
 * @param {number} numTeams
 * @param {string[]} draftOrder - array de teamIds na ordem inicial
 * @returns {string} teamId
 */
function timeParaPick(pickNumber, numTeams, draftOrder) {
  const { round, pickInRound } = posicaoDoPick(pickNumber, numTeams);
  const indice = round % 2 === 1
    ? pickInRound - 1              // rodada ímpar: esquerda → direita
    : numTeams - pickInRound;      // rodada par:   direita → esquerda (snake)
  return draftOrder[indice];
}

/**
 * Retorna rodada e posição dentro da rodada para um pick geral.
 *
 * @param {number} pickNumber - pick geral (1-indexado)
 * @param {number} numTeams
 * @returns {{ round: number, pickInRound: number }}
 */
function posicaoDoPick(pickNumber, numTeams) {
  const round       = Math.ceil(pickNumber / numTeams);
  const pickInRound = ((pickNumber - 1) % numTeams) + 1;
  return { round, pickInRound };
}

/**
 * Gera o tabuleiro completo do draft (board) com todos os picks passados e futuros.
 *
 * @param {Object} draft
 * @returns {Array<{ pickNumber, round, pickInRound, teamId, playerId|null }>}
 */
function gerarBoard(draft) {
  const { totalPicks, numTeams, draftOrder, picks } = draft;
  const feitos = Object.fromEntries(picks.map(p => [p.pickNumber, p]));

  return Array.from({ length: totalPicks }, (_, i) => {
    const pickNumber   = i + 1;
    const { round, pickInRound } = posicaoDoPick(pickNumber, numTeams);
    const teamId       = timeParaPick(pickNumber, numTeams, draftOrder);
    const pickFeito    = feitos[pickNumber];

    return {
      pickNumber,
      round,
      pickInRound,
      teamId,
      teamName:      draft.teamNames[teamId],
      playerId:      pickFeito?.playerId  ?? null,
      isAutoPick:    pickFeito?.isAutoPick ?? false,
      isCurrent:     pickNumber === draft.currentPick,
      isFuture:      pickNumber > draft.currentPick,
    };
  });
}

/**
 * Retorna o elenco de cada time ao final do draft.
 *
 * @param {Object} draft
 * @returns {Object} { teamId: [pickNumber, ...] }
 */
function resumoElencos(draft) {
  return Object.entries(draft.roster).reduce((acc, [teamId, playerIds]) => {
    acc[draft.teamNames[teamId]] = playerIds;
    return acc;
  }, {});
}

/**
 * Retorna o ranking de posição no draft de cada time.
 *
 * @param {Object} draft
 * @returns {Array<{ position, teamId, teamName }>}
 */
function ordemDraft(draft) {
  return draft.draftOrder.map((teamId, i) => ({
    position: i + 1,
    teamId,
    teamName: draft.teamNames[teamId],
  }));
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

function validarPick(draft, playerPool, playerId) {
  const erros = [];

  if (draft.status === 'completed') {
    erros.push('O draft já foi concluído.');
  }
  if (draft.status === 'waiting') {
    erros.push('O draft ainda não começou.');
  }
  if (!playerId) {
    erros.push('playerId é obrigatório.');
  }
  if (!playerPool.includes(playerId)) {
    erros.push(`Jogador "${playerId}" não está disponível (já foi draftado ou não existe).`);
  }

  return erros;
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function calcularDeadline(segundos) {
  return new Date(Date.now() + segundos * 1000).toISOString();
}

function inicializarElencos(draftOrder) {
  return Object.fromEntries(draftOrder.map(teamId => [teamId, []]));
}

// ---------------------------------------------------------------------------
// Visualização do board no console
// ---------------------------------------------------------------------------

/**
 * Imprime o tabuleiro do draft no console, estilo grade.
 */
function imprimirBoard(draft) {
  const board = gerarBoard(draft);
  const { numTeams } = draft;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                   DRAFT BOARD                        ');
  console.log('═══════════════════════════════════════════════════════');

  // Cabeçalho com nomes dos times
  const nomes = draft.draftOrder.map(id => draft.teamNames[id].slice(0, 10).padEnd(12));
  console.log('Rodada │ ' + nomes.join(' │ '));
  console.log('───────┼' + '─────────────┼'.repeat(numTeams - 1) + '─────────────');

  // Linhas por rodada do draft
  const totalRounds = Math.ceil(board.length / numTeams);
  for (let r = 1; r <= totalRounds; r++) {
    const picksDaRodada = board.filter(p => p.round === r);

    // Monta linha por posição (não por pick order)
    const celulas = draft.draftOrder.map(teamId => {
      const pick = picksDaRodada.find(p => p.teamId === teamId);
      if (!pick) return '            ';
      const marcador = pick.isCurrent ? '►' : pick.isFuture ? '·' : pick.isAutoPick ? 'A' : '✓';
      const conteudo = pick.playerId
        ? pick.playerId.replace('ply_', '').slice(0, 9)
        : '---';
      return `${marcador} ${conteudo}`.padEnd(12);
    });

    console.log(`   ${String(r).padStart(2)}  │ ${celulas.join(' │ ')}`);
  }

  console.log('───────┴' + '─────────────┴'.repeat(numTeams - 1) + '─────────────');
  console.log(`Pick atual: ${draft.currentPick}/${draft.totalPicks} | Status: ${draft.status}`);
  if (draft.status === 'active') {
    console.log(`Vez de: ${draft.teamNames[draft.currentTeamId]}`);
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  criarEstadoDraft,
  fazerPick,
  autoPick,
  timeParaPick,
  posicaoDoPick,
  gerarBoard,
  resumoElencos,
  ordemDraft,
  imprimirBoard,
};
