/**
 * Testes do módulo Sofascore — Fantasy Brasileirão
 * Usa dados mockados para não depender de conexão com a internet.
 *
 * Execute com: node src/data/sofascore.test.js
 */

const {
  mapearScoutsSofascore,
  mapearPenaltisPerdidos,
  aplicarJogoSemGol,
  traduzirPosicao,
  traduzirStatus,
} = require('./sofascore');

const { calcularPontuacao } = require('../scoring/calculator');

// ── Utilitário de teste ───────────────────────────────────────────────────

let passou = 0;
let falhou = 0;

function esperar(descricao, real, esperado) {
  const ok = Math.abs(Number(real) - Number(esperado)) < 0.001
    || JSON.stringify(real) === JSON.stringify(esperado);
  if (ok) { console.log(`  ✓ ${descricao}`); passou++; }
  else {
    console.log(`  ✗ ${descricao}`);
    console.log(`    Esperado: ${JSON.stringify(esperado)}`);
    console.log(`    Recebido: ${JSON.stringify(real)}`);
    falhou++;
  }
}

function secao(t) { console.log(`\n${t}\n${'─'.repeat(t.length)}`); }

// ── Mocks de dados do Sofascore ───────────────────────────────────────────

// Dados que o Sofascore retorna para um atacante (Gabigol, 2 gols)
const MOCK_ATACANTE_SOFASCORE = {
  goals:                    2,
  goalAssist:               1,
  onTargetScoringAttempt:   5,   // 2 gols + 3 defendidas
  blockedScoringAttempt:    1,
  missedBalls:              2,
  hitWoodwork:              1,
  wasFouled:                4,
  penaltyWon:               1,
  offsideGiven:             2,
  ownGoals:                 0,
  yellowCards:              1,
  redCards:                 0,
  foulsCommitted:           1,
  penaltyConceded:          0,
  tackles:                  0,
  saves:                    0,
  penaltySave:              0,
  goalsConceded:            0,
  minutesPlayed:            90,
};

// Dados que o Sofascore retorna para um goleiro (Everson, clean sheet)
const MOCK_GOLEIRO_SOFASCORE = {
  goals:                    0,
  goalAssist:               0,
  onTargetScoringAttempt:   0,
  blockedScoringAttempt:    0,
  missedBalls:              0,
  hitWoodwork:              0,
  wasFouled:                0,
  penaltyWon:               0,
  offsideGiven:             0,
  ownGoals:                 0,
  yellowCards:              0,
  redCards:                 0,
  foulsCommitted:           0,
  penaltyConceded:          0,
  tackles:                  1,
  saves:                    4,
  penaltySave:              1,
  goalsConceded:            0,
  minutesPlayed:            90,
};

// Incidentes mockados de uma partida (pênalti perdido pelo atacante)
const MOCK_INCIDENTES = [
  { tipo: 'penalty', detalhe: 'saved',     jogadorId: 999, timeLado: 'home', minuto: 45 },
  { tipo: 'penalty', detalhe: 'missed',    jogadorId: 777, timeLado: 'away', minuto: 67 },
  { tipo: 'penalty', detalhe: 'woodwork',  jogadorId: 888, timeLado: 'home', minuto: 78 },
  { tipo: 'goal',    detalhe: 'regular',   jogadorId: 999, timeLado: 'home', minuto: 10 },
];

// Jogadores mockados (saída de buscarScoutsPartida)
const MOCK_JOGADORES = [
  {
    sofascoreId: 999,
    nome:        'Gabigol',
    posicao:     'ATA',
    lado:        'home',
    timeNome:    'Flamengo',
    scouts:      mapearScoutsSofascore(MOCK_ATACANTE_SOFASCORE, 'ATA'),
    raw:         MOCK_ATACANTE_SOFASCORE,
  },
  {
    sofascoreId: 777,
    nome:        'Hulk',
    posicao:     'ATA',
    lado:        'away',
    timeNome:    'Atlético-MG',
    scouts:      mapearScoutsSofascore({ ...MOCK_ATACANTE_SOFASCORE, goals: 1, goalAssist: 0 }, 'ATA'),
    raw:         MOCK_ATACANTE_SOFASCORE,
  },
  {
    sofascoreId: 101,
    nome:        'Everson',
    posicao:     'GOL',
    lado:        'away',
    timeNome:    'Atlético-MG',
    scouts:      mapearScoutsSofascore(MOCK_GOLEIRO_SOFASCORE, 'GOL'),
    raw:         MOCK_GOLEIRO_SOFASCORE,
  },
];

// ── TESTES: traduzirPosicao ───────────────────────────────────────────────

secao('traduzirPosicao — converte posições do Sofascore para o nosso formato');

