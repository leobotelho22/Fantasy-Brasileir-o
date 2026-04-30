import { create } from 'zustand';
import {
  MY_TEAM, LEAGUE, AUCTIONS, FREE_AGENTS, TRADES, DRAFT_STATE, ROUND, ALL_PLAYERS,
} from '../data/mock';

const MAX_SQUAD = 23;

const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  isLoggedIn: false,
  user: null,
  login: (name, email) => set({ isLoggedIn: true, user: { name, email } }),
  logout: () => set({ isLoggedIn: false, user: null }),

  // ── Team & coins ──────────────────────────────────────────────────────────
  team: MY_TEAM,
  coins: 1000,

  // ── Round ─────────────────────────────────────────────────────────────────
  round: ROUND,

  // ── League ────────────────────────────────────────────────────────────────
  league: LEAGUE,

  // ── Auctions ──────────────────────────────────────────────────────────────
  auctions: AUCTIONS,

  // dropPlayerId: required when squad is full and we're NOT already winning
  placeBid: (auctionId, amount, dropPlayerId = null) => {
    set(state => {
      const auction = state.auctions.find(a => a.id === auctionId);
      if (!auction) return {};
      if (amount <= auction.currentBid) return {};

      // Refund previous bid if we were already the high bidder
      let newCoins = state.coins;
      const alreadyWinning = auction.highBidderTeamId === 'team_me';
      if (alreadyWinning) newCoins += auction.currentBid;
      if (amount > newCoins) return {};

      newCoins -= amount;

      // Drop player from squad if requested
      let newPlayers = [...(state.team.players ?? [])];
      if (dropPlayerId) {
        newPlayers = newPlayers.filter(id => id !== dropPlayerId);
      }

      return {
        coins: newCoins,
        team: { ...state.team, players: newPlayers },
        auctions: state.auctions.map(a =>
          a.id === auctionId
            ? {
                ...a,
                currentBid: amount,
                highBidder: state.team.name,
                highBidderTeamId: 'team_me',
                numBids: a.numBids + 1,
              }
            : a
        ),
      };
    });
  },

  // ── Free agents ───────────────────────────────────────────────────────────
  freeAgents: FREE_AGENTS,

  startAuction: (playerId) => {
    set(state => {
      const player = ALL_PLAYERS.find(p => p.id === playerId);
      if (!player) return {};
      const newAuction = {
        id: `a_${Date.now()}`,
        playerId,
        player,
        currentBid: 10,
        highBidder: null,
        highBidderTeamId: null,
        numBids: 0,
        endsAt: new Date(Date.now() + 12 * 3600_000).toISOString(),
      };
      return {
        auctions: [...state.auctions, newAuction],
        freeAgents: state.freeAgents.filter(p => p.id !== playerId),
      };
    });
  },

  // ── Draft ─────────────────────────────────────────────────────────────────
  draft: DRAFT_STATE,

  makeDraftPick: (playerId) => {
    set(state => {
      const { draft, team } = state;
      if (draft.currentTeam !== 'team_me') return {};
      if ((team.players ?? []).length >= MAX_SQUAD) return {};

      const numTeams = draft.teams.length;
      const newPick = {
        pickNumber: draft.currentPick,
        teamId: 'team_me',
        teamName: team.name,
        playerId,
      };
      const newPicks = [...(draft.picks ?? []), newPick];
      const nextPickNum = draft.currentPick + 1;

      // Snake: odd rounds go left→right, even rounds right→left
      const nextRound = Math.ceil(nextPickNum / numTeams);
      const posInRound = (nextPickNum - 1) % numTeams;
      const teamIdx = nextRound % 2 === 1 ? posInRound : numTeams - 1 - posInRound;
      const nextTeam = draft.teams[teamIdx] ?? null;

      return {
        team: { ...team, players: [...(team.players ?? []), playerId] },
        draft: {
          ...draft,
          picks: newPicks,
          currentPick: nextPickNum,
          currentTeam: nextTeam?.id ?? null,
          currentTeamName: nextTeam?.name ?? null,
        },
        freeAgents: state.freeAgents.filter(p => p.id !== playerId),
      };
    });
  },

  // ── Trades ────────────────────────────────────────────────────────────────
  trades: TRADES,

  acceptTrade: (tradeId) => {
    set(state => {
      const trade = state.trades.find(t => t.id === tradeId);
      if (!trade || trade.toTeamId !== 'team_me') return {};

      let players = [...(state.team.players ?? [])];
      (trade.requestedPlayers ?? []).forEach(id => {
        players = players.filter(p => p !== id);
      });
      (trade.offeredPlayers ?? []).forEach(id => {
        if (!players.includes(id) && players.length < MAX_SQUAD) players.push(id);
      });

      const coins =
        state.coins - (trade.requestedCoins ?? 0) + (trade.offeredCoins ?? 0);

      return {
        team: { ...state.team, players },
        coins,
        trades: state.trades.map(t =>
          t.id === tradeId ? { ...t, status: 'accepted' } : t
        ),
      };
    });
  },

  rejectTrade: (tradeId) => {
    set(state => ({
      trades: state.trades.map(t =>
        t.id === tradeId ? { ...t, status: 'rejected' } : t
      ),
    }));
  },
}));

export default useStore;
