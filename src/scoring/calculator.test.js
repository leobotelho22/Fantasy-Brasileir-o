/**
 * Testes do sistema de pontuação — Fantasy Brasileirão (scouts Cartola FC)
 * Execute com: node src/scoring/calculator.test.js
 */

const { calcularPontuacao, calcularPontuacaoCapitao, calcularPontuacaoTime } = require('./calculator');

// ── Utilitário de teste ───────────────────────────────────────────────────

let passou = 0;
let falhou = 0;

function esperar(descricao, valorReal, valorEsperado) {
  const ok = Math.abs(valorReal - valorEsperado) < 0.001;
  if (ok) {
    console.log(`  ✓ ${descricao}`);
    passou++;
  } else {
    console.log(`  ✗ ${descricao}`);
    console.log(`    Esperado: ${valorEsperado} | Recebido: ${valorReal}`);
    falhou++;
  }
}

function espararErro(descricao, erros, parcial) {
  const ok = erros.some(e => e.includes(parcial));
  if (ok) { console.log(`  ✓ ${descricao}`); passou++; }
  else {
    console.log(`  ✗ ${descricao}`);
    console.log(`    Esperado erro com: "${parcial}" | Recebido: ${JSON.stringify(erros)}`);
    falhou++;
  }
}

function secao(t) { console.log(`\n${t}\n${'─'.repeat(t.length)}`); }

// ── SCOUTS DE ATAQUE ─────────────────────────────────────────────────────

secao('Scout G — Gol (todos os jogadores de campo)');

