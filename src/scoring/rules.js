/**
 * Tabela de pontuação — Fantasy Brasileirão (scouts oficiais do Cartola FC)
 *
 * Regra de ouro: todos os jogadores de campo (ZAG, LAT, MEI, ATA) usam
 * EXATAMENTE a mesma tabela. Apenas o GOL tem scouts exclusivos e uma
 * exceção (FF — Finalização para fora não vale para goleiros).
 *
 * Posições: 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA' | 'TEC'
 *
 * Abreviações (mesmas do Cartola FC):
 *   G   – Gol
 *   A   – Assistência
 *   FT  – Finalização na Trave
 *   FD  – Finalização Defendida
 *   FF  – Finalização para Fora         (não vale para GOL)
 *   FS  – Falta Sofrida
 *   PS  – Pênalti Sofrido
 *   I   – Impedimento
 *   PP  – Pênalti Perdido (3 variantes)
 *   SG  – Jogo Sem Gol sofrido
 *   DD  – Defesa                        (exclusivo GOL)
 *   DP  – Defesa de Pênalti             (exclusivo GOL)
 *   DS  – Desarme
 *   GC  – Gol Contra
 *   CV  – Cartão Vermelho
 *   CA  – Cartão Amarelo
 *   GS  – Gol Sofrido
 *   FC  – Falta Cometida
 *   PC  – Pênalti Cometido
 */

// ---------------------------------------------------------------------------
// Scouts de ATAQUE — valem para todos os jogadores de campo
// ---------------------------------------------------------------------------
const SCOUTS_ATAQUE_CAMPO = {
  gol:                       8,      // G
  assistencia:               5,      // A
  finalizacaoNaTrave:        3,      // FT
  finalizacaoDefendida:      1.2,    // FD
  finalizacaoForA:           0.8,    // FF  ← NÃO vale para GOL
  faltaSofrida:              0.5,    // FS
  penaltiSofrido:            1,      // PS
  impedimento:              -0.1,    // I
  // Pênalti perdido — 3 variantes com penalidades diferentes
  penaltiPerdidoForA:       -3.2,    // PP para fora
  penaltiPerdidoDefendido:  -2.8,    // PP (goleiro defendeu)
  penaltiPerdidoTrave:      -1,      // PP (bateu na trave após defesa) — também conta como FT
};

// ---------------------------------------------------------------------------
// Scouts de DEFESA — valem para todos os jogadores (campo e GOL)
// ---------------------------------------------------------------------------
const SCOUTS_DEFESA_COMUNS = {
  jogoSemGol:     5,      // SG — jogo sem sofrer gol
  desarme:        1.5,    // DS
  golContra:     -3,      // GC
  cartaoVermelho:-3,      // CV
  cartaoAmarelo: -1,      // CA
  golSofrido:    -1,      // GS
  faltaCometida: -0.3,    // FC
  penaltiCometido:-1,     // PC
};

// ---------------------------------------------------------------------------
// Tabela de pontuação por posição
// ---------------------------------------------------------------------------
const REGRAS_POR_POSICAO = {

  // ─── Goleiro — scouts exclusivos + regras comuns (sem FF) ─────────────────
  GOL: {
    // Ataque (igual ao campo, exceto FF)
    gol:                       8,
    assistencia:               5,
    finalizacaoNaTrave:        3,
    finalizacaoDefendida:      1.2,
    // finalizacaoForA:        ← NÃO existe para GOL (regra oficial Cartola FC)
    faltaSofrida:              0.5,
    penaltiSofrido:            1,
    impedimento:              -0.1,
    penaltiPerdidoForA:       -3.2,
    penaltiPerdidoDefendido:  -2.8,
    penaltiPerdidoTrave:      -1,
    // Defesa — scouts exclusivos do GOL
    defesa:         1.3,    // DD — cada defesa realizada
    defesaPenalti:  7,      // DP — defesa de pênalti
    // Defesa — comuns
    ...SCOUTS_DEFESA_COMUNS,
  },

  // ─── Jogadores de Campo — mesma tabela para todos ─────────────────────────
  ZAG: { ...SCOUTS_ATAQUE_CAMPO, ...SCOUTS_DEFESA_COMUNS },
  LAT: { ...SCOUTS_ATAQUE_CAMPO, ...SCOUTS_DEFESA_COMUNS },
  MEI: { ...SCOUTS_ATAQUE_CAMPO, ...SCOUTS_DEFESA_COMUNS },
  ATA: { ...SCOUTS_ATAQUE_CAMPO, ...SCOUTS_DEFESA_COMUNS },

  // ─── Técnico — regras próprias ────────────────────────────────────────────
  TEC: {
    vitoria:        5,
    empate:         1,
    derrota:       -1,
    golMarcado:     0.5,
    golSofrido:    -0.5,
    cartaoAmarelo: -0.5,
    cartaoVermelho:-2,
  },
};

// ---------------------------------------------------------------------------
// Limites por evento (teto máximo contabilizado por jogo — regra Cartola FC)
// ---------------------------------------------------------------------------
const LIMITES = {};  // Cartola FC não documenta tetos explícitos nos scouts atuais

module.exports = { REGRAS_POR_POSICAO, SCOUTS_ATAQUE_CAMPO, SCOUTS_DEFESA_COMUNS, LIMITES };