esperar('G  → GOL', traduzirPosicao('G'),  'GOL');
esperar('GK → GOL', traduzirPosicao('GK'), 'GOL');
esperar('D  → ZAG', traduzirPosicao('D'),  'ZAG');
esperar('DF → ZAG', traduzirPosicao('DF'), 'ZAG');
esperar('M  → MEI', traduzirPosicao('M'),  'MEI');
esperar('MF → MEI', traduzirPosicao('MF'), 'MEI');
esperar('F  → ATA', traduzirPosicao('F'),  'ATA');
esperar('FW → ATA', traduzirPosicao('FW'), 'ATA');

// ── TESTES: traduzirStatus ────────────────────────────────────────────────

secao('traduzirStatus — converte status do Sofascore');

esperar('inprogress → ao_vivo',   traduzirStatus('inprogress'), 'ao_vivo');
esperar('finished   → encerrado', traduzirStatus('finished'),   'encerrado');
esperar('notstarted → agendado',  traduzirStatus('notstarted'), 'agendado');
esperar('halftime   → intervalo', traduzirStatus('halftime'),   'intervalo');

// ── TESTES: mapearScoutsSofascore ─────────────────────────────────────────

secao('mapearScoutsSofascore — ATA: Gabigol (2 gols, 1 assist, 1 amarelo)');

const scoutsGabigol = mapearScoutsSofascore(MOCK_ATACANTE_SOFASCORE, 'ATA');

esperar('gol:                2',  scoutsGabigol.gol,                   2);
esperar('assistencia:        1',  scoutsGabigol.assistencia,            1);
esperar('finalizacaoDefendida: 3 (5 no alvo - 2 gols)', scoutsGabigol.finalizacaoDefendida, 3);
esperar('finalizacaoForA:    3 (1 bloq + 2 fora)',      scoutsGabigol.finalizacaoForA,      3);
esperar('finalizacaoNaTrave: 1',  scoutsGabigol.finalizacaoNaTrave,    1);
esperar('faltaSofrida:       4',  scoutsGabigol.faltaSofrida,          4);
esperar('penaltiSofrido:     1',  scoutsGabigol.penaltiSofrido,        1);
esperar('impedimento:        2',  scoutsGabigol.impedimento,           2);
esperar('cartaoAmarelo:      1',  scoutsGabigol.cartaoAmarelo,         1);
esperar('faltaCometida:      1',  scoutsGabigol.faltaCometida,         1);
// ATA não tem golSofrido
esperar('golSofrido: 0 (ATA não perde ponto por GS)', scoutsGabigol.golSofrido, 0);
// ATA não tem defesa
esperar('defesa: 0 (não é GOL)', scoutsGabigol.defesa, 0);

secao('mapearScoutsSofascore — GOL: Everson (4 defesas, DP, clean sheet)');

const scoutsEverson = mapearScoutsSofascore(MOCK_GOLEIRO_SOFASCORE, 'GOL');

esperar('defesa:        4',   scoutsEverson.defesa,         4);
esperar('defesaPenalti: 1',   scoutsEverson.defesaPenalti,  1);
esperar('golSofrido:    0',   scoutsEverson.golSofrido,     0);
esperar('desarme:       1',   scoutsEverson.desarme,        1);
// jogoSemGol ainda é 0 aqui (preenchido por aplicarJogoSemGol)
esperar('jogoSemGol:    0 (ainda não calculado)', scoutsEverson.jogoSemGol, 0);

// ── TESTES: mapearPenaltisPerdidos ────────────────────────────────────────

secao('mapearPenaltisPerdidos — distingue 3 tipos de pênalti perdido');

const jogadoresComPP = mapearPenaltisPerdidos(MOCK_JOGADORES, MOCK_INCIDENTES);

const gabigol = jogadoresComPP.find(j => j.sofascoreId === 999);
esperar('Gabigol: penaltiPerdidoDefendido = 1', gabigol.scouts.penaltiPerdidoDefendido, 1);
esperar('Gabigol: penaltiPerdidoForA = 0',      gabigol.scouts.penaltiPerdidoForA, 0);

const hulk = jogadoresComPP.find(j => j.sofascoreId === 777);
esperar('Hulk: penaltiPerdidoForA = 1',         hulk.scouts.penaltiPerdidoForA, 1);
esperar('Hulk: penaltiPerdidoDefendido = 0',    hulk.scouts.penaltiPerdidoDefendido, 0);

// ── TESTES: aplicarJogoSemGol ─────────────────────────────────────────────

secao('aplicarJogoSemGol — preenche SG baseado no placar');

// Flamengo (home) ganhou 2×0 — Everson (away, Atlético) levou 2 gols, sem clean sheet
const placarFlaVsAtl = { golsCasa: 2, golsVisitante: 0 };
const jogadoresComSG = aplicarJogoSemGol(MOCK_JOGADORES, placarFlaVsAtl);

