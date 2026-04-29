/**
 * Exemplos práticos do sistema de pontuação — Fantasy Brasileirão
 * Execute com: node src/scoring/exemplos.js
 */

const {
  calcularPontuacao,
  calcularPontuacaoCapitao,
  calcularPontuacaoTime,
  exibirResultado,
} = require('./index');

console.log('\n═══════════════════════════════════════════════════');
console.log('   FANTASY BRASILEIRÃO — Exemplos de Pontuação   ');
console.log('═══════════════════════════════════════════════════');

// ──────────────────────────────────────────────────────────────────────────
// 1. Goleiro com grande atuação (clean sheet)
// ──────────────────────────────────────────────────────────────────────────
const goleiro = calcularPontuacao('GOL', {
  defesaDificil: 4,   // 4 defesas difíceis → 4 × 3 = 12
  defesaPenalti: 1,   // 1 defesa de pênalti → +7
  golSofrido:    0,   // não sofreu gol → 0
  cartaoAmarelo: 0,
});
exibirResultado('Everson (Atlético-MG)', 'GOL', goleiro);

// ──────────────────────────────────────────────────────────────────────────
// 2. Zagueiro que fez gol
// ──────────────────────────────────────────────────────────────────────────
const zagueiro = calcularPontuacao('ZAG', {
  gol:           1,   // +6
  desarme:       3,   // 3 × 1.5 = 4.5
  interceptacao: 2,   // 2 × 1.5 = 3
  bloqueio:      1,   // +1
  cartaoAmarelo: 1,   // -2
});
exibirResultado('Léo (Flamengo)', 'ZAG', zagueiro);

// ──────────────────────────────────────────────────────────────────────────
// 3. Lateral com assistências e cruzamentos
// ──────────────────────────────────────────────────────────────────────────
const lateral = calcularPontuacao('LAT', {
  assistencia:      2,  // 2 × 5 = 10
  cruzamentoCerto:  4,  // 4 × 1.5 = 6
  desarme:          2,  // 2 × 1.5 = 3
  interceptacao:    1,  // +1.5
  faltaCometida:    2,  // 2 × -0.3 = -0.6
});
exibirResultado('Marcos Rocha (Palmeiras)', 'LAT', lateral);

// ──────────────────────────────────────────────────────────────────────────
// 4. Meia com gol e finalizações
// ──────────────────────────────────────────────────────────────────────────
const meia = calcularPontuacao('MEI', {
  gol:                1,  // +5
  assistencia:        1,  // +3.5
  finalizacaoCerta:   2,  // 2 × 3 = 6
  finalizacaoNaTrave: 1,  // +2
  driblesCompletos:   3,  // 3 × 0.5 = 1.5
  desarme:            1,  // +1
});
exibirResultado('Gerson (Flamengo)', 'MEI', meia);

// ──────────────────────────────────────────────────────────────────────────
// 5. Atacante com hat-trick (3 gols)
// ──────────────────────────────────────────────────────────────────────────
const atacante = calcularPontuacao('ATA', {
  gol:              3,  // 3 × 8 = 24
  assistencia:      1,  // +5
  finalizacaoCerta: 2,  // 2 × 1.5 = 3
  driblesCompletos: 2,  // 2 × 0.5 = 1
  cartaoAmarelo:    1,  // -2
});
exibirResultado('Hulk (Atlético-MG)', 'ATA', atacante);

// ──────────────────────────────────────────────────────────────────────────
// 6. Atacante como CAPITÃO (pontuação dobrada)
// ──────────────────────────────────────────────────────────────────────────
const atacanteCapitao = calcularPontuacaoCapitao('ATA', {
  gol:              2,
  assistencia:      1,
  finalizacaoCerta: 1,
});
exibirResultado('Pedro ★ CAPITÃO (Flamengo)', 'ATA', atacanteCapitao);

