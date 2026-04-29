import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import CoinBalance from './CoinBalance';
import CountdownTimer from './CountdownTimer';
import { colors, r, sp, fs } from '../theme';

// Card de leilão ativo com lance, timer e botão
export default function AuctionCard({ auction, isHighBidder, onBid }) {
  if (!auction?.player) return null;
  const { player } = auction;

  return (
    <View style={styles.card}>
      {/* Cabeçalho: jogador */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{player.nick[0]}</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.nick}</Text>
          <View style={styles.row}>
            <Badge label={player.pos} small />
            <Text style={styles.club}>{player.club}</Text>
          </View>
        </View>
        {/* Timer */}
        <View style={styles.timerBox}>
          <Ionicons name="time-outline" size={12} color={colors.textSub} />
          <CountdownTimer endsAt={auction.endsAt} style={{ marginLeft: 3, fontSize: fs.xs }} />
        </View>
      </View>

      {/* Divisor */}
      <View style={styles.divider} />

      {/* Rodapé: lance atual + botão */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.bidLabel}>Lance atual</Text>
          <View style={styles.row}>
            <CoinBalance amount={auction.currentBid} />
            <Text style={styles.bidder}> · {auction.highBidder}</Text>
          </View>
          <Text style={styles.numBids}>{auction.numBids} lance{auction.numBids !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.actions}>
          {isHighBidder ? (
            <View style={styles.winning}>
              <Ionicons name="checkmark-circle" size={14} color={colors.green} />
              <Text style={styles.winningText}>Ganhando</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={onBid} activeOpacity={0.75} style={styles.bidBtn}>
              <Ionicons name="hammer-outline" size={14} color="#000" />
              <Text style={styles.bidBtnText}>Dar lance</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: r.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: sp.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sp.md,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    marginRight: sp.md,
  },
  avatarText: { color: colors.text, fontWeight: '700', fontSize: fs.lg },
  playerInfo: { flex: 1 },
  playerName: { color: colors.text, fontWeight: '700', fontSize: fs.md },
  club: { color: colors.textSub, fontSize: fs.xs, marginLeft: sp.sm },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBorder,
    borderRadius: r.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: sp.md,
  },
  bidLabel: { color: colors.textSub, fontSize: fs.xs, marginBottom: 2 },
  bidder: { color: colors.textSub, fontSize: fs.xs },
  numBids: { color: colors.textMuted, fontSize: fs.xs, marginTop: 2 },
  actions: { alignItems: 'flex-end' },
  bidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: r.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 5,
  },
  bidBtnText: { color: '#000', fontWeight: '700', fontSize: fs.sm },
  winning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.greenFaint,
    borderRadius: r.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.green,
  },
  winningText: { color: colors.green, fontWeight: '700', fontSize: fs.xs },
});
