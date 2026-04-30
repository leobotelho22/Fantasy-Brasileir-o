import { create } from 'zustand';
import {
  MY_TEAM, LEAGUE, AUCTIONS, FREE_AGENTS, TRADES, DRAFT_STATE, ROUND, ALL_PLAYERS,
} from '../data/mock';

const MAX_SQUAD = 23;

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
    if (!auction || amount <= auction.currentBid) return;

    const alreadyWinning = auction.highBidderTeamId === 'team_me';
    const effectiveCoins = alreadyWinning ? state.coins + auction.currentBid : state.coins;

    if (amount > effectiveCoins) {
      state.addToast('Saldo insuficiente para este lance.', 'error', 'Lance recusado');
      return;
    }

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
    if ((team.players ?? []).length >= MAX_SQUAD) return;

    const numTeams   = draft.teams.length;
    const newPick    = { pickNumber: draft.currentPick, teamId: 'team_me', teamName: team.name, playerId };
    const newPicks   = [...(draft.picks ?? []), newPick];
    const nextNum    = draft.currentPick + 1;
    const nextRound  = Math.ceil(nextNum / numTeams);
    const posInRound = (nextNum - 1) % numTeams;
    const teamIdx    = nextRound % 2 === 1 ? posInRound : numTeams - 1 - posInRound;
    const nextTeam   = draft.teams[teamIdx] ?? null;
    const player     = ALL_PLAYERS.find(p => p.id === playerId);

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

  acceptTrade: (tradeId) => {
    const state = get();
    const trade = state.trades.find(t => t.id === tradeId);
    if (!trade || trade.toTeamId !== 'team_me') return;

    let players = [...(state.team.players ?? [])];
    (trade.requestedPlayers ?? []).forEach(id => { players = players.filter(p => p !== id); });
    (trade.offeredPlayers   ?? []).forEach(id => { if (!players.includes(id) && players.length < MAX_SQUAD) players.push(id); });

    set({
      team:   { ...state.team, players },
      coins:  state.coins - (trade.requestedCoins ?? 0) + (trade.offeredCoins ?? 0),
      trades: state.trades.map(t => t.id === tradeId ? { ...t, status: 'accepted' } : t),
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

    set({ trades: state.trades.map(t => t.id === tradeId ? { ...t, status: 'rejected' } : t) });

    if (trade) {
      const other = trade.toTeamId === 'team_me' ? trade.fromTeamName : trade.toTeamName;
      get().addToast(`Proposta com ${other} cancelada.`, 'info', 'Trade cancelado');
    }
  },
}));

export default useStore;
