/**
 * Ponto de entrada do módulo de pontuação.
 *
 * Exemplos rápidos:
 *
 *   const scoring = require('./src/scoring');
 *
 *   // Calcular pontuação de um atacante
 *   scoring.calcularPontuacao('ATA', { gol: 2, assistencia: 1, cartaoAmarelo: 1 });
 *
 *   // Calcular com capitão
 *   scoring.calcularPontuacaoCapitao('MEI', { gol: 1, finalizacaoCerta: 2 });
 *
 *   // Calcular time completo
 *   scoring.calcularPontuacaoTime([...]);
 *
 *   // Ver regras de uma posição
 *   scoring.REGRAS_POR_POSICAO.ATA;
 */

const { calcularPontuacao, calcularPontuacaoCapitao, calcularPontuacaoTime, exibirResultado } = require('./calculator');
const { REGRAS_POR_POSICAO, EVENTOS_NEGATIVOS, LIMITES } = require('./rules');

module.exports = {
  calcularPontuacao,
  calcularPontuacaoCapitao,
  calcularPontuacaoTime,
  exibirResultado,
  REGRAS_POR_POSICAO,
  EVENTOS_NEGATIVOS,
  LIMITES,
};