// ──────────────────────────────────────────────────────────────────────────
// 7. Técnico vitorioso
// ──────────────────────────────────────────────────────────────────────────
const tecnico = calcularPontuacao('TEC', {
  vitoria:       1,  // +5
  golMarcado:    3,  // 3 × 0.5 = 1.5
  golSofrido:    1,  // -0.5
  cartaoAmarelo: 2,  // 2 × -0.5 = -1
});
exibirResultado('Abel Ferreira (Palmeiras)', 'TEC', tecnico);

// ──────────────────────────────────────────────────────────────────────────
// 8. Cálculo de time completo (11 jogadores + capitão)
// ──────────────────────────────────────────────────────────────────────────
console.log('\n\n═══════════════════════════════════════════════════');
console.log('           PONTUAÇÃO DO TIME COMPLETO             ');
console.log('═══════════════════════════════════════════════════');

const time = calcularPontuacaoTime([
  { nome: 'Everson',       posicao: 'GOL', stats: { defesaDificil: 3, golSofrido: 1 } },
  { nome: 'Léo',           posicao: 'ZAG', stats: { desarme: 2, bloqueio: 1 } },
  { nome: 'Gustavo Gómez', posicao: 'ZAG', stats: { gol: 1, cartaoAmarelo: 1 } },
  { nome: 'Marcos Rocha',  posicao: 'LAT', stats: { assistencia: 1, cruzamentoCerto: 3 } },
  { nome: 'Piquerez',      posicao: 'LAT', stats: { cruzamentoCerto: 2, desarme: 1 } },
  { nome: 'Raphael Veiga', posicao: 'MEI', stats: { gol: 1, finalizacaoCerta: 2 } },
  { nome: 'Zé Rafael',     posicao: 'MEI', stats: { desarme: 3, assistencia: 1 } },
  { nome: 'Aníbal Moreno', posicao: 'MEI', stats: { desarme: 2, faltaCometida: 3 } },
  { nome: 'Dudu',          posicao: 'ATA', stats: { assistencia: 2, driblesCompletos: 4 } },
  { nome: 'Flaco López ★', posicao: 'ATA', ehCapitao: true, stats: { gol: 2, finalizacaoCerta: 1 } },
  { nome: 'Estêvão',       posicao: 'ATA', stats: { gol: 1, driblesCompletos: 3, finalizacaoNaTrave: 1 } },
]);

console.log('\n Jogador                    Posição  Cap?  Pontos');
console.log(' ' + '─'.repeat(52));
for (const j of time.jogadores) {
  const cap = j.ehCapitao ? ' ★' : '  ';
  const pts = j.total >= 0 ? `+${j.total.toFixed(1)}` : `${j.total.toFixed(1)}`;
  const nome = j.nome.padEnd(28).slice(0, 28);
  console.log(` ${nome}  ${j.posicao}   ${cap}   ${pts}`);
}
console.log(' ' + '─'.repeat(52));
console.log(` TOTAL DO TIME:${' '.repeat(36)} ${time.totalTime >= 0 ? '+' : ''}${time.totalTime.toFixed(1)}`);

if (time.erros.length > 0) {
  console.log('\n Erros encontrados:');
  time.erros.forEach(e => console.log(`  ✗ ${e}`));
}

// ──────────────────────────────────────────────────────────────────────────
// 9. Erros de validação
// ──────────────────────────────────────────────────────────────────────────
console.log('\n\n═══════════════════════════════════════════════════');
console.log('              VALIDAÇÕES DE ERRO                  ');
console.log('═══════════════════════════════════════════════════');

const invalido = calcularPontuacao('MEIA', { gol: 1 });
console.log('\n Posição inválida "MEIA":');
console.log(' Erros:', invalido.erros);

const tecnicoInvalido = calcularPontuacao('TEC', { vitoria: 1, derrota: 1 });
console.log('\n Técnico com vitória E derrota ao mesmo tempo:');
console.log(' Erros:', tecnicoInvalido.erros);
