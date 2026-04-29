/**
 * Calculadora de pontuação — Fantasy Brasileirão (baseado no Cartola FC)
 *
 * Uso básico:
 *   const { calcularPontuacao } = require('./calculator');
 *   const resultado = calcularPontuacao('ATA', { gol: 2, assistencia: 1 });
 */

const { REGRAS_POR_POSICAO, LIMITES } = require('./rules');

// ---------------------------------------------------------------------------
// Tipos de estatísticas por posição (documentação para o dev)
// ---------------------------------------------------------------------------
//
// GOL: { gol, assistencia, defesaDificil, defesaPenalti, golSofrido,
//        cartaoAmarelo, cartaoVermelho, golContra, penaltiCometido,
//        penaltiPerdido, faltaCometida }
//
// ZAG: { gol, assistencia, desarme, interceptacao, bloqueio,
//        cartaoAmarelo, cartaoVermelho, golContra, penaltiCometido,
//        penaltiPerdido, faltaCometida }
//
// LAT: { gol, assistencia, cruzamentoCerto, desarme, interceptacao,
//        cartaoAmarelo, cartaoVermelho, golContra, penaltiCometido,
//        penaltiPerdido, faltaCometida }
//
// MEI: { gol, assistencia, finalizacaoNaTrave, finalizacaoCerta,
//        driblesCompletos, desarme,
//        cartaoAmarelo, cartaoVermelho, golContra, penaltiCometido,
//        penaltiPerdido, faltaCometida }
//
// ATA: { gol, assistencia, finalizacaoNaTrave, finalizacaoCerta,
//        driblesCompletos,
//        cartaoAmarelo, cartaoVermelho, golContra, penaltiCometido,
//        penaltiPerdido, faltaCometida }
//
// TEC: { vitoria|empate|derrota (exclusivos), golMarcado, golSofrido,
//        cartaoAmarelo, cartaoVermelho }

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

/**
 * Calcula a pontuação de um jogador em uma rodada.
 *
 * @param {string} posicao - 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA' | 'TEC'
 * @param {Object} stats   - Estatísticas da partida (eventos ocorridos)
 * @returns {{ total: number, detalhamento: Object[], erros: string[] }}
 */
function calcularPontuacao(posicao, stats) {
  const erros = validar(posicao, stats);
  if (erros.length > 0) {
    return { total: 0, detalhamento: [], erros };
  }

  const regras = REGRAS_POR_POSICAO[posicao];
  const detalhamento = [];

  for (const [evento, quantidade] of Object.entries(stats)) {
    if (quantidade === 0 || quantidade === undefined || quantidade === null) {
      continue;
    }

    const multiplicador = regras[evento];
    if (multiplicador === undefined) {
      // Evento não existe para esta posição — ignora silenciosamente
      continue;
    }

    const qtd = aplicarLimite(evento, quantidade);
    const pontos = arredondar(qtd * multiplicador);

    detalhamento.push({
      evento,
      quantidade: qtd,
      multiplicador,
      pontos,
    });
  }

  const total = arredondar(
    detalhamento.reduce((soma, linha) => soma + linha.pontos, 0)
  );

  return { total, detalhamento, erros: [] };
}

// ---------------------------------------------------------------------------
// Cálculo com bônus de capitão
// ---------------------------------------------------------------------------

/**
 * Calcula a pontuação de um capitão (pontuação dobrada, como no Cartola FC).
 *
 * @param {string} posicao
 * @param {Object} stats
 * @returns {{ total: number, totalSemBonus: number, detalhamento: Object[], erros: string[] }}
 */
function calcularPontuacaoCapitao(posicao, stats) {
  const resultado = calcularPontuacao(posicao, stats);
  if (resultado.erros.length > 0) return resultado;

  return {
    ...resultado,
    totalSemBonus: resultado.total,
    total: arredondar(resultado.total * 2),
    ehCapitao: true,
  };
}

// ---------------------------------------------------------------------------
// Cálculo de time completo (11 jogadores + capitão)
// ---------------------------------------------------------------------------