const gabigolComSG = jogadoresComSG.find(j => j.sofascoreId === 999);
esperar('Gabigol (home, não levou gol): jogoSemGol = 1', gabigolComSG.scouts.jogoSemGol, 1);

const eversonSemSG = jogadoresComSG.find(j => j.sofascoreId === 101);
esperar('Everson (away, levou 2 gols): jogoSemGol = 0', eversonSemSG.scouts.jogoSemGol, 0);

// Atlético (away) ganhou 1×0 — Everson tem clean sheet
const placarAtlGanha = { golsCasa: 0, golsVisitante: 1 };
const jogadoresAtlGanha = aplicarJogoSemGol(MOCK_JOGADORES, placarAtlGanha);

const eversonCleanSheet = jogadoresAtlGanha.find(j => j.sofascoreId === 101);
esperar('Everson (away, 0 gols sofridos): jogoSemGol = 1', eversonCleanSheet.scouts.jogoSemGol, 1);

// Flamengo perdeu 0×1: Gabigol (home) levou gol, sem clean sheet
const gabigolDerrotado = jogadoresAtlGanha.find(j => j.sofascoreId === 999);
esperar('Gabigol (home, levou 1 gol): jogoSemGol = 0', gabigolDerrotado.scouts.jogoSemGol, 0);

// ── INTEGRAÇÃO: pipeline completo → pontuação final ──────────────────────

secao('Integração: pipeline completo Sofascore → pontuação');

// Pipeline: mapeamento → pênaltis → jogo sem gol → pontuação
// Placar: Flamengo (home) 2×0 Atlético (away) — Gabigol no time que não levou gol
let jogadoresPipeline = [...MOCK_JOGADORES];
jogadoresPipeline = mapearPenaltisPerdidos(jogadoresPipeline, MOCK_INCIDENTES);
jogadoresPipeline = aplicarJogoSemGol(jogadoresPipeline, { golsCasa: 2, golsVisitante: 0 });
// Nota: Everson (away) NÃO tem clean sheet neste placar (levou 2 gols do Flamengo)

// Gabigol: 2G(16) + 1A(5) + 3FD(3.6) + 3FF(2.4) + 1FT(3) + 4FS(2) + 1PS(1) + 2I(-0.2) + 1CA(-1) + 1FC(-0.3) + 1DP_defendido(-2.8) + 1SG(5)
const gabigolFinal = jogadoresPipeline.find(j => j.sofascoreId === 999);
const pontuacaoGabigol = calcularPontuacao(gabigolFinal.posicao, gabigolFinal.scouts);

console.log(`\n  Gabigol — scouts finais:`);
pontuacaoGabigol.detalhamento.forEach(d => {
  console.log(`    ${d.evento.padEnd(28)} ${d.quantidade.toString().padStart(3)} × ${d.multiplicador >= 0 ? '+' : ''}${d.multiplicador} = ${d.pontos >= 0 ? '+' : ''}${d.pontos.toFixed(1)}`);
});
console.log(`    ${'─'.repeat(48)}`);
console.log(`    ${'TOTAL'.padEnd(38)} ${pontuacaoGabigol.total >= 0 ? '+' : ''}${pontuacaoGabigol.total.toFixed(1)}`);

esperar('Gabigol tem pontuação positiva (jogo muito bom)', pontuacaoGabigol.total > 0, true);
esperar('Gabigol: 2 gols = +16 base', pontuacaoGabigol.detalhamento.find(d => d.evento === 'gol')?.pontos, 16);

// Everson: 4DD(5.2) + 1DP(7) + 1DS(1.5) + 1SG(5)
const eversonFinal = jogadoresPipeline.find(j => j.sofascoreId === 101);
const pontuacaoEverson = calcularPontuacao(eversonFinal.posicao, eversonFinal.scouts);

esperar('Everson: defesa de pênalti = +7',  pontuacaoEverson.detalhamento.find(d => d.evento === 'defesaPenalti')?.pontos, 7);
// Everson não tem clean sheet neste placar (Flamengo 2×0 Atletico = Everson levou 2 gols)
esperar('Everson: sem clean sheet (jogoSemGol ausente)', pontuacaoEverson.detalhamento.find(d => d.evento === 'jogoSemGol'), undefined);
esperar('Everson: 4 defesas = +5.2',         pontuacaoEverson.detalhamento.find(d => d.evento === 'defesa')?.pontos, 5.2);

// ── Resultado ─────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(44)}`);
console.log(`Resultado: ${passou} passou | ${falhou} falhou`);
console.log('═'.repeat(44));
if (falhou > 0) process.exit(1);
