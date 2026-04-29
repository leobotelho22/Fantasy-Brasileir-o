import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Button from '../components/Button';
import CoinBalance from '../components/CoinBalance';
import useStore from '../store/useStore';
import { colors, r, sp, fs } from '../theme';
import { ALL_PLAYERS } from '../data/mock';

export default function TradesScreen() {
  const { team, coins, trades, acceptTrade, rejectTrade } = useStore();
  const [tab, setTab] = useState('incoming'); // 'incoming' | 'outgoing'

  const incoming = (trades ?? []).filter(t => t.toTeamId === 'team_me' && t.status === 'pending');
  const outgoing = (trades ?? []).filter(t => t.fromTeamId === 'team_me' && t.status === 'pending');

  function handleAccept(trade) {
    Alert.alert(
      'Aceitar trade?',
      'Esta troca será efetivada imediatamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aceitar', onPress: () => acceptTrade(trade.id) },
      ]
    );
  }

  function handleReject(trade) {
    Alert.alert(
      'Recusar trade?',
      'A proposta será cancelada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recusar', style: 'destructive', onPress: () => rejectTrade(trade.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trades</Text>
        <CoinBalance amount={coins} />
      </View>

      {/* Abas */}
      <View style={styles.tabRow}>
        {[
          ['incoming', `Recebidas (${incoming.length})`],
          ['outgoing', `Enviadas (${outgoing.length})`],
        ].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tabBtn, tab === key && styles.tabActive]}
          >
            {tab === 'incoming' && key === 'incoming' && incoming.length > 0 && (
              <View style={styles.dot} />
            )}
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'incoming' ? (
          incoming.length === 0
            ? <EmptyState icon="swap-horizontal-outline" message="Nenhuma proposta recebida." />
            : incoming.map(t => (
                <TradeCard
                  key={t.id}
                  trade={t}
                  direction="incoming"
                  onAccept={() => handleAccept(t)}
                  onReject={() => handleReject(t)}
                />
              ))
        ) : (
          outgoing.length === 0
            ? <EmptyState icon="paper-plane-outline" message="Nenhuma proposta enviada." />
            : outgoing.map(t => (
                <TradeCard
                  key={t.id}
                  trade={t}
                  direction="outgoing"
                  onReject={() => handleReject(t)}
                />
              ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TradeCard({ trade, direction, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(true);

  const myOffer    = (trade.offeredPlayers ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean);
  const theirAsk   = (trade.requestedPlayers ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean);

  const isIncoming = direction === 'incoming';
  const label      = isIncoming
    ? `Proposta de ${trade.fromTeamName}`
    : `Para ${trade.toTeamName}`;

  return (
    <View style={styles.tradeCard}>
      {/* Cabeçalho do card */}
      <TouchableOpacity style={styles.tradeHeader} onPress={() => setExpanded(!expanded)}>
        <View style={[styles.dirIcon, isIncoming && styles.dirIconIn]}>
          <Ionicons
            name={isIncoming ? 'arrow-down' : 'arrow-up'}
            size={14}
            color={isIncoming ? colors.green : colors.blue}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tradeLabel}>{label}</Text>
          <Text style={styles.tradeSub}>
            {myOffer.length} jogador{myOffer.length !== 1 ? 'es' : ''} + {trade.offeredCoins ?? 0} moedas
            {' → '}
            {theirAsk.length} jogador{theirAsk.length !== 1 ? 'es' : ''}
          </Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSub} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.tradeBody}>
          <View style={styles.tradeColumns}>
            {/* Coluna esquerda: o que oferecem / você pede */}
            <View style={styles.tradeCol}>
              <Text style={styles.tradeColLabel}>
                {isIncoming ? 'Eles oferecem' : 'Você oferece'}
              </Text>
              {myOffer.map(p => <MiniPlayer key={p.id} player={p} />)}
              {(trade.offeredCoins ?? 0) > 0 && (
                <View style={styles.coinRow}>
                  <CoinBalance amount={trade.offeredCoins} small />
                </View>
              )}
            </View>

            <View style={styles.tradeSeparator}>
              <Ionicons name="swap-horizontal" size={18} color={colors.textSub} />
            </View>

            {/* Coluna direita: o que pedem / você pede */}
            <View style={styles.tradeCol}>
              <Text style={styles.tradeColLabel}>
                {isIncoming ? 'Eles pedem' : 'Você pede'}
              </Text>
              {theirAsk.map(p => <MiniPlayer key={p.id} player={p} />)}
              {(trade.requestedCoins ?? 0) > 0 && (
                <View style={styles.coinRow}>
                  <CoinBalance amount={trade.requestedCoins} small />
                </View>
              )}
            </View>
          </View>

          {/* Ações */}
          {isIncoming ? (
            <View style={styles.actionRow}>
              <Button
                label="Recusar"
                variant="danger"
                onPress={onReject}
                style={{ flex: 1 }}
              />
              <Button
                label="Aceitar"
                onPress={onAccept}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <Button
              label="Cancelar proposta"
              variant="secondary"
              onPress={onReject}
            />
          )}
        </View>
      )}
    </View>
  );
}

function MiniPlayer({ player }) {
  return (
    <View style={styles.miniPlayer}>
      <View style={styles.miniAvatar}>
        <Text style={styles.miniAvatarText}>{player.nick[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.miniName} numberOfLines={1}>{player.nick}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
          <Badge label={player.pos} small />
          <Text style={styles.miniClub}>{player.club}</Text>
        </View>
      </View>
      <Text style={styles.miniPts}>{(player.pts ?? 0).toFixed(1)}</Text>
    </View>
  );
}

function EmptyState({ icon, message }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={36} color={colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.sm,
  },
  title: { color: colors.text, fontSize: fs.xl, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row', marginHorizontal: sp.lg, marginBottom: sp.md,
    backgroundColor: colors.card, borderRadius: r.sm,
    padding: 3, borderWidth: 1, borderColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1, paddingVertical: 9, alignItems: 'center',
    borderRadius: r.sm - 2, flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  tabActive: { backgroundColor: colors.bg },
  tabLabel: { color: colors.textSub, fontWeight: '600', fontSize: fs.sm },
  tabLabelActive: { color: colors.text },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },

  content: { paddingHorizontal: sp.lg, paddingBottom: sp.xl },

  tradeCard: {
    backgroundColor: colors.card, borderRadius: r.md,
    borderWidth: 1, borderColor: colors.cardBorder,
    marginBottom: sp.md, overflow: 'hidden',
  },
  tradeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    padding: sp.md,
  },
  dirIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.blue + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  dirIconIn: { backgroundColor: colors.greenFaint },
  tradeLabel: { color: colors.text, fontWeight: '700', fontSize: fs.sm },
  tradeSub: { color: colors.textSub, fontSize: fs.xs, marginTop: 2 },

  tradeBody: { padding: sp.md, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  tradeColumns: { flexDirection: 'row', gap: sp.sm, marginBottom: sp.md },
  tradeCol: { flex: 1 },
  tradeColLabel: { color: colors.textSub, fontSize: fs.xs, fontWeight: '700', marginBottom: sp.sm },
  tradeSeparator: { width: 24, alignItems: 'center', justifyContent: 'center', paddingTop: 24 },

  miniPlayer: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: colors.bg, borderRadius: r.sm,
    padding: sp.sm, marginBottom: sp.xs,
  },
  miniAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { color: colors.text, fontWeight: '700', fontSize: fs.sm },
  miniName: { color: colors.text, fontWeight: '600', fontSize: fs.xs },
  miniClub: { color: colors.textSub, fontSize: 9 },
  miniPts: { color: colors.green, fontWeight: '700', fontSize: fs.xs },

  coinRow: { marginTop: sp.xs },

  actionRow: { flexDirection: 'row', gap: sp.sm },

  empty: { alignItems: 'center', paddingTop: 60, gap: sp.md },
  emptyText: { color: colors.textMuted, fontSize: fs.sm, textAlign: 'center' },
});
