/**
 * Testes do Snake Draft — Fantasy Brasileirão
 * Execute com: node src/database/draft.test.js
 */

const {
  criarEstadoDraft,
  fazerPick,
  autoPick,
  timeParaPick,
  posicaoDoPick,
  gerarBoard,
  imprimirBoard,
} = require('./draft');

// ── Utilitário de teste ───────────────────────────────────────────────────

let passou = 0;
let falhou = 0;

function esperar(descricao, real, esperado) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  if (ok) { console.log(`  ✓ ${descricao}`); passou++; }
  else {
    console.log(`  ✗ ${descricao}`);
    console.log(`    Esperado: ${JSON.stringify(esperado)}`);
    console.log(`    Recebido: ${JSON.stringify(real)}`);
    falhou++;
  }
}

function secao(t) { console.log(`\n${t}\n${'─'.repeat(t.length)}`); }

// ── Fixtures ──────────────────────────────────────────────────────────────

const TIMES = [
  { teamId: 'team_A', name: 'Flamengo FC' },
  { teamId: 'team_B', name: 'Palmeiras FC' },
  { teamId: 'team_C', name: 'Atletico FC' },
  { teamId: 'team_D', name: 'Corinthians FC' },
];

const JOGADORES = [
  'ply_p1', 'ply_p2', 'ply_p3', 'ply_p4',
  'ply_p5', 'ply_p6', 'ply_p7', 'ply_p8',
  'ply_p9', 'ply_p10', 'ply_p11', 'ply_p12',
];

// Draft controlado: define uma ordem fixa para facilitar testes
function criarDraftControlado(rosterSize = 3) {
  const draft = criarEstadoDraft({
    leagueId:   'liga_teste',
    teams:      TIMES,
    rosterSize,
    timePerPick: 60,
  });
  // Força ordem determinística para os testes
  return {
    ...draft,
    draftOrder:    ['team_A', 'team_B', 'team_C', 'team_D'],
    currentTeamId: 'team_A',
  };
}

// ── TESTES: posicaoDoPick ─────────────────────────────────────────────────

secao('posicaoDoPick — converte pick geral em (rodada, posição na rodada)');

// 4 times, rosterSize=3 → 12 picks totais
// Rodada 1: picks 1-4, Rodada 2: picks 5-8, Rodada 3: picks 9-12
esperar('pick 1  → rodada 1, posição 1', posicaoDoPick(1, 4),  { round: 1, pickInRound: 1 });
esperar('pick 2  → rodada 1, posição 2', posicaoDoPick(2, 4),  { round: 1, pickInRound: 2 });
esperar('pick 4  → rodada 1, posição 4', posicaoDoPick(4, 4),  { round: 1, pickInRound: 4 });
esperar('pick 5  → rodada 2, posição 1', posicaoDoPick(5, 4),  { round: 2, pickInRound: 1 });
esperar('pick 8  → rodada 2, posição 4', posicaoDoPick(8, 4),  { round: 2, pickInRound: 4 });
esperar('pick 9  → rodada 3, posição 1', posicaoDoPick(9, 4),  { round: 3, pickInRound: 1 });
esperar('pick 12 → rodada 3, posição 4', posicaoDoPick(12, 4), { round: 3, pickInRound: 4 });

// ── TESTES: timeParaPick ──────────────────────────────────────────────────

secao('timeParaPick — qual time pega cada pick (snake pattern)');

// draftOrder = [A, B, C, D]
// Rodada 1 (ímpar):  A(1) B(2) C(3) D(4)
// Rodada 2 (par):    D(5) C(6) B(7) A(8)   ← cobra de volta
// Rodada 3 (ímpar):  A(9) B(10) C(11) D(12)
const order = ['team_A', 'team_B', 'team_C', 'team_D'];

esperar('pick 1  → team_A', timeParaPick(1,  4, order), 'team_A');
esperar('pick 2  → team_B', timeParaPick(2,  4, order), 'team_B');
esperar('pick 3  → team_C', timeParaPick(3,  4, order), 'team_C');
esperar('pick 4  → team_D', timeParaPick(4,  4, order), 'team_D');
esperar('pick 5  → team_D (snake!)', timeParaPick(5,  4, order), 'team_D');
esperar('pick 6  → team_C', timeParaPick(6,  4, order), 'team_C');
esperar('pick 7  → team_B', timeParaPick(7,  4, order), 'team_B');
esperar('pick 8  → team_A', timeParaPick(8,  4, order), 'team_A');
esperar('pick 9  → team_A (snake volta)', timeParaPick(9,  4, order), 'team_A');
esperar('pick 10 → team_B', timeParaPick(10, 4, order), 'team_B');
esperar('pick 11 → team_C', timeParaPick(11, 4, order), 'team_C');
esperar('pick 12 → team_D', timeParaPick(12, 4, order), 'team_D');

// ── TESTES: fazerPick ─────────────────────────────────────────────────────

secao('fazerPick — estado avança corretamente');

let draft = criarDraftControlado(3);

esperar('draft começa no pick 1', draft.currentPick, 1);
esperar('vez do team_A no pick 1', draft.currentTeamId, 'team_A');
esperar('status inicial: active', draft.status, 'active');

// Pick 1: team_A escolhe ply_p1
draft = fazerPick(draft, JOGADORES, 'ply_p1');
esperar('após pick 1: avança para pick 2',    draft.currentPick,   2);
esperar('após pick 1: vez do team_B',         draft.currentTeamId, 'team_B');
esperar('após pick 1: team_A tem ply_p1',     draft.roster.team_A, ['ply_p1']);
esperar('após pick 1: 1 pick registrado',     draft.picks.length,  1);
esperar('após pick 1: não é autoPick',        draft.picks[0].isAutoPick, false);

