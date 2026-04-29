/**
 * Testes do sistema de pontuação — Fantasy Brasileirão
 * Execute com: node src/scoring/calculator.test.js
 *
 * Não usa nenhuma biblioteca externa — roda com Node.js puro.
 */

const { calcularPontuacao, calcularPontuacaoCapitao, calcularPontuacaoTime } = require('./calculator');

// ── Utilitário de teste mínimo ────────────────────────────────────────────

let passou = 0;
let falhou = 0;

function esperar(descricao, valorReal, valorEsperado) {
  const ok = Math.abs(valorReal - valorEsperado) < 0.001;
  if (ok) {
    console.log(`  ✓ ${descricao}`);
    passou++;
  } else {
    console.log(`  ✗ ${descricao}`);
    console.log(`    Esperado: ${valorEsperado}`);
    console.log(`    Recebido: ${valorReal}`);
    falhou++;
  }
}

function espararErro(descricao, erros, mensagemParcial) {
  const encontrou = erros.some(e => e.includes(mensagemParcial));
  if (encontrou) {
    console.log(`  ✓ ${descricao}`);
    passou++;
  } else {
    console.log(`  ✗ ${descricao}`);
    console.log(`    Esperado erro contendo: "${mensagemParcial}"`);
    console.log(`    Erros recebidos: ${JSON.stringify(erros)}`);
    falhou++;
  }
}

function secao(titulo) {
  console.log(`\n${titulo}`);
  console.log('─'.repeat(titulo.length));
}

// ── TESTES ────────────────────────────────────────────────────────────────

secao('Goleiro');

esperar(
  'defesa difícil: 3 × 3 = 9',
  calcularPontuacao('GOL', { defesaDificil: 3 }).total,
  9
);

esperar(
  'defesa de pênalti: 1 × 7 = 7',
  calcularPontuacao('GOL', { defesaPenalti: 1 }).total,
  7
);

esperar(
  'gol sofrido: 2 × -2 = -4',
  calcularPontuacao('GOL', { golSofrido: 2 }).total,
  -4
);

esperar(
  'defesa difícil limitada a 5 mesmo passando 10',
  calcularPontuacao('GOL', { defesaDificil: 10 }).total,
  15  // 5 × 3
);

esperar(
  'clean sheet: 4 defesas difíceis, 0 gols sofridos → 12',
  calcularPontuacao('GOL', { defesaDificil: 4, golSofrido: 0 }).total,
  12
);

secao('Zagueiro');

esperar(
  'gol: +6',
  calcularPontuacao('ZAG', { gol: 1 }).total,
  6
);

esperar(
  'desarme + interceptação + bloqueio: 1.5 + 1.5 + 1 = 4',
  calcularPontuacao('ZAG', { desarme: 1, interceptacao: 1, bloqueio: 1 }).total,
  4
);

esperar(
  'cartão vermelho: -5',
  calcularPontuacao('ZAG', { cartaoVermelho: 1 }).total,
  -5
);

esperar(
  'gol contra: -3',
  calcularPontuacao('ZAG', { golContra: 1 }).total,
  -3
);

secao('Lateral');

esperar(
  'assistência + cruzamentos: 5 + 3×1.5 = 9.5',
  calcularPontuacao('LAT', { assistencia: 1, cruzamentoCerto: 3 }).total,
  9.5
);

esperar(
  'pênalti cometido: -2',
  calcularPontuacao('LAT', { penaltiCometido: 1 }).total,
  -2
);

secao('Meia');

esperar(
  'gol: +5',
  calcularPontuacao('MEI', { gol: 1 }).total,
  5
);

esperar(
  'assistência: +3.5',
  calcularPontuacao('MEI', { assistencia: 1 }).total,
  3.5
);

esperar(
  'finalização certa: 2 × 3 = 6',
  calcularPontuacao('MEI', { finalizacaoCerta: 2 }).total,
  6
);

esperar(
  'finalização na trave limitada a 2: 5 traves → 2×2 = 4',
  calcularPontuacao('MEI', { finalizacaoNaTrave: 5 }).total,
  4
);

