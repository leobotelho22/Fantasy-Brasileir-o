/**
 * Exemplos práticos — scouts oficiais do Cartola FC
 * Execute com: node src/scoring/exemplos.js
 */

const {
  calcularPontuacao,
  calcularPontuacaoCapitao,
  calcularPontuacaoTime,
  exibirResultado,
} = require('./index');

console.log('\n═══════════════════════════════════════════════════');
console.log('  FANTASY BRASILEIRÃO — Scouts oficiais Cartola FC');
console.log('═══════════════════════════════════════════════════');

// ── 1. Goleiro — jogo sem gol + defesas ──────────────────────────────────
exibirResultado('Everson (Atlético-MG)', 'GOL',
  calcularPontuacao('GOL', {
    defesa:         5,   // DD: 5 × 1.3 = 6.5
    defesaPenalti:  1,   // DP: +7
    jogoSemGol:     1,   // SG: +5
    golSofrido:     0,
    faltaSofrida:   1,   // FS: +0.5
  })
);

// ── 2. Zagueiro — mesma tabela que MEI e ATA ─────────────────────────────
exibirResultado('Léo (Flamengo)', 'ZAG',
  calcularPontuacao('ZAG', {
    gol:                    1,   // G:  +8
    finalizacaoNaTrave:     1,   // FT: +3
    desarme:                3,   // DS: 3×1.5 = 4.5
    jogoSemGol:             1,   // SG: +5
    cartaoAmarelo:          1,   // CA: -1
  })
);

// ── 3. Lateral — mesma tabela que ZAG ────────────────────────────────────
exibirResultado('Marcos Rocha (Palmeiras)', 'LAT',
  calcularPontuacao('LAT', {
    assistencia:            1,   // A:  +5
    finalizacaoDefendida:   2,   // FD: 2×1.2 = 2.4
    finalizacaoForA:        3,   // FF: 3×0.8 = 2.4
    faltaSofrida:           4,   // FS: 4×0.5 = 2
    desarme:                2,   // DS: 2×1.5 = 3
    faltaCometida:          2,   // FC: 2×-0.3 = -0.6
  })
);

// ── 4. Meia — mesma tabela que ATA ───────────────────────────────────────
exibirResultado('Gerson (Flamengo)', 'MEI',
  calcularPontuacao('MEI', {
    gol:                    1,   // G:  +8
    assistencia:            1,   // A:  +5
    finalizacaoNaTrave:     1,   // FT: +3
    finalizacaoDefendida:   2,   // FD: 2×1.2 = 2.4
    finalizacaoForA:        2,   // FF: 2×0.8 = 1.6
    faltaSofrida:           3,   // FS: 3×0.5 = 1.5
    impedimento:            1,   // I:  -0.1
    desarme:                1,   // DS: +1.5
  })
);

// ── 5. Atacante com hat-trick ─────────────────────────────────────────────
exibirResultado('Hulk (Atlético-MG)', 'ATA',
  calcularPontuacao('ATA', {
    gol:                    3,   // G:  3×8 = 24
    assistencia:            1,   // A:  +5
    finalizacaoDefendida:   3,   // FD: 3×1.2 = 3.6
    finalizacaoForA:        1,   // FF: +0.8
    faltaSofrida:           2,   // FS: 2×0.5 = 1
    cartaoAmarelo:          1,   // CA: -1
  })
);

// ── 6. Atacante perde pênalti na trave (após defesa = conta como FT) ─────
exibirResultado('Pedro (Flamengo) — pênalti na trave após defesa', 'ATA',
  calcularPontuacao('ATA', {
    gol:                 1,   // G:  +8
    penaltiPerdidoTrave: 1,   // PP: -1   ← bola na trave após defesa
    finalizacaoNaTrave:  1,   // FT: +3   ← trave conta como FT também
  })
);

// ── 7. Atacante como CAPITÃO ──────────────────────────────────────────────
exibirResultado('Endrick ★ CAPITÃO (Palmeiras)', 'ATA',
  calcularPontuacaoCapitao('ATA', {
    gol:                    2,   // G:  2×8 = 16
    assistencia:            1,   // A:  +5
    finalizacaoDefendida:   1,   // FD: +1.2
    cartaoAmarelo:          1,   // CA: -1
  })
  // total sem capitão: 21.2 → com capitão: 42.4
);

// ── 8. Técnico vitorioso ──────────────────────────────────────────────────
exibirResultado('Abel Ferreira (Palmeiras)', 'TEC',
  calcularPontuacao('TEC', {
    vitoria:        1,   // +5
    golMarcado:     3,   // 3×0.5 = 1.5
    golSofrido:     1,   // -0.5
    cartaoAmarelo:  2,   // 2×-0.5 = -1
  })
);

// ── 9. Time completo ──────────────────────────────────────────────────────
console.log('\n\n═══════════════════════════════════════════════════');
console.log('           PONTUAÇÃO DO TIME COMPLETO             ');
console.log('═══════════════════════════════════════════════════');

const time = calcularPontuacaoTime([
  { nome: 'Everson',       posicao: 'GOL', stats: { defesa: 4, jogoSemGol: 1, golSofrido: 0 } },
  { nome: 'Léo',           posicao: 'ZAG', stats: { desarme: 2, jogoSemGol: 1 } },
  { nome: 'Gustavo Gómez', posicao: 'ZAG', stats: { gol: 1, finalizacaoForA: 1 } },
  { nome: 'Marcos Rocha',  posicao: 'LAT', stats: { assistencia: 1, finalizacaoDefendida: 2 } },
  { nome: 'Piquerez',      posicao: 'LAT', stats: { desarme: 2, faltaSofrida: 3 } },
  { nome: 'Raphael Veiga', posicao: 'MEI', stats: { gol: 1, finalizacaoNaTrave: 1 } },
  { nome: 'Zé Rafael',     posicao: 'MEI', stats: { desarme: 3, faltaSofrida: 2 } },
  { nome: 'Aníbal Moreno', posicao: 'MEI', stats: { desarme: 2, faltaCometida: 3 } },
  { nome: 'Dudu',          posicao: 'ATA', stats: { assistencia: 2, finalizacaoDefendida: 3 } },
  { nome: 'Flaco López ★', posicao: 'ATA', ehCapitao: true, stats: { gol: 2, finalizacaoForA: 2 } },
  { nome: 'Estêvão',       posicao: 'ATA', stats: { gol: 1, finalizacaoNaTrave: 1, faltaSofrida: 2 } },
]);

console.log('\n Jogador                    Pos   Cap    Pontos');
console.log(' ' + '─'.repeat(50));
for (const j of time.jogadores) {
  const cap = j.ehCapitao ? ' ★' : '  ';
  const pts = (j.total >= 0 ? '+' : '') + j.total.toFixed(1);
  const nome = j.nome.padEnd(26).slice(0, 26);
  console.log(` ${nome}  ${j.posicao}  ${cap}    ${pts}`);
}
console.log(' ' + '─'.repeat(50));
console.log(` TOTAL DO TIME:${''.padEnd(32)} ${time.totalTime >= 0 ? '+' : ''}${time.totalTime.toFixed(1)}`);
