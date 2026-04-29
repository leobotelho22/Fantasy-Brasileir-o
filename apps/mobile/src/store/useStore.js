import { create } from 'zustand';
import {
  MY_TEAM, LEAGUE, AUCTIONS, FREE_AGENTS,
  TRADES, DRAFT_STATE, ALL_PLAYERS, ROUND,
} from '../data/mock';

const useStore = create((set, get) => ({
  // ── Autenticação ──────────────────────────────────────────────────────
  isLoggedIn: false,
  user: null,

  login: (name, email) => set({
    isLoggedIn: true,
    user: { name, email, id: 'user_me' },
  }),
  logout: () => set({ isLoggedIn: false, user: null }),

  // ── Time e moedas ─────────────────────────────────────────────────────
  team:   MY_TEAM,
  coins:  MY_TEAM.coins,
  round:  ROUND,

  setCaptain: (playerId) =>
    set(s => ({ team: { ...s.team, captain: playerId } })),

  setScheme: (scheme) =>
    set(s => ({ team: { ...s.team, scheme } })),

  // ── Liga ──────────────────────────────────────────────────────────────
  league: LEAGUE,

  // ── Leilões ───────────────────────────────────────────────────────────
  auctions: AUCTIONS,

  // Dar lance em um leilão
  placeBid: (auctionId, amount) => {
    const { coins, user, auctions } = get();

    if (!user) return { ok: false, msg: 'Faça login primeiro.' };
    if (amount < 1) return { ok: false, msg: 'Lance mínimo: 1 moeda.' };
    if (amount > coins) return { ok: false, msg: 'Saldo insuficiente.' };

    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return { ok: false, msg: 'Leilão não encontrado.' };
    if (amount <= auction.currentBid)
      return { ok: false, msg: `Lance mínimo: ${auction.currentBid + 1} moedas.` };

    // Devolve moedas do lance anterior se era o nosso
    const wasHighBidder = auction.highBidTeam === 'team_me';
    const refund = wasHighBidder ? auction.currentBid : 0;

    set(s => ({
      coins: s.coins - amount + refund,
      auctions: s.auctions.map(a =>
        a.id === auctionId
          ? { ...a, currentBid: amount, highBidder: user.name,
              highBidTeam: 'team_me', numBids: a.numBids + 1 }
          : a
      ),
    }));
    return { ok: true, msg: `Lance de ${amount} moedas registrado!` };
  },

  // Enviar free agent para leilão
  startAuction: (playerId) => {
    const player = ALL_PLAYERS.find(p => p.id === playerId);
    if (!player) return;

    const newAuction = {
      id: `auc_${Date.now()}`,
      player,
      currentBid:  1,
      highBidder:  get().user?.name ?? 'Você',
      highBidTeam: 'team_me',
      endsAt: new Date(Date.now() + 12 * 3600_000).toISOString(),
      numBids: 1,
      startedBy: get().user?.name ?? 'Você',
    };

    set(s => ({
      auctions:   [newAuction, ...s.auctions],
      freeAgents: s.freeAgents.filter(p => p.id !== playerId),
    }));
  },

  // ── Free Agents ───────────────────────────────────────────────────────
  freeAgents: FREE_AGENTS,

  // ── Draft ─────────────────────────────────────────────────────────────
  draft: DRAFT_STATE,

  makeDraftPick: (playerId) => {
    const { draft, team, user } = get();
    if (draft.status !== 'active') return { ok: false, msg: 'Draft não está ativo.' };

    const myTurn = draft.draftOrder[
      snakeIndex(draft.currentPick, draft.draftOrder.length)
    ]?.teamId === 'team_me';

    if (!myTurn) return { ok: false, msg: 'Não é a sua vez.' };

    const player = ALL_PLAYERS.find(p => p.id === playerId);
    const newPick = {
      pick:   draft.currentPick,
      round:  draft.currentRound,
      teamId: 'team_me',
      player,
    };

    const nextPick = draft.currentPick + 1;
    const total    = draft.draftOrder.length * draft.totalRounds;
    const done     = nextPick > total;
    const nextRound = Math.ceil(nextPick / draft.draftOrder.length);

    set(s => ({
      team: { ...s.team, players: [...s.team.players, playerId] },
      draft: {
        ...s.draft,
        picks:        [...s.draft.picks, newPick],
        currentPick:  nextPick,
        currentRound: nextRound,
        pickDeadline: new Date(Date.now() + draft.timePerPick * 1000).toISOString(),
        status:       done ? 'completed' : 'active',
      },
    }));
    return { ok: true };
  },

  // ── Trades ────────────────────────────────────────────────────────────
  trades: TRADES,

  acceptTrade: (tradeId) => {
    set(s => ({
      trades: s.trades.map(t =>
        t.id === tradeId ? { ...t, status: 'accepted' } : t
      ),
    }));
  },

  rejectTrade: (tradeId) => {
    set(s => ({
      trades: s.trades.map(t =>
        t.id === tradeId ? { ...t, status: 'rejected' } : t
      ),
    }));
  },

  proposeTrade: (trade) => {
    set(s => ({
      trades: [{ ...trade, id: `trade_${Date.now()}`, status:'pending',
                 type:'outgoing', expiresAt: new Date(Date.now()+24*3600_000).toISOString() },
               ...s.trades],
    }));
  },
}));

// Calcula o índice no draftOrder para um pick no snake
function snakeIndex(pick, n) {
  const round      = Math.ceil(pick / n);
  const pickInRound = ((pick - 1) % n);
  return round % 2 === 1 ? pickInRound : n - 1 - pickInRound;
}

export default useStore;