// Pick 2: team_B escolhe ply_p2
draft = fazerPick(draft, JOGADORES.filter(p => !draft.roster.team_A.includes(p)), 'ply_p2');
esperar('após pick 2: avança para pick 3',    draft.currentPick,   3);
esperar('após pick 2: vez do team_C',         draft.currentTeamId, 'team_C');

// Pick 3: team_C escolhe ply_p3
draft = fazerPick(draft, JOGADORES.filter(p =>
  !draft.roster.team_A.includes(p) && !draft.roster.team_B.includes(p)
), 'ply_p3');
esperar('após pick 3: vez do team_D',         draft.currentTeamId, 'team_D');

// Pick 4: team_D escolhe ply_p4 — COMEÇA A RODADA 2 (snake)
draft = fazerPick(draft, JOGADORES.filter(p => !['ply_p1','ply_p2','ply_p3'].includes(p)), 'ply_p4');
esperar('após pick 4: pick 5',                draft.currentPick,   5);
esperar('rodada 2 — team_D escolhe de novo (snake!)', draft.currentTeamId, 'team_D');
esperar('rodada atual: 2',                    draft.currentRound,  2);

// Simula picks 5-12 para testar o final do draft
secao('fazerPick — draft completo (12 picks, 4 times, rosterSize=3)');

let draftFull = criarDraftControlado(3);
const pool = [...JOGADORES];
const usados = new Set();

for (let i = 0; i < 12; i++) {
  const disponiveis = pool.filter(p => !usados.has(p));
  const jogador     = disponiveis[0];
  usados.add(jogador);
  draftFull = fazerPick(draftFull, disponiveis, jogador);
}

esperar('draft concluído após 12 picks: status completed', draftFull.status, 'completed');
esperar('12 picks registrados', draftFull.picks.length, 12);
esperar('team_A tem 3 jogadores', draftFull.roster.team_A.length, 3);
esperar('team_B tem 3 jogadores', draftFull.roster.team_B.length, 3);
esperar('team_C tem 3 jogadores', draftFull.roster.team_C.length, 3);
esperar('team_D tem 3 jogadores', draftFull.roster.team_D.length, 3);

// Verifica que cada jogador foi draftado por exatamente um time
const todosDraftados = [
  ...draftFull.roster.team_A,
  ...draftFull.roster.team_B,
  ...draftFull.roster.team_C,
  ...draftFull.roster.team_D,
];
esperar('12 jogadores diferentes no total', new Set(todosDraftados).size, 12);

// ── TESTES: validações ────────────────────────────────────────────────────

secao('fazerPick — validações de erro');

const draftParaErro = criarDraftControlado(2);
const poolErro = [...JOGADORES];

const erroDraftado = fazerPick(
  { ...draftParaErro, picks: [{ playerId: 'ply_p1', pickNumber: 0 }] },
  poolErro.filter(p => p !== 'ply_p1'),
  'ply_p1'   // ← jogador não está na pool (já removido)
);
esperar('jogador indisponível retorna erro', !!erroDraftado.erro, true);

const draftConcluido = { ...draftParaErro, status: 'completed' };
const erroConcluido = fazerPick(draftConcluido, poolErro, 'ply_p1');
esperar('pick em draft concluído retorna erro', !!erroConcluido.erro, true);

// ── TESTES: autoPick ─────────────────────────────────────────────────────

secao('autoPick — seleciona melhor disponível quando timer expira');

const draftAuto = criarDraftControlado(2);
const playersInfo = [
  { id: 'ply_p1', position: 'ATA', averagePoints: 8.5 },
  { id: 'ply_p2', position: 'MEI', averagePoints: 7.2 },
  { id: 'ply_p3', position: 'GOL', averagePoints: 6.0 },
];

const draftAposAuto = autoPick(draftAuto, playersInfo);
esperar('autoPick escolhe o melhor (ply_p1, avg 8.5)', draftAposAuto.picks[0].playerId, 'ply_p1');
esperar('autoPick marca isAutoPick=true', draftAposAuto.picks[0].isAutoPick, true);

// ── TESTES: gerarBoard ────────────────────────────────────────────────────

secao('gerarBoard — gera tabuleiro completo');

const draftBoard = criarDraftControlado(3);
const board = gerarBoard(draftBoard);

esperar('board tem 12 entradas (4 times × 3 rodadas)', board.length, 12);
esperar('pick 1 é de team_A', board[0].teamId, 'team_A');
esperar('pick 5 é de team_D (snake)', board[4].teamId, 'team_D');
esperar('pick 1 está marcado como current', board[0].isCurrent, true);
esperar('pick 2 está marcado como future', board[1].isFuture, true);
esperar('pick 1 não tem playerId ainda', board[0].playerId, null);

// ── VISUAL: imprimirBoard ─────────────────────────────────────────────────

secao('imprimirBoard — visualização do draft board');

// Draft parcialmente concluído para visualização
let draftVisual = criarDraftControlado(4);
draftVisual = { ...draftVisual, draftOrder: ['team_A', 'team_B', 'team_C', 'team_D'], currentTeamId: 'team_A' };
const poolVisual = [...JOGADORES];
const usadosVisual = new Set();

for (let i = 0; i < 6; i++) {  // faz 6 dos 16 picks
  const disp = poolVisual.filter(p => !usadosVisual.has(p));
  usadosVisual.add(disp[0]);
  draftVisual = fazerPick(draftVisual, disp, disp[0]);
}

imprimirBoard(draftVisual);
console.log(`  ✓ imprimirBoard executou sem erros`);
passou++;

// ── Resultado ─────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(44)}`);
console.log(`Resultado: ${passou} passou | ${falhou} falhou`);
console.log('═'.repeat(44));
if (falhou > 0) process.exit(1);
