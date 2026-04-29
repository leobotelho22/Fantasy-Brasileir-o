/**
 * Esquemas (estruturas) das coleções do Firestore — Fantasy Brasileirão
 *
 * Este arquivo define a "forma" de cada documento.
 * Use como referência ao criar ou ler dados no app.
 *
 * Em TypeScript real, isso seria feito com interfaces/types.
 * Aqui usamos objetos JS com JSDoc para manter simples.
 */

// ---------------------------------------------------------------------------
// Fábricas de documento (criam objetos com valores padrão)
// ---------------------------------------------------------------------------

/**
 * Cria um documento de usuário.
 * Coleção: users/{userId}
 */
function criarUsuario({ userId, name, email, photoUrl = '' }) {
  return {
    userId,
    name,
    email,
    photoUrl,
    username:     '',
    balance:      100,      // cartoletas iniciais
    patrimony:    100,
    totalPoints:  0,
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  };
}

/**
 * Cria um documento de jogador real.
 * Coleção: players/{playerId}
 */
function criarJogador({
  playerId, name, nickname = '', clubId, clubName,
  position, photoUrl = '', shirtNumber = 0, price,
}) {
  return {
    playerId,
    name,
    nickname: nickname || name,
    clubId,
    clubName,
    clubBadgeUrl: '',
    position,          // 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA'
    photoUrl,
    shirtNumber,
    price,
    priceVariation:    0,
    averagePoints:     0,
    totalPoints:       0,
    roundsPlayed:      0,
    status:            'available',  // available | injured | suspended | doubtful
    statusNote:        '',
    isDraftAvailable:  true,
    updatedAt:         new Date().toISOString(),
  };
}

/**
 * Cria um documento de liga.
 * Coleção: leagues/{leagueId}
 */
function criarLiga({
  leagueId, name, ownerId, type = 'draft',
  maxMembers = 10, draftDate = null,
}) {
  return {
    leagueId,
    name,
    code:       gerarCodigoLiga(),
    ownerId,
    type,                    // 'draft' | 'classic'
    status:    'setup',      // setup | draft | active | finished
    maxMembers,
    isPublic:  false,
    createdAt: new Date().toISOString(),
    settings: {
      competitionFormat: 'points',  // points | head_to_head | playoffs
      draftType:         'snake',
      draftDate,
      timePerPick:       60,        // segundos
      rosterSize:        15,        // jogadores no elenco
      startersCount:     11,
      benchCount:        4,
    },
  };
}

/**
 * Cria um documento de membro de liga.
 * Subcoleção: leagues/{leagueId}/members/{userId}
 */
function criarMembro({ userId, teamId, role = 'member' }) {
  return {
    userId,
    teamId,
    joinedAt:      new Date().toISOString(),
    draftPosition: null,   // definida quando o draft for sorteado
    role,                  // 'owner' | 'member'
    totalPoints:   0,
  };
}

/**
 * Cria um documento de time fantasy.
 * Coleção: fantasyTeams/{teamId}
 */
function criarTimeFantasy({ teamId, name, ownerId, leagueId, logoUrl = '' }) {
  return {
    teamId,
    name,
    logoUrl,
    ownerId,
    leagueId,
    totalPoints:          0,
    currentRoundPoints:   0,
    rosterValue:          0,
    createdAt:            new Date().toISOString(),
  };
}

/**
 * Cria um item do elenco (roster) de um time.
 * Subcoleção: fantasyTeams/{teamId}/roster/{playerId}
 */
function criarItemElenco({
  playerId, playerName, position,
  acquiredVia = 'draft', draftRound = null, draftPick = null,
}) {
  return {
    playerId,
    playerName,
    position,
    acquiredAt:  new Date().toISOString(),
    acquiredVia,   // 'draft' | 'trade' | 'waiver'
    draftRound,
    draftPick,
  };
}

/**
 * Cria uma escalação para uma rodada.
 * Coleção: lineups/{leagueId}_{teamId}_{roundId}
 */
function criarEscalacao({ teamId, leagueId, roundId, scheme = '4-3-3' }) {
  return {
    teamId,
    leagueId,
    roundId,
    scheme,
    captainId:  null,
    isLocked:   false,
    lockedAt:   null,
    starters:   [],   // array de playerIds (11 titulares)
    bench:      [],   // array de playerIds (reservas)
  };
}

/**
 * Cria as estatísticas de um jogador em uma rodada.
 * Coleção: playerStats/{roundId}_{playerId}
 */
function criarEstatisticas({ playerId, roundId, matchId, clubId, position }) {
  return {
    playerId,
    roundId,
    matchId,
    clubId,
    position,
    minutosJogados: 0,
    points:         0,
    scouts: {
      // Ataque
      gol:                     0,
      assistencia:             0,
      finalizacaoNaTrave:      0,
      finalizacaoDefendida:    0,
      finalizacaoForA:         0,
      faltaSofrida:            0,
      penaltiSofrido:          0,
      impedimento:             0,
      penaltiPerdidoForA:      0,
      penaltiPerdidoDefendido: 0,
      penaltiPerdidoTrave:     0,
      // Defesa
      jogoSemGol:              0,
      defesa:                  0,   // exclusivo GOL
      defesaPenalti:           0,   // exclusivo GOL
      desarme:                 0,
      golContra:               0,
      cartaoVermelho:          0,
      cartaoAmarelo:           0,
      golSofrido:              0,
      faltaCometida:           0,
      penaltiCometido:         0,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Cria o estado inicial de um draft.
 * Coleção: drafts/{leagueId}
 */
function criarDraft({ leagueId, numTeams, rosterSize, timePerPick = 60, draftOrder }) {
  return {
    leagueId,
    status:        'waiting',   // waiting | active | paused | completed
    draftType:     'snake',
    numTeams,
    totalRounds:   rosterSize,
    totalPicks:    numTeams * rosterSize,
    timePerPick,
    currentPick:   1,
    currentRound:  1,
    currentTeamId: draftOrder[0],
    pickDeadline:  null,
    draftOrder,               // [teamId1, teamId2, ...] — embaralhado no início
    startedAt:     null,
    completedAt:   null,
  };
}

/**
 * Cria um registro de pick do draft.
 * Subcoleção: drafts/{leagueId}/picks/{pickNumber}
 */
function criarPick({
  pickNumber, round, pickInRound,
  teamId, teamName, playerId, playerName, playerPosition,
  isAutoPick = false,
}) {
  return {
    pickNumber,
    round,
    pickInRound,
    teamId,
    teamName,
    playerId,
    playerName,
    playerPosition,
    isAutoPick,
    pickedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function gerarCodigoLiga() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

// ---------------------------------------------------------------------------
// IDs padronizados
// ---------------------------------------------------------------------------
const IDs = {
  lineup:      (leagueId, teamId, roundId)  => `${leagueId}_${teamId}_${roundId}`,
  roundScore:  (leagueId, roundId, teamId)  => `${leagueId}_${roundId}_${teamId}`,
  playerStats: (roundId, playerId)          => `${roundId}_${playerId}`,
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  criarUsuario,
  criarJogador,
  criarLiga,
  criarMembro,
  criarTimeFantasy,
  criarItemElenco,
  criarEscalacao,
  criarEstatisticas,
  criarDraft,
  criarPick,
  IDs,
};
