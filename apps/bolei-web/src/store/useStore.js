import { create } from 'zustand';
import {
  MY_TEAM, LEAGUE, AUCTIONS, FREE_AGENTS, TRADES, DRAFT_STATE, ROUND, ALL_PLAYERS,
} from '../data/mock';
import { MAX_SQUAD, MIN_BID_INCREMENT, canBid, canDropPlayer, canAddPlayer, isAuctionActive } from '../lib/guards';

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  isLoggedIn: false,
  user: null,
  login:  (name, email) => set({ isLoggedIn: true, user: { name, email } }),
  logout: () => set({ isLoggedIn: false, user: null }),

  // ── Team & coins ──────────────────────────────────────────────────────────
  team:  MY_TEAM,
  coins: 1000,

  // ── Round / League ────────────────────────────────────────────────────────
  round:  ROUND,
  league: LEAGUE,

  // ── Player statuses (live overrides on top of mock data) ──────────────────
  // Keys are player IDs, values are 'probable' | 'bench' | 'injured' | 'suspended'.
  // When empty the mock status from ALL_PLAYERS is used.
  playerStatuses: {},

  // Call this with data from an API to update one or many players at once.
  // Example: store.updatePlayerStatuses({ p3: 'probable', p18: 'injured' })
  updatePlayerStatuses: (updates) =>
    set(state => ({ playerStatuses: { ...state.playerStatuses, ...updates } })),

  // Resolve final status for a player (live override takes precedence over mock).
  getPlayerStatus: (playerId) => {
    const state = get();
    return state.playerStatuses[playerId] ?? ALL_PLAYERS.find(p => p.id === playerId)?.status ?? 'probable';
  },

  // ── Toast notifications ───────────────────────────────────────────────────
  notifications: [],

  addToast: (message, type = 'info', title = null) => {
    const id = Date.now() + Math.random();
    set(state => ({
      notifications: [
        { id, message, type, title },
        ...state.notifications,
      ].slice(0, 5),
    }));
    setTimeout(() => get().dismissToast(id), 5000);
  },

  dismissToast: (id) =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),

  // ── Auctions ──────────────────────────────────────────────────────────────
  auctions: AUCTIONS,

  placeBid: (auctionId, amount, dropPlayerId = null) => {
    const state   = get();
    const auction = state.auctions.find(a => a.id === auctionId);
    if (!auction) return;

    const alreadyWinning = auction.highBidderTeamId === 'team_me';

    // Guard: validate bid
    const bidError = canBid(auction, amount, state.coins, alreadyWinning);
    if (bidError) {
      state.addToast(bidError, 'error', 'Lance recusado');
      return;
    }

    // Guard: if dropping a player, ensure they're not reserved
    if (dropPlayerId) {
      const dropError = canDropPlayer(state.team, dropPlayerId, state.reservedPlayerIds);
      if (dropError) {
        state.addToast(dropError, 'error', 'Jogador bloqueado');
        return;
      }
    }

    // Guard: squad cap — only enforce when not already winning (slot already "reserved")
    if (!alreadyWinning && !dropPlayerId) {
      const addError = canAddPlayer(state.team, auction.player ?? { id: auctionId, nick: 'jogador' });
      if (addError) {
        state.addToast(addError, 'error', 'Time cheio');
        return;
      }
    }

    const effectiveCoins = alreadyWinning ? state.coins + (auction.currentBid ?? 0) : state.coins;
    const newCoins  = effectiveCoins - amount;
    const newPlayer = auction.player?.nick ?? 'jogador';

    let newPlayers = [...(state.team.players ?? [])];
    if (dropPlayerId) newPlayers = newPlayers.filter(id => id !== dropPlayerId);

    set({
      coins: newCoins,
      team:  { ...state.team, players: newPlayers },
      auctions: state.auctions.map(a =>
        a.id === auctionId
          ? { ...a, currentBid: amount, highBidder: state.team.name, highBidderTeamId: 'team_me', numBids: a.numBids + 1 }
          : a
      ),
    });

    get().addToast(
      `Lance de ${amount} moedas confirmado em ${newPlayer}.`,
      'success',
      'Lance confirmado ✓'
    );
  },

  // Simula um rival superando seu lance — útil para ver a notificação de "superado"
  simulateOutbid: (auctionId) => {
    const state   = get();
    const auction = state.auctions.find(a => a.id === auctionId);
    if (!auction || auction.highBidderTeamId !== 'team_me') return;

    const rivals  = ['Diretoria FC', 'Viradouro XI', 'Boladas SC', 'Pé de Vento'];
    const rival   = rivals[Math.floor(Math.random() * rivals.length)];
    const newBid  = auction.currentBid + 20;

    set({
      coins:    state.coins + auction.currentBid, // devolve as moedas
      auctions: state.auctions.map(a =>
        a.id === auctionId
          ? { ...a, currentBid: newBid, highBidder: rival, highBidderTeamId: `rival_${Date.now()}`, numBids: a.numBids + 1 }
          : a
      ),
    });

    get().addToast(
      `${rival} deu ${newBid} moedas em ${auction.player?.nick}. Aumente seu lance!`,
      'warning',
      '⚡ Você foi superado!'
    );
  },

  // ── Free agents ───────────────────────────────────────────────────────────
  freeAgents: FREE_AGENTS,

  startAuction: (playerId) => {
    const state  = get();
    const player = ALL_PLAYERS.find(p => p.id === playerId);
    if (!player) return;

    // Guard: don't create auction for a player already in an active auction
    if (state.auctions.some(a => a.playerId === playerId && isAuctionActive(a))) {
      state.addToast(`${player.nick} já está em leilão.`, 'error', 'Erro');
      return;
    }

    const newAuction = {
      id:              `a_${Date.now()}`,
      playerId,
      player,
      currentBid:      10,
      highBidder:      null,
      highBidderTeamId: null,
      numBids:         0,
      endsAt:          new Date(Date.now() + 12 * 3600_000).toISOString(),
    };

    set({
      auctions:   [...state.auctions, newAuction],
      freeAgents: state.freeAgents.filter(p => p.id !== playerId),
    });

    get().addToast(
      `Leilão de ${player.nick} iniciado! Termina em 12 horas.`,
      'info',
      '🔨 Novo leilão'
    );
  },

  // ── Draft ─────────────────────────────────────────────────────────────────
  draft: DRAFT_STATE,

  makeDraftPick: (playerId) => {
    const state = get();
    const { draft, team } = state;
    if (draft.currentTeam !== 'team_me') return;

    // Guard: squad cap
    const player = ALL_PLAYERS.find(p => p.id === playerId);
    const addError = canAddPlayer(team, player ?? { id: playerId, nick: 'jogador' });
    if (addError) {
      state.addToast(addError, 'error', 'Time cheio');
      return;
    }

    const numTeams   = draft.teams.length;
    const newPick    = { pickNumber: draft.currentPick, teamId: 'team_me', teamName: team.name, playerId };
    const newPicks   = [...(draft.picks ?? []), newPick];
    const nextNum    = draft.currentPick + 1;
    const nextRound  = Math.ceil(nextNum / numTeams);
    const posInRound = (nextNum - 1) % numTeams;
    const teamIdx    = nextRound % 2 === 1 ? posInRound : numTeams - 1 - posInRound;
    const nextTeam   = draft.teams[teamIdx] ?? null;

    set({
      team:      { ...team, players: [...(team.players ?? []), playerId] },
      draft:     { ...draft, picks: newPicks, currentPick: nextNum, currentTeam: nextTeam?.id ?? null, currentTeamName: nextTeam?.name ?? null },
      freeAgents: state.freeAgents.filter(p => p.id !== playerId),
    });

    get().addToast(
      `${player?.nick ?? 'Jogador'} adicionado ao seu time!`,
      'success',
      'Pick confirmado ✓'
    );
  },

  // ── Trades ────────────────────────────────────────────────────────────────
  trades: TRADES,

  // IDs dos jogadores do usuário que estão "reservados" em trades pendentes enviados
  reservedPlayerIds: (() => {
    // Seed from the mock outgoing trades
    return TRADES
      .filter(t => t.fromTeamId === 'team_me' && t.status === 'pending')
      .flatMap(t => t.requestedPlayers ?? []);
  })(),

  proposeTrade: ({ toTeamId, toTeamName, offeredPlayerIds, offeredCoins, requestedPlayerIds, requestedCoins }) => {
    const state = get();

    // Guard: can't offer players that are already reserved
    for (const id of offeredPlayerIds) {
      const err = canDropPlayer(state.team, id, state.reservedPlayerIds);
      if (err) {
        state.addToast(err, 'error', 'Trade inválido');
        return;
      }
    }

    const newTrade = {
      id:               `tr_${Date.now()}`,
      fromTeamId:       'team_me',
      fromTeamName:     state.team.name,
      toTeamId,
      toTeamName,
      offeredPlayers:   offeredPlayerIds,
      offeredCoins:     offeredCoins ?? 0,
      requestedPlayers: requestedPlayerIds,
      requestedCoins:   requestedCoins ?? 0,
      status:           'pending',
    };

    set({
      trades:            [...state.trades, newTrade],
      reservedPlayerIds: [...state.reservedPlayerIds, ...offeredPlayerIds],
    });

    get().addToast(
      `Proposta enviada para ${toTeamName}!`,
      'info',
      'Trade enviado'
    );
  },

  acceptTrade: (tradeId) => {
    const state = get();
    const trade = state.trades.find(t => t.id === tradeId);
    if (!trade || trade.toTeamId !== 'team_me') return;

    // Guard: check squad cap after the swap
    const playersAfterRemoval = (state.team.players ?? []).filter(
      id => !(trade.requestedPlayers ?? []).includes(id)
    );
    const incoming = trade.offeredPlayers ?? [];
    if (playersAfterRemoval.length + incoming.length > MAX_SQUAD) {
      state.addToast(
        `Aceitar este trade excederia ${MAX_SQUAD} jogadores no seu time.`,
        'error',
        'Trade recusado'
      );
      return;
    }

    let players = [...playersAfterRemoval];
    incoming.forEach(id => { if (!players.includes(id)) players.push(id); });

    // Remove the received players from reservedPlayerIds (they were reserved by the other team)
    // and add the requested players back (they leave our team, no longer reserved by us either)
    const newReserved = state.reservedPlayerIds.filter(
      id => !(trade.requestedPlayers ?? []).includes(id)
    );

    set({
      team:              { ...state.team, players },
      coins:             state.coins - (trade.requestedCoins ?? 0) + (trade.offeredCoins ?? 0),
      trades:            state.trades.map(t => t.id === tradeId ? { ...t, status: 'accepted' } : t),
      reservedPlayerIds: newReserved,
    });

    get().addToast(
      `Trade com ${trade.fromTeamName} aceito!`,
      'success',
      'Trade aceito ✓'
    );
  },

  rejectTrade: (tradeId) => {
    const state = get();
    const trade = state.trades.find(t => t.id === tradeId);

    // Unreserve players if we were the sender cancelling our own proposal
    let newReserved = state.reservedPlayerIds;
    if (trade?.fromTeamId === 'team_me') {
      newReserved = newReserved.filter(
        id => !(trade.requestedPlayers ?? []).includes(id)
      );
    }

    set({
      trades:            state.trades.map(t => t.id === tradeId ? { ...t, status: 'rejected' } : t),
      reservedPlayerIds: newReserved,
    });

    if (trade) {
      const other = trade.toTeamId === 'team_me' ? trade.fromTeamName : trade.toTeamName;
      get().addToast(`Proposta com ${other} cancelada.`, 'info', 'Trade cancelado');
    }
  },
}));

export default useStore;