for (const pos of ['ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 gol = +8`, calcularPontuacao(pos, { gol: 1 }).total, 8);
}
esperar('GOL: 1 gol = +8', calcularPontuacao('GOL', { gol: 1 }).total, 8);

secao('Scout A — Assistência (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 2 assistências = +10`, calcularPontuacao(pos, { assistencia: 2 }).total, 10);
}

secao('Scout FT — Finalização na Trave (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 FT = +3`, calcularPontuacao(pos, { finalizacaoNaTrave: 1 }).total, 3);
}

secao('Scout FD — Finalização Defendida (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 FD = +1.2`, calcularPontuacao(pos, { finalizacaoDefendida: 1 }).total, 1.2);
}

secao('Scout FF — Finalização para Fora (campo apenas, NÃO vale para GOL)');

for (const pos of ['ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 2 FF = +1.6`, calcularPontuacao(pos, { finalizacaoForA: 2 }).total, 1.6);
}
esperar('GOL: FF ignorado (0 pts)', calcularPontuacao('GOL', { finalizacaoForA: 3 }).total, 0);

secao('Scout FS — Falta Sofrida (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 4 FS = +2.0`, calcularPontuacao(pos, { faltaSofrida: 4 }).total, 2);
}

secao('Scout PS — Pênalti Sofrido (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 PS = +1`, calcularPontuacao(pos, { penaltiSofrido: 1 }).total, 1);
}

secao('Scout I — Impedimento (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 2 impedimentos = -0.2`, calcularPontuacao(pos, { impedimento: 2 }).total, -0.2);
}

secao('Scout PP — Pênalti Perdido (3 variantes, todos)');

esperar('PP para fora: -3.2', calcularPontuacao('ATA', { penaltiPerdidoForA: 1 }).total, -3.2);
esperar('PP defendido: -2.8', calcularPontuacao('ATA', { penaltiPerdidoDefendido: 1 }).total, -2.8);
esperar('PP na trave: -1.0', calcularPontuacao('ATA', { penaltiPerdidoTrave: 1 }).total, -1);

// PP na trave + FT juntos = -1 + 3 = +2 (trave após defesa conta como FT)
esperar(
  'PP trave + FT simultâneos = -1 + 3 = +2 (trave após defesa conta como FT)',
  calcularPontuacao('ATA', { penaltiPerdidoTrave: 1, finalizacaoNaTrave: 1 }).total,
  2
);

// ── SCOUTS DE DEFESA ─────────────────────────────────────────────────────

secao('Scout SG — Jogo Sem Gol (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: SG = +5`, calcularPontuacao(pos, { jogoSemGol: 1 }).total, 5);
}

secao('Scout DD — Defesa (exclusivo GOL)');

esperar('GOL: 3 defesas = +3.9', calcularPontuacao('GOL', { defesa: 3 }).total, 3.9);
esperar('ATA: defesa ignorada (0 pts)', calcularPontuacao('ATA', { defesa: 5 }).total, 0);
esperar('MEI: defesa ignorada (0 pts)', calcularPontuacao('MEI', { defesa: 2 }).total, 0);

secao('Scout DP — Defesa de Pênalti (exclusivo GOL)');

esperar('GOL: 1 DP = +7', calcularPontuacao('GOL', { defesaPenalti: 1 }).total, 7);
esperar('ZAG: DP ignorado (0 pts)', calcularPontuacao('ZAG', { defesaPenalti: 1 }).total, 0);

secao('Scout DS — Desarme (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 2 desarmes = +3.0`, calcularPontuacao(pos, { desarme: 2 }).total, 3);
}

secao('Scout GS — Gol Sofrido (exclusivo GOL)');

esperar('GOL: 2 GS = -2', calcularPontuacao('GOL', { golSofrido: 2 }).total, -2);

for (const pos of ['ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: GS ignorado (0 pts)`, calcularPontuacao(pos, { golSofrido: 3 }).total, 0);
}

secao('Scout GC — Gol Contra (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 GC = -3`, calcularPontuacao(pos, { golContra: 1 }).total, -3);
}

secao('Scout CV — Cartão Vermelho (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 CV = -3`, calcularPontuacao(pos, { cartaoVermelho: 1 }).total, -3);
}

secao('Scout CA — Cartão Amarelo (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 CA = -1`, calcularPontuacao(pos, { cartaoAmarelo: 1 }).total, -1);
}

secao('Scout FC — Falta Cometida (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 3 FC = -0.9`, calcularPontuacao(pos, { faltaCometida: 3 }).total, -0.9);
}

secao('Scout PC — Pênalti Cometido (todos)');

for (const pos of ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']) {
  esperar(`${pos}: 1 PC = -1`, calcularPontuacao(pos, { penaltiCometido: 1 }).total, -1);
}

// ── TÉCNICO ───────────────────────────────────────────────────────────────

secao('Técnico');

esperar('Vitória + 3 gols marcados: 5 + 1.5 = 6.5',
  calcularPontuacao('TEC', { vitoria: 1, golMarcado: 3 }).total, 6.5);
esperar('Empate: +1',
  calcularPontuacao('TEC', { empate: 1 }).total, 1);
esperar('Derrota + 2 GS: -1 - 1 = -2',
  calcularPontuacao('TEC', { derrota: 1, golSofrido: 2 }).total, -2);

// ── CAPITÃO ───────────────────────────────────────────────────────────────

secao('Capitão — pontuação dobrada');

esperar('ATA 2 gols como capitão: 16 × 2 = 32',
  calcularPontuacaoCapitao('ATA', { gol: 2 }).total, 32);
esperar('Negativos também dobram: CA como capitão = -2',
  calcularPontuacaoCapitao('ATA', { cartaoAmarelo: 1 }).total, -2);
esperar('totalSemBonus armazenado corretamente',
  calcularPontuacaoCapitao('MEI', { gol: 1 }).totalSemBonus, 8);

// ── TIME COMPLETO ─────────────────────────────────────────────────────────

secao('Time completo');

const time = calcularPontuacaoTime([
  { posicao: 'GOL', stats: { defesa: 4, jogoSemGol: 1 } },         // 5.2 + 5 = 10.2
  { posicao: 'ZAG', stats: { gol: 1, desarme: 2 } },               // 8 + 3 = 11
  { posicao: 'LAT', stats: { assistencia: 1, jogoSemGol: 1 } },    // 5 + 5 = 10
  { posicao: 'MEI', stats: { gol: 1, finalizacaoDefendida: 2 } },  // 8 + 2.4 = 10.4
  { posicao: 'ATA', ehCapitao: true, stats: { gol: 2 } },          // 16 × 2 = 32
]);

// ZAG, LAT, MEI, ATA NÃO perdem ponto por golSofrido
esperar('Time: GOL(10.2) + ZAG(11) + LAT(10) + MEI(10.4) + CAP_ATA(32) = 73.6',
  time.totalTime, 73.6);
esperar('5 jogadores processados', time.jogadores.length, 5);

// ── VALIDAÇÕES ────────────────────────────────────────────────────────────

secao('Validações de erro');

espararErro('Posição inválida',
  calcularPontuacao('MEIA', { gol: 1 }).erros, 'Posição inválida');
espararErro('Técnico com dois resultados',
  calcularPontuacao('TEC', { vitoria: 1, derrota: 1 }).erros, 'mais de um resultado');
espararErro('stats nulo',
  calcularPontuacao('ATA', null).erros, 'objeto');
espararErro('Dois capitães',
  calcularPontuacaoTime([
    { posicao: 'ATA', ehCapitao: true, stats: { gol: 1 } },
    { posicao: 'MEI', ehCapitao: true, stats: { gol: 1 } },
  ]).erros, 'Apenas 1 capitão');

// ── RESULTADO ─────────────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(42)}`);
console.log(`Resultado: ${passou} passou | ${falhou} falhou`);
console.log('═'.repeat(42));
if (falhou > 0) process.exit(1);
