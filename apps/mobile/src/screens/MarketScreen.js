import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuctionCard from '../components/AuctionCard';
import PlayerCard from '../components/PlayerCard';
import Button from '../components/Button';
import CoinBalance from '../components/CoinBalance';
import useStore from '../store/useStore';
import { colors, r, sp, fs } from '../theme';

const MIN_BID_INCREMENT = 10;

export default function MarketScreen() {
  const { coins, auctions, freeAgents, placeBid, startAuction } = useStore();

  const [tab, setTab]             = useState('auctions'); // 'auctions' | 'free'
  const [bidModal, setBidModal]   = useState(null);   // auction object
  const [bidAmount, setBidAmount] = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);

  const myHighBids = new Set(
    auctions.filter(a => a.highBidderTeamId === 'team_me').map(a => a.id)
  );

  const filteredFree = useMemo(() => {
    if (!search) return freeAgents ?? [];
    return (freeAgents ?? []).filter(p =>
      p.nick.toLowerCase().includes(search.toLowerCase()) ||
      p.club.toLowerCase().includes(search.toLowerCase())
    );
  }, [freeAgents, search]);

  function openBidModal(auction) {
    const minNext = (auction.currentBid ?? 0) + MIN_BID_INCREMENT;
    setBidAmount(String(minNext));
    setBidModal(auction);
  }

  function handlePlaceBid() {
    const amount = parseInt(bidAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      return Alert.alert('Valor inválido', 'Digite um valor válido.');
    }
    const minNext = (bidModal.currentBid ?? 0) + MIN_BID_INCREMENT;
    if (amount < minNext) {
      return Alert.alert('Lance baixo', `O lance mínimo é ${minNext} moedas.`);
    }
    if (amount > coins) {
      return Alert.alert('Saldo insuficiente', 'Você não tem moedas suficientes.');
    }
    setLoading(true);
    setTimeout(() => {
      placeBid(bidModal.id, amount);
      setLoading(false);
      setBidModal(null);
    }, 600);
  }

  function handleStartAuction(playerId) {
    Alert.alert(
      'Iniciar leilão',
      'Tem certeza? O leilão dura 12 horas e não pode ser cancelado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar', style: 'default',
          onPress: () => startAuction(playerId),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Mercado</Text>
        <CoinBalance amount={coins} />
      </View>

      {/* Abas */}
      <View style={styles.tabRow}>
        {[['auctions', `Leilões (${auctions.length})`], ['free', 'Agentes Livres']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tabBtn, tab === key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'auctions' ? (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {auctions.length === 0 ? (
            <EmptyState icon="hammer-outline" message="Nenhum leilão ativo no momento." />
          ) : auctions.map(a => (
            <AuctionCard
              key={a.id}
              auction={a}
              isHighBidder={myHighBids.has(a.id)}
              onBid={() => openBidModal(a)}
            />
          ))}
        </ScrollView>
      ) : (
        <>
          {/* Busca */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={colors.textSub} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou clube..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSub} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredFree}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <EmptyState icon="person-outline" message="Nenhum agente livre encontrado." />
            )}
            renderItem={({ item }) => (
              <PlayerCard
                player={item}
                action={() => handleStartAuction(item.id)}
                actionLabel="Leiloar"
              />
            )}
          />
        </>
      )}

      {/* Modal de lance */}
      <Modal visible={!!bidModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {bidModal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Dar lance</Text>
                  <TouchableOpacity onPress={() => setBidModal(null)}>
                    <Ionicons name="close" size={22} color={colors.textSub} />
                  </TouchableOpacity>
                </View>

                {/* Info do jogador */}
                <View style={styles.modalPlayer}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{bidModal.player?.nick?.[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.modalPlayerName}>{bidModal.player?.nick}</Text>
                    <Text style={styles.modalPlayerClub}>{bidModal.player?.club}</Text>
                  </View>
                </View>

                {/* Lance atual */}
                <View style={styles.currentBidRow}>
                  <View>
                    <Text style={styles.bidRowLabel}>Lance atual</Text>
                    <CoinBalance amount={bidModal.currentBid} />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.bidRowLabel}>Mínimo próximo</Text>
                    <CoinBalance amount={(bidModal.currentBid ?? 0) + MIN_BID_INCREMENT} />
                  </View>
                </View>

                {/* Seu saldo */}
                <View style={styles.balanceRow}>
                  <Text style={styles.bidRowLabel}>Seu saldo</Text>
                  <CoinBalance amount={coins} />
                </View>

                {/* Input do lance */}
                <Text style={styles.inputLabel}>Valor do seu lance</Text>
                <View style={styles.bidInputWrap}>
                  <Ionicons name="logo-bitcoin" size={18} color={colors.gold} />
                  <TextInput
                    style={styles.bidInput}
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                {/* Atalhos rápidos */}
                <View style={styles.quickBtns}>
                  {['+10', '+50', '+100', '+250'].map(inc => {
                    const val = parseInt(inc.replace('+', ''), 10);
                    return (
                      <TouchableOpacity
                        key={inc}
                        style={styles.quickBtn}
                        onPress={() => setBidAmount(String((parseInt(bidAmount, 10) || 0) + val))}
                      >
                        <Text style={styles.quickBtnText}>{inc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Button
                  label={loading ? 'Enviando...' : 'Confirmar lance'}
                  onPress={handlePlaceBid}
                  loading={loading}
                  style={{ marginTop: sp.md }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: r.sm - 2 },
  tabActive: { backgroundColor: colors.bg },
  tabLabel: { color: colors.textSub, fontWeight: '600', fontSize: fs.sm },
  tabLabelActive: { color: colors.text },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    marginHorizontal: sp.lg, marginBottom: sp.sm,
    backgroundColor: colors.card, borderRadius: r.sm,
    borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: sp.md,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: fs.sm, paddingVertical: 10 },

  listContent: { paddingHorizontal: sp.lg, paddingBottom: sp.xl },

  empty: { alignItems: 'center', paddingTop: 60, gap: sp.md },
  emptyText: { color: colors.textMuted, fontSize: fs.sm, textAlign: 'center' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000A', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.card, borderTopLeftRadius: r.xl, borderTopRightRadius: r.xl,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: sp.lg, paddingBottom: sp.xl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: sp.md,
  },
  modalTitle: { color: colors.text, fontSize: fs.lg, fontWeight: '700' },
  modalPlayer: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md,
    backgroundColor: colors.bg, borderRadius: r.md,
    padding: sp.md, marginBottom: sp.md,
  },
  modalAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center',
  },
  modalAvatarText: { color: colors.text, fontWeight: '700', fontSize: fs.lg },
  modalPlayerName: { color: colors.text, fontWeight: '700', fontSize: fs.md },
  modalPlayerClub: { color: colors.textSub, fontSize: fs.xs, marginTop: 2 },

  currentBidRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: colors.bg, borderRadius: r.sm, padding: sp.md, marginBottom: sp.sm,
  },
  balanceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: sp.md,
  },
  bidRowLabel: { color: colors.textSub, fontSize: fs.xs, marginBottom: 4 },

  inputLabel: { color: colors.textSub, fontSize: fs.xs, fontWeight: '600', marginBottom: 6 },
  bidInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: colors.bg, borderRadius: r.sm,
    borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: sp.md, marginBottom: sp.sm,
  },
  bidInput: { flex: 1, color: colors.text, fontSize: fs.xl, fontWeight: '700', paddingVertical: 12 },

  quickBtns: { flexDirection: 'row', gap: sp.sm },
  quickBtn: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    backgroundColor: colors.cardBorder, borderRadius: r.sm,
  },
  quickBtnText: { color: colors.text, fontWeight: '600', fontSize: fs.xs },
});
