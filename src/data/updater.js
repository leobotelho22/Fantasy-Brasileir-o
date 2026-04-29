/**
 * Atualizador automático de dados — Fantasy Brasileirão
 *
 * Este módulo controla QUANDO e COMO buscar dados do Sofascore,
 * calculando os pontos e salvando no banco.
 *
 * Modos de operação:
 *   - 'idle':    entre rodadas — atualiza apenas elencos (1x/dia)
 *   - 'pre':     até 2h antes da rodada — atualiza status dos jogadores
 *   - 'live':    rodada em andamento — busca scouts a cada 60s
 *   - 'post':    até 2h após o último jogo — busca final dos dados
 *
 * Como rodar (em produção, isso fica numa Firebase Cloud Function):
 *   const updater = require('./updater');
 *   updater.iniciar({ seasonId: 57478, roundId: 15 });
 */

const {
  buscarPartidasAoVivo,
  buscarScoutsPartida,
  buscarIncidentesPartida,
  mapearPenaltisPerdidos,
  aplicarJogoSemGol,
  esperar,          // re-exportado para uso interno
} = require('./sofascore');

const { calcularPontuacao } = require('../scoring/calculator');

// ---------------------------------------------------------------------------
// Estado interno do updater
// ---------------------------------------------------------------------------

let intervaloAtivo = null;
let ultimaAtualizacao = null;

// ---------------------------------------------------------------------------
// Função principal: processar uma partida completa
// ---------------------------------------------------------------------------

/**
 * Busca e processa todos os dados de uma partida:
 * scouts → mapeamento → pênaltis → jogo sem gol → pontuação.
 *
 * @param {number} eventId - ID da partida no Sofascore
 * @returns {Promise<Array<ResultadoJogador>>}
 */
async function processarPartida(eventId) {
  console.log(`\n[Updater] Processando partida ${eventId}...`);

  // 1. Busca scouts de todos os jogadores
  let jogadores = await buscarScoutsPartida(eventId);
  console.log(`  ${jogadores.length} jogadores encontrados`);

  // 2. Busca incidentes (para pênaltis perdidos)
  const incidentes = await buscarIncidentesPartida(eventId);

  // 3. Enriquece com tipos de pênalti perdido
  jogadores = mapearPenaltisPerdidos(jogadores, incidentes);

  // 4. Calcula placar para jogoSemGol
  const placar = calcularPlacar(jogadores);
  jogadores    = aplicarJogoSemGol(jogadores, placar);

  // 5. Calcula pontuação de cada jogador
  const resultados = jogadores.map(j => {
    const pontuacao = calcularPontuacao(j.posicao, j.scouts);
    return {
      sofascoreId:    j.sofascoreId,
      nome:           j.nome,
      posicao:        j.posicao,
      timeNome:       j.timeNome,
      minutosJogados: j.minutosJogados,
      scouts:         j.scouts,
      pontos:         pontuacao.total,
      detalhamento:   pontuacao.detalhamento,
    };
  });

  console.log(`  Pontuações calculadas:`);
  resultados
    .filter(r => r.pontos !== 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 5)
    .forEach(r => console.log(`    ${r.nome.padEnd(20)} ${r.pontos >= 0 ? '+' : ''}${r.pontos.toFixed(1)} pts`));

  return resultados;
}

// ---------------------------------------------------------------------------
// Loop de atualização ao vivo
// ---------------------------------------------------------------------------

/**
 * Inicia o loop de atualização durante uma rodada ao vivo.
 * Busca partidas ao vivo a cada `intervalMs` milissegundos.
 *
 * Em produção, isso seria uma Firebase Cloud Function agendada.
 * Aqui é um loop simples para rodar localmente.
 *
 * @param {Object} opts
 * @param {number} opts.intervalMs   - Intervalo entre atualizações (padrão: 60000 = 1 min)
 * @param {number} opts.maxRodadas   - Quantas vezes atualizar antes de parar
 * @param {Function} opts.onUpdate   - Callback chamado com cada resultado
 */
