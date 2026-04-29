/**
 * Cliente da API não oficial do Sofascore — Fantasy Brasileirão
 *
 * O Sofascore não tem API pública oficial. Este cliente usa os mesmos
 * endpoints que o site sofascore.com usa internamente.
 *
 * Limitações:
 *   - Pode mudar sem aviso
 *   - Não use em escala comercial
 *   - Respeite o rate limit (veja DELAY_ENTRE_REQUESTS)
 *
 * IDs fixos do Brasileirão Série A:
 *   Torneio: 325
 *   Temporada 2024: 57478
 *   Temporada 2025: buscar com buscarTemporadaAtual()
 */

const https = require('https');

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const BASE_URL   = 'https://api.sofascore.com/api/v1';
const TORNEIO_ID = 325;   // Brasileirão Série A — ID fixo, nunca muda

// Intervalo mínimo entre requisições (em ms) para não ser bloqueado
const DELAY_ENTRE_REQUESTS = 1500;   // 1.5 segundos

// Cabeçalhos necessários para o Sofascore aceitar a requisição
const HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':          'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Referer':         'https://www.sofascore.com/',
  'Cache-Control':   'no-cache',
};

// ---------------------------------------------------------------------------
// Função base de requisição HTTP
// ---------------------------------------------------------------------------

/**
 * Faz uma requisição GET para a API do Sofascore.
 *
 * @param {string} endpoint - caminho após o BASE_URL (ex: '/event/123/lineups')
 * @returns {Promise<Object>} dados JSON da resposta
 */