/**
 * Calcula a pontuação total de um time em uma rodada.
 *
 * @param {Array<{ posicao: string, stats: Object, ehCapitao?: boolean }>} jogadores
 * @returns {{ totalTime: number, jogadores: Array, erros: string[] }}
 */
function calcularPontuacaoTime(jogadores) {
  if (!Array.isArray(jogadores) || jogadores.length === 0) {
    return { totalTime: 0, jogadores: [], erros: ['Lista de jogadores vazia'] };
  }

  const capitaos = jogadores.filter(j => j.ehCapitao);
  if (capitaos.length > 1) {
    return { totalTime: 0, jogadores: [], erros: ['Apenas 1 capitão é permitido'] };
  }

  const resultado = jogadores.map(({ nome, posicao, stats, ehCapitao }) => {
    const pontuacao = ehCapitao
      ? calcularPontuacaoCapitao(posicao, stats)
      : calcularPontuacao(posicao, stats);

    return { nome: nome ?? posicao, posicao, ehCapitao: !!ehCapitao, ...pontuacao };
  });

  const erros = resultado.flatMap(j => j.erros ?? []);
  const totalTime = arredondar(resultado.reduce((soma, j) => soma + j.total, 0));

  return { totalTime, jogadores: resultado, erros };
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function validar(posicao, stats) {
  const erros = [];
  const posicoesValidas = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA', 'TEC'];

  if (!posicoesValidas.includes(posicao)) {
    erros.push(`Posição inválida: "${posicao}". Use: ${posicoesValidas.join(', ')}`);
  }

  if (!stats || typeof stats !== 'object') {
    erros.push('stats deve ser um objeto com os eventos da partida');
  }

  // Técnico: só pode ter um resultado (vitoria, empate OU derrota)
  if (posicao === 'TEC' && stats) {
    const resultados = ['vitoria', 'empate', 'derrota'].filter(k => stats[k] > 0);
    if (resultados.length > 1) {
      erros.push(`Técnico não pode ter mais de um resultado: ${resultados.join(', ')}`);
    }
  }

  return erros;
}

function aplicarLimite(evento, quantidade) {
  const limite = LIMITES[evento];
  if (limite && quantidade > limite.max) return limite.max;
  return quantidade;
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

// ---------------------------------------------------------------------------
// Utilitário: formatar resultado para exibição no console
// ---------------------------------------------------------------------------

/**
 * Imprime o resultado de calcularPontuacao de forma legível.
 */
function exibirResultado(nome, posicao, resultado) {
  const largura = 48;
  const linha = '─'.repeat(largura);

  console.log(`\n┌${linha}┐`);
  console.log(`│ ${pad(`Jogador: ${nome}`, largura - 2)} │`);
  console.log(`│ ${pad(`Posição: ${posicao}`, largura - 2)} │`);
  if (resultado.ehCapitao) {
    console.log(`│ ${pad('★ CAPITÃO (pontuação dobrada)', largura - 2)} │`);
  }
  console.log(`├${linha}┤`);
  console.log(`│ ${pad('Evento', 26)} ${pad('Qtd', 5)} ${pad('Pts', 7)} │`);
  console.log(`├${linha}┤`);

  for (const linha_ of resultado.detalhamento) {
    const sinal = linha_.pontos >= 0 ? '+' : '';
    const ptsFmt = `${sinal}${linha_.pontos.toFixed(1)}`;
    console.log(`│ ${pad(linha_.evento, 26)} ${pad(String(linha_.quantidade), 5)} ${pad(ptsFmt, 7)} │`);
  }

  console.log(`├${linha}┤`);
  const sinalTotal = resultado.total >= 0 ? '+' : '';
  console.log(`│ ${pad('TOTAL', 26)} ${pad('', 5)} ${pad(`${sinalTotal}${resultado.total.toFixed(1)}`, 7)} │`);
  console.log(`└${linha}┘`);
}

function pad(str, tamanho) {
  return String(str).padEnd(tamanho).slice(0, tamanho);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  calcularPontuacao,
  calcularPontuacaoCapitao,
  calcularPontuacaoTime,
  exibirResultado,
};