async function iniciarLoopAoVivo({
  intervalMs  = 60_000,
  maxRodadas  = Infinity,
  onUpdate    = console.log,
} = {}) {
  if (intervaloAtivo) {
    console.log('[Updater] Loop já está ativo. Use pararLoop() primeiro.');
    return;
  }

  console.log(`[Updater] Iniciando loop ao vivo (intervalo: ${intervalMs / 1000}s)`);
  let rodada = 0;

  async function ciclo() {
    rodada++;
    if (rodada > maxRodadas) { pararLoop(); return; }

    console.log(`\n[Updater] Ciclo ${rodada} — ${new Date().toLocaleTimeString('pt-BR')}`);

    try {
      const partidas = await buscarPartidasAoVivo();

      if (partidas.length === 0) {
        console.log('[Updater] Nenhuma partida do Brasileirão ao vivo no momento.');
        return;
      }

      console.log(`[Updater] ${partidas.length} partida(s) ao vivo no Brasileirão.`);

      for (const partida of partidas) {
        console.log(`\n  ${partida.timeCasa.nome} ${partida.timeCasa.gols}-${partida.timeVisitante.gols} ${partida.timeVisitante.nome} (${partida.minuto ?? '?'}')`);

        const resultados = await processarPartida(partida.id);
        ultimaAtualizacao = new Date().toISOString();

        onUpdate({
          partidaId:    partida.id,
          timeCasa:     partida.timeCasa,
          timeVisitante:partida.timeVisitante,
          atualizadoEm: ultimaAtualizacao,
          jogadores:    resultados,
        });
      }
    } catch (err) {
      console.error(`[Updater] Erro no ciclo: ${err.message}`);
    }
  }

  // Executa imediatamente e depois a cada `intervalMs`
  await ciclo();
  intervaloAtivo = setInterval(ciclo, intervalMs);
}

/**
 * Para o loop de atualização ao vivo.
 */
function pararLoop() {
  if (intervaloAtivo) {
    clearInterval(intervaloAtivo);
    intervaloAtivo = null;
    console.log('[Updater] Loop parado.');
  }
}

// ---------------------------------------------------------------------------
// Atualização única (para Cloud Functions com trigger de tempo)
// ---------------------------------------------------------------------------

/**
 * Executa uma atualização única de todas as partidas ao vivo.
 * Ideal para usar em Firebase Cloud Functions com schedule de 1 minuto.
 *
 * Exemplo de uso em Cloud Function:
 *   exports.atualizarScouts = functions.pubsub
 *     .schedule('every 1 minutes')
 *     .onRun(async () => { await executarAtualizacaoUnica(salvarNoFirestore); });
 *
 * @param {Function} salvar - função que recebe os resultados e salva no banco
 */
async function executarAtualizacaoUnica(salvar) {
  const partidas = await buscarPartidasAoVivo();

  if (partidas.length === 0) {
    console.log('[Updater] Sem partidas ao vivo — nenhuma atualização necessária.');
    return { partidas: 0 };
  }

  const resultadosTotais = [];

  for (const partida of partidas) {
    const jogadores = await processarPartida(partida.id);
    resultadosTotais.push({ partida, jogadores });

    if (salvar) await salvar({ partida, jogadores });

    // Delay entre partidas para não sobrecarregar a API
    await new Promise(r => setTimeout(r, 2000));
  }

  return { partidas: partidas.length, resultados: resultadosTotais };
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Determina o placar da partida a partir dos scouts dos jogadores.
 * (Conta os gols e gols contra de cada lado)
 */
function calcularPlacar(jogadores) {
  let golsCasa       = 0;
  let golsVisitante  = 0;

  for (const j of jogadores) {
    const gols       = (j.scouts.gol       ?? 0);
    const golsContra = (j.scouts.golContra  ?? 0);

    if (j.lado === 'home') {
      golsCasa      += gols + golsContra;
      golsVisitante += golsContra;
    } else {
      golsVisitante += gols;
      golsCasa      += golsContra;
    }
  }

  return { golsCasa, golsVisitante };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  processarPartida,
  iniciarLoopAoVivo,
  pararLoop,
  executarAtualizacaoUnica,
};