function get(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;

    const req = https.get(url, { headers: HEADERS }, (res) => {
      const chunks = [];

      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode === 429) {
          return reject(new Error('Rate limit atingido. Aguarde antes de tentar novamente.'));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} em ${endpoint}`));
        }
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch {
          reject(new Error('Resposta inválida (não é JSON).'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error(`Timeout após 10s em ${endpoint}`));
    });
  });
}

/**
 * Aguarda N milissegundos (para respeitar o rate limit entre requisições).
 */
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// 1. TEMPORADAS
// ---------------------------------------------------------------------------

/**
 * Busca todas as temporadas do Brasileirão Série A.
 * Use para descobrir o ID da temporada atual.
 *
 * @returns {Promise<Array<{ id, year }>>}
 */
async function buscarTemporadas() {
  const data = await get(`/unique-tournament/${TORNEIO_ID}/seasons`);
  return data.seasons.map(s => ({
    id:   s.id,
    year: s.year,
    name: s.name,
  }));
}

/**
 * Retorna o ID da temporada mais recente (atual).
 *
 * @returns {Promise<{ id: number, year: string }>}
 */
async function buscarTemporadaAtual() {
  const temporadas = await buscarTemporadas();
  // A mais recente é a primeira da lista
  return temporadas[0];
}

// ---------------------------------------------------------------------------
// 2. RODADAS E PARTIDAS
// ---------------------------------------------------------------------------

/**
 * Busca todas as partidas de uma rodada específica.
 *
 * @param {number} seasonId  - ID da temporada (ex: 57478)
 * @param {number} rodada    - Número da rodada (1 a 38)
 * @returns {Promise<Array>} lista de partidas
 */
async function buscarPartidasDaRodada(seasonId, rodada) {
  const data = await get(
    `/unique-tournament/${TORNEIO_ID}/season/${seasonId}/events/round/${rodada}`
  );

  return data.events.map(e => ({
    id:            e.id,
    rodada:        e.roundInfo?.round ?? rodada,
    status:        traduzirStatus(e.status?.type),
    timeCasa:      { id: e.homeTeam.id, nome: e.homeTeam.name, gols: e.homeScore?.current ?? null },
    timeVisitante: { id: e.awayTeam.id, nome: e.awayTeam.name, gols: e.awayScore?.current ?? null },
    inicio:        e.startTimestamp ? new Date(e.startTimestamp * 1000).toISOString() : null,
  }));
}

/**
 * Busca as partidas que estão acontecendo agora no futebol.
 * Filtra apenas partidas do Brasileirão Série A.
 *
 * @returns {Promise<Array>}
 */
async function buscarPartidasAoVivo() {
  const data = await get('/sport/football/events/live');

  return (data.events ?? [])
    .filter(e => e.tournament?.uniqueTournament?.id === TORNEIO_ID)
    .map(e => ({
      id:            e.id,
      status:        traduzirStatus(e.status?.type),
      minuto:        e.time?.currentPeriodStartTimestamp
        ? Math.floor((Date.now() / 1000 - e.time.currentPeriodStartTimestamp) / 60)
        : null,
      timeCasa:      { id: e.homeTeam.id, nome: e.homeTeam.name, gols: e.homeScore?.current ?? 0 },
      timeVisitante: { id: e.awayTeam.id, nome: e.awayTeam.name, gols: e.awayScore?.current ?? 0 },
    }));
}

// ---------------------------------------------------------------------------
// 3. SCOUTS POR PARTIDA (o coração do sistema)
// ---------------------------------------------------------------------------

/**
 * Busca os scouts detalhados de cada jogador em uma partida.
 * Este é o endpoint mais importante — retorna tudo que precisamos para pontuar.
 *
 * @param {number} eventId - ID da partida no Sofascore
 * @returns {Promise<Array<JogadorComScouts>>}
 */
async function buscarScoutsPartida(eventId) {
  const data = await get(`/event/${eventId}/lineups`);

  const jogadores = [];

  for (const lado of ['home', 'away']) {
    const time = data[lado];
    if (!time?.players) continue;

    for (const entrada of time.players) {
      const p   = entrada.player;
      const s   = entrada.statistics ?? {};
      const pos = traduzirPosicao(p.position ?? entrada.position);

      jogadores.push({
        // Identificação
        sofascoreId:    p.id,
        nome:           p.name,
        nomeAbreviado:  p.shortName ?? p.name,
        posicao:        pos,
        timeId:         time.team?.id,
        timeNome:       time.team?.name,
        lado,           // 'home' ou 'away'

        // Scouts brutos do Sofascore (valores originais)
        raw: s,

        // Scouts mapeados para o nosso formato
        scouts: mapearScoutsSofascore(s, pos),

        // Minutos jogados
        minutosJogados: s.minutesPlayed ?? 0,
        titular:        entrada.position !== undefined && !entrada.substitute,
      });
    }
  }

  return jogadores;
}

/**
 * Busca os incidentes de uma partida (gols, cartões, pênaltis).
 * Necessário para distinguir os 3 tipos de pênalti perdido.
 *
 * @param {number} eventId
 * @returns {Promise<Array>}
 */
async function buscarIncidentesPartida(eventId) {
  const data = await get(`/event/${eventId}/incidents`);

  return (data.incidents ?? []).map(inc => ({
    tipo:      inc.incidentType,    // 'goal', 'card', 'penalty', etc.
    minuto:    inc.time,
    jogadorId: inc.player?.id,
    detalhe:   inc.incidentClass,   // 'regular', 'missed', 'saved', etc.
    timeLado:  inc.isHome ? 'home' : 'away',
  }));
}

// ---------------------------------------------------------------------------
// 4. ELENCOS (rosters)
// ---------------------------------------------------------------------------

/**
 * Busca o elenco completo de um time.
 *
 * @param {number} teamId - ID do time no Sofascore
 * @returns {Promise<Array<Jogador>>}
 */
async function buscarElencoTime(teamId) {
  const data = await get(`/team/${teamId}/players`);

  return (data.players ?? []).map(entrada => ({
    sofascoreId:   entrada.player.id,
    nome:          entrada.player.name,
    nomeAbreviado: entrada.player.shortName ?? entrada.player.name,
    posicao:       traduzirPosicao(entrada.player.position),
    numeroCamisa:  entrada.player.jerseyNumber ?? null,
    pais:          entrada.player.nationality ?? null,
    idade:         entrada.player.dateOfBirthTimestamp
      ? calcularIdade(entrada.player.dateOfBirthTimestamp)
      : null,
    timeId,
  }));
}

/**
 * Busca elencos de todos os times do Brasileirão de uma vez.
 * Adiciona delay entre cada time para não ser bloqueado.
 *
 * @param {Array<number>} teamIds - IDs dos 20 times da Série A
 * @returns {Promise<Object>} { teamId: [jogadores] }
 */
async function buscarTodosElencos(teamIds) {
  const resultado = {};

  for (const teamId of teamIds) {
    console.log(`  Buscando elenco do time ${teamId}...`);
    try {
      resultado[teamId] = await buscarElencoTime(teamId);
    } catch (err) {
      console.error(`  Erro no time ${teamId}: ${err.message}`);
      resultado[teamId] = [];
    }
    await esperar(DELAY_ENTRE_REQUESTS);
  }

  return resultado;
}

/**
 * Busca estatísticas acumuladas de um jogador na temporada.
 *
 * @param {number} playerId
 * @param {number} seasonId
 * @returns {Promise<Object>}
 */
async function buscarStatsJogadorTemporada(playerId, seasonId) {
  const data = await get(
    `/player/${playerId}/unique-tournament/${TORNEIO_ID}/season/${seasonId}/statistics/overall`
  );

  const s = data.statistics ?? {};
  return {
    sofascoreId:    playerId,
    temporadaId:    seasonId,
    jogosDisputados: s.appearances ?? 0,
    minutosTotais:  s.minutesPlayed ?? 0,
    gols:           s.goals ?? 0,
    assistencias:   s.goalAssist ?? 0,
    amarelos:       s.yellowCards ?? 0,
    vermelhos:      s.redCards ?? 0,
  };
}

// ---------------------------------------------------------------------------
// 5. Mapeador: Sofascore → Nossos Scouts
// ---------------------------------------------------------------------------

/**
 * Converte os campos brutos do Sofascore para o formato dos nossos scouts.
 *
 * LEGENDA dos campos Sofascore usados:
 *   goals                   → gols marcados
 *   goalAssist              → assistências
 *   onTargetScoringAttempt  → finalizações no alvo (inclui gols)
 *   blockedScoringAttempt   → finalizações bloqueadas por defensores
 *   missedBalls             → finalizações para fora (alto ou longe)
 *   hitWoodwork             → finalizações na trave
 *   wasFouled               → faltas sofridas
 *   penaltyWon              → pênaltis sofridos
 *   offsideGiven            → impedimentos
 *   ownGoals                → gols contra
 *   yellowCards             → cartões amarelos
 *   redCards                → cartões vermelhos
 *   foulsCommitted          → faltas cometidas
 *   penaltyConceded         → pênaltis cometidos
 *   tackles                 → desarmes
 *   saves                   → defesas (GOLEIRO)
 *   penaltySave             → defesas de pênalti (GOLEIRO)
 *   goalsConceded           → gols sofridos (GOLEIRO)
 *
 * @param {Object} s       - statistics do Sofascore
 * @param {string} posicao - 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA'
 * @returns {Object} scouts no formato do nosso sistema
 */
function mapearScoutsSofascore(s, posicao) {
  // finalizacaoDefendida = chutes no alvo que não viraram gol
  const chutesNoAlvo      = s.onTargetScoringAttempt ?? 0;
  const golsFeitos        = s.goals ?? 0;
  const finalizacaoDefendida = Math.max(0, chutesNoAlvo - golsFeitos);

  // finalizacaoForA = bloqueados + para fora/alto
  const finalizacaoForA = (s.blockedScoringAttempt ?? 0) + (s.missedBalls ?? 0);

  return {
    // ── Ataque ──────────────────────────────────────────────────────────────
    gol:                       golsFeitos,
    assistencia:               s.goalAssist              ?? 0,
    finalizacaoNaTrave:        s.hitWoodwork             ?? 0,
    finalizacaoDefendida,
    finalizacaoForA,
    faltaSofrida:              s.wasFouled               ?? 0,
    penaltiSofrido:            s.penaltyWon              ?? 0,
    impedimento:               s.offsideGiven            ?? 0,
    // Pênalti perdido: distinguido pelos incidentes (veja mapearPenaltisPerdidos)
    penaltiPerdidoForA:        0,
    penaltiPerdidoDefendido:   0,
    penaltiPerdidoTrave:       0,

    // ── Defesa ──────────────────────────────────────────────────────────────
    jogoSemGol:                0,   // calculado pelo placar ao fim da partida
    defesa:     posicao === 'GOL' ? (s.saves               ?? 0) : 0,
    defesaPenalti: posicao === 'GOL' ? (s.penaltySave      ?? 0) : 0,
    golSofrido: posicao === 'GOL' ? (s.goalsConceded       ?? 0) : 0,
    desarme:                   s.tackles                  ?? 0,
    golContra:                 s.ownGoals                 ?? 0,
    cartaoVermelho:            s.redCards                 ?? 0,
    cartaoAmarelo:             s.yellowCards              ?? 0,
    faltaCometida:             s.foulsCommitted           ?? 0,
    penaltiCometido:           s.penaltyConceded          ?? 0,
  };
}

/**
 * Enriquece os scouts com os dados de pênalti perdido dos incidentes.
 * Distingue as 3 variantes: para fora (-3.2), defendido (-2.8), trave (-1).
 *
 * @param {Array} jogadores - resultado de buscarScoutsPartida()
 * @param {Array} incidentes - resultado de buscarIncidentesPartida()
 * @returns {Array} jogadores com penaltiPerdido* preenchidos
 */
function mapearPenaltisPerdidos(jogadores, incidentes) {
  const penaltisMissed = incidentes.filter(
    i => i.tipo === 'penalty' && i.detalhe !== 'scored'
  );

  return jogadores.map(j => {
    const pps = penaltisMissed.filter(p => p.jogadorId === j.sofascoreId);

    let pForA      = 0;
    let pDefendido = 0;
    let pTrave     = 0;

    for (const pp of pps) {
      if (pp.detalhe === 'missed')  pForA++;        // para fora ou alto
      if (pp.detalhe === 'saved')   pDefendido++;   // goleiro defendeu
      if (pp.detalhe === 'woodwork') pTrave++;      // bateu na trave
    }

    return {
      ...j,
      scouts: {
        ...j.scouts,
        penaltiPerdidoForA:      pForA,
        penaltiPerdidoDefendido: pDefendido,
        penaltiPerdidoTrave:     pTrave,
      },
    };
  });
}

/**
 * Preenche o scout jogoSemGol com base no placar final da partida.
 *
 * @param {Array} jogadores
 * @param {{ golsCasa: number, golsVisitante: number }} placar
 * @returns {Array}
 */
function aplicarJogoSemGol(jogadores, placar) {
  return jogadores.map(j => {
    const golsSofridos = j.lado === 'home'
      ? placar.golsVisitante
      : placar.golsCasa;

    const jogoSemGol = golsSofridos === 0 ? 1 : 0;

    return {
      ...j,
      scouts: { ...j.scouts, jogoSemGol },
    };
  });
}

// ---------------------------------------------------------------------------
// 6. Helpers de tradução
// ---------------------------------------------------------------------------

function traduzirPosicao(posSOFA) {
  const mapa = {
    G:  'GOL',  // Goalkeeper
    D:  'ZAG',  // Defender (tratamos todos como ZAG; lateral é ajustado manualmente)
    M:  'MEI',  // Midfielder
    F:  'ATA',  // Forward
    // Sofascore às vezes usa:
    GK: 'GOL',
    DF: 'ZAG',
    MF: 'MEI',
    FW: 'ATA',
  };
  return mapa[posSOFA] ?? 'MEI';
}

function traduzirStatus(statusSOFA) {
  const mapa = {
    notstarted:  'agendado',
    inprogress:  'ao_vivo',
    finished:    'encerrado',
    postponed:   'adiado',
    canceled:    'cancelado',
    halftime:    'intervalo',
  };
  return mapa[statusSOFA] ?? statusSOFA;
}

function calcularIdade(timestampNascimento) {
  const nascimento = new Date(timestampNascimento * 1000);
  const hoje       = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  if (
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
  ) idade--;
  return idade;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  // API
  buscarTemporadas,
  buscarTemporadaAtual,
  buscarPartidasDaRodada,
  buscarPartidasAoVivo,
  buscarScoutsPartida,
  buscarIncidentesPartida,
  buscarElencoTime,
  buscarTodosElencos,
  buscarStatsJogadorTemporada,
  // Mapeadores
  mapearScoutsSofascore,
  mapearPenaltisPerdidos,
  aplicarJogoSemGol,
  // Helpers (exportados para testes)
  traduzirPosicao,
  traduzirStatus,
  TORNEIO_ID,
  DELAY_ENTRE_REQUESTS,
};
