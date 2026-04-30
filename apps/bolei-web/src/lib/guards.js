export const MAX_SQUAD = 23;
export const MIN_BID_INCREMENT = 10;

/**
 * Returns an error string if adding the player would violate squad rules, null if OK.
 */
export function canAddPlayer(team, player) {
  if ((team.players ?? []).length >= MAX_SQUAD)
    return `Time cheio (${MAX_SQUAD}/${MAX_SQUAD}). Libere um jogador primeiro.`;
  if ((team.players ?? []).includes(player.id))
    return `${player.nick} já está no seu time.`;
  return null;
}

/**
 * Returns an error string if dropping the player is not allowed, null if OK.
 * reservedIds: player IDs that are locked in a pending outgoing trade.
 */
export function canDropPlayer(team, playerId, reservedIds = []) {
  if (!(team.players ?? []).includes(playerId))
    return 'Jogador não está no seu time.';
  if (reservedIds.includes(playerId))
    return 'Jogador reservado em proposta de trade pendente. Cancele a proposta primeiro.';
  return null;
}

/**
 * Returns an error string if the bid is invalid, null if OK.
 * alreadyWinning: true when the user is the current high bidder (coins are already locked).
 */
export function canBid(auction, amount, userCoins, alreadyWinning) {
  if (new Date(auction.endsAt) <= new Date())
    return 'Leilão já encerrado.';
  const min = (auction.currentBid ?? 0) + MIN_BID_INCREMENT;
  if (isNaN(amount) || amount < min)
    return `Lance mínimo: ${min} moedas.`;
  const effective = alreadyWinning ? userCoins + (auction.currentBid ?? 0) : userCoins;
  if (amount > effective)
    return 'Saldo insuficiente.';
  return null;
}

/**
 * Returns true only if the auction is still open for bids.
 */
export function isAuctionActive(auction) {
  return new Date(auction.endsAt) > new Date();
}