esperar(
  'falta cometida: 3 × -0.3 = -0.9',
  calcularPontuacao('MEI', { faltaCometida: 3 }).total,
  -0.9
);

secao('Atacante');

esperar(
  'hat-trick: 3 × 8 = 24',
  calcularPontuacao('ATA', { gol: 3 }).total,
  24
);

esperar(
  '2 gols + 1 assistência + 1 cartão amarelo: 16 + 5 - 2 = 19',
  calcularPontuacao('ATA', { gol: 2, assistencia: 1, cartaoAmarelo: 1 }).total,
  19
);

esperar(
  'drible: 4 × 0.5 = 2',
  calcularPontuacao('ATA', { driblesCompletos: 4 }).total,
  2
);

esperar(
  'stats zeradas → 0 pontos',
  calcularPontuacao('ATA', { gol: 0, assistencia: 0 }).total,
  0
);

secao('Técnico');

esperar(
  'vitória + 2 gols marcados: 5 + 1 = 6',
  calcularPontuacao('TEC', { vitoria: 1, golMarcado: 2 }).total,
  6
);

esperar(
  'empate: +1',
  calcularPontuacao('TEC', { empate: 1 }).total,
  1
);

esperar(
  'derrota + 2 gols sofridos: -1 - 1 = -2',
  calcularPontuacao('TEC', { derrota: 1, golSofrido: 2 }).total,
  -2
);

esperar(
  'cartão amarelo do técnico: -0.5',
  calcularPontuacao('TEC', { cartaoAmarelo: 1 }).total,
  -0.5
);

secao('Capitão (pontuação dobrada)');

esperar(
  'atacante 2 gols como capitão: (16) × 2 = 32',
  calcularPontuacaoCapitao('ATA', { gol: 2 }).total,
  32
);

esperar(
  'capitão com pontos negativos também dobra: (-2) × 2 = -4',
  calcularPontuacaoCapitao('ATA', { cartaoAmarelo: 1 }).total,
  -4
);

esperar(
  'campo totalSemBonus armazenado corretamente',
  calcularPontuacaoCapitao('MEI', { gol: 1 }).totalSemBonus,
  5
);

secao('Time completo');

const time = calcularPontuacaoTime([
  { posicao: 'GOL', stats: { defesaDificil: 2 } },           // 6
  { posicao: 'ZAG', stats: { gol: 1 } },                     // 6
  { posicao: 'LAT', stats: { assistencia: 1 } },             // 5
  { posicao: 'MEI', stats: { gol: 1 } },                     // 5
  { posicao: 'ATA', ehCapitao: true, stats: { gol: 1 } },    // 8 × 2 = 16
]);

esperar(
  'time com 5 jogadores: GOL(6) + ZAG(6) + LAT(5) + MEI(5) + CAP_ATA(16) = 38',
  time.totalTime,
  38
);

esperar(
  'número de jogadores processados: 5',
  time.jogadores.length,
  5
);

secao('Validações de erro');

espararErro(
  'posição inválida retorna erro',
  calcularPontuacao('MEIA', { gol: 1 }).erros,
  'Posição inválida'
);

espararErro(
  'técnico com dois resultados retorna erro',
  calcularPontuacao('TEC', { vitoria: 1, derrota: 1 }).erros,
  'mais de um resultado'
);

espararErro(
  'stats não-objeto retorna erro',
  calcularPontuacao('ATA', null).erros,
  'objeto'
);

const timeDoisCapitaes = calcularPontuacaoTime([
  { posicao: 'ATA', ehCapitao: true, stats: { gol: 1 } },
  { posicao: 'MEI', ehCapitao: true, stats: { gol: 1 } },
]);
espararErro(
  'time com 2 capitães retorna erro',
  timeDoisCapitaes.erros,
  'Apenas 1 capitão'
);

// ── Resultado final ───────────────────────────────────────────────────────

console.log(`\n${'═'.repeat(40)}`);
console.log(`Resultado: ${passou} passou | ${falhou} falhou`);
console.log('═'.repeat(40));
if (falhou > 0) process.exit(1);
