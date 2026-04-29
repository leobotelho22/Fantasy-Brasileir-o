/**
 * Tabela de pontuação baseada no Cartola FC (Brasileirão Série A).
 *
 * Cada posição tem seu próprio conjunto de multiplicadores.
 * Eventos negativos são iguais para todas as posições.
 *
 * Posições válidas: 'GOL', 'ZAG', 'LAT', 'MEI', 'ATA', 'TEC'
 */

// ---------------------------------------------------------------------------
// Eventos negativos — valem para TODAS as posições
// ---------------------------------------------------------------------------
const EVENTOS_NEGATIVOS = {
  cartaoAmarelo:     -2,
  cartaoVermelho:    -5,
  golContra:         -3,
  penaltiCometido:   -2,
  penaltiPerdido:    -2,
  faltaCometida:     -0.3,
};

// ---------------------------------------------------------------------------
// Pontuação por posição
// ---------------------------------------------------------------------------
const REGRAS_POR_POSICAO = {

  // ─── Goleiro ──────────────────────────────────────────────────────────────
  GOL: {
    // positivos
    gol:              8,
    assistencia:      5,
    defesaDificil:    3,
    defesaPenalti:    7,
    // negativos
    golSofrido:      -2,
    // compartilhados (negativos)
    ...EVENTOS_NEGATIVOS,
  },

  // ─── Zagueiro ─────────────────────────────────────────────────────────────
  ZAG: {
    gol:              6,
    assistencia:      5,
    desarme:          1.5,
    interceptacao:    1.5,
    bloqueio:         1,
    ...EVENTOS_NEGATIVOS,
  },

  // ─── Lateral ──────────────────────────────────────────────────────────────
  LAT: {
    gol:              6,
    assistencia:      5,
    cruzamentoCerto:  1.5,
    desarme:          1.5,
    interceptacao:    1.5,
    ...EVENTOS_NEGATIVOS,
  },

  // ─── Meia ─────────────────────────────────────────────────────────────────
  MEI: {
    gol:              5,
    assistencia:      3.5,
    finalizacaoNaTrave:  2,
    finalizacaoCerta:    3,
    driblesCompletos:    0.5,
    desarme:             1,
    ...EVENTOS_NEGATIVOS,
  },

  // ─── Atacante ─────────────────────────────────────────────────────────────
  ATA: {
    gol:              8,
    assistencia:      5,
    finalizacaoNaTrave:  2,
    finalizacaoCerta:    1.5,
    driblesCompletos:    0.5,
    ...EVENTOS_NEGATIVOS,
  },

  // ─── Técnico ──────────────────────────────────────────────────────────────
  TEC: {
    vitoria:          5,
    empate:           1,
    derrota:         -1,
    golMarcado:       0.5,
    golSofrido:      -0.5,
    cartaoAmarelo:   -0.5,
    cartaoVermelho:  -2,
  },
};

// ---------------------------------------------------------------------------
// Limites e validações
// ---------------------------------------------------------------------------
const LIMITES = {
  // Defesa difícil: no máximo 5 por jogo (Cartola FC aplica esse teto)
  defesaDificil: { max: 5 },
  // Finalizações na trave: no máximo 2 por jogo
  finalizacaoNaTrave: { max: 2 },
};

module.exports = { REGRAS_POR_POSICAO, EVENTOS_NEGATIVOS, LIMITES };
