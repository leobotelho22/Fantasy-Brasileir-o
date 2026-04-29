import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Button from '../components/Button';
import CoinBalance from '../components/CoinBalance';
import PlayerCard from '../components/PlayerCard';
import useStore from '../store/useStore';
import { colors, r, sp, fs, posColor } from '../theme';
import { ALL_PLAYERS } from '../data/mock';

const SCHEMES = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-5-1'];

export default function MyTeamScreen() {
  const { team, coins } = useStore();
  const [scheme, setScheme] = useState(team.scheme ?? '4-3-3');
  const [captainId, setCaptainId] = useState(team.captain ?? null);
  const [showCaptainModal, setShowCaptainModal] = useState(false);
  const [showSchemeModal, setShowSchemeModal] = useState(false);

  const starters  = (team.starters  ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean);
  const bench     = (team.bench     ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean);
  const captain   = starters.find(p => p.id === captainId);

  const totalPts  = starters.reduce((s, p) => {
    const pts = p.pts ?? 0;
    return s + (p.id === captainId ? pts * 2 : pts);
  }, 0);

  function handleSetCaptain(player) {
    if (!starters.find(p => p.id === player.id)) {
      return Alert.alert('Capitão inválido', 'O capitão deve ser um titular.');
    }
    setCaptainId(player.id);
    setShowCaptainModal(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{team.name}</Text>
            <Text style={styles.sub}>Rodada atual</Text>
          </View>
          <View style={styles.headerRight}>
            <CoinBalance amount={coins} />
            <View style={styles.ptsBadge}>
              <Text style={styles.ptsValue}>{totalPts.toFixed(1)}</Text>
              <Text style={styles.ptsLabel}>pts</Text>
            </View>
          </View>
        </View>

        {/* Esquema + capitão */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowSchemeModal(true)}>
            <Ionicons name="grid-outline" size={14} color={colors.textSub} />
            <Text style={styles.controlLabel}>{scheme}</Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSub} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={() => setShowCaptainModal(true)}>
            <Ionicons name="star" size={14} color={colors.gold} />
            <Text style={styles.controlLabel}>
              {captain ? captain.nick : 'Escolher capitão'}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSub} />
          </TouchableOpacity>
        </View>

        {/* Titulares */}
        <SectionHeader title={`Titulares (${starters.length}/11)`} />
        <View style={styles.playerList}>
          {starters.length === 0 ? (
            <EmptyState message="Nenhum titular escalado. Vá ao Draft ou Mercado." icon="shirt-outline" />
          ) : starters.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
              rightContent={
                <View style={styles.playerRight}>
                  {p.id === captainId && (
                    <View style={styles.captainBadge}>
                      <Ionicons name="star" size={10} color={colors.gold} />
                      <Text style={styles.captainLabel}>C</Text>
                    </View>
                  )}
                  <View style={styles.ptsRight}>
                    <Text style={styles.playerPts}>
                      {p.id === captainId
                        ? ((p.pts ?? 0) * 2).toFixed(1)
                        : (p.pts ?? 0).toFixed(1)}
                    </Text>
                    <Text style={styles.ptsRightLabel}>pts</Text>
                    {p.id === captainId && (
                      <Text style={styles.x2label}>×2</Text>
                    )}
                  </View>
                </View>
              }
            />
          ))}
        </View>

        {/* Reservas */}
        <SectionHeader title={`Reservas (${bench.length})`} />
        <View style={styles.playerList}>
          {bench.length === 0 ? (
            <EmptyState message="Sem reservas no momento." icon="person-outline" />
          ) : bench.map(p => (
            <PlayerCard
              key={p.id}
              player={p}
            />
          ))}
        </View>

        {/* Resumo por posição */}
        <SectionHeader title="Resumo" />
        <PositionSummary players={starters} />

        <View style={{ height: sp.xl }} />
      </ScrollView>

      {/* Modal: escolher capitão */}
      <Modal visible={showCaptainModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolher Capitão</Text>
              <TouchableOpacity onPress={() => setShowCaptainModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSub} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>O capitão pontua em dobro na rodada.</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {starters.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.captainOption, p.id === captainId && styles.captainOptionActive]}
                  onPress={() => handleSetCaptain(p)}
                >
                  <View style={[styles.miniAvatar, { backgroundColor: posColor(p.pos) + '30' }]}>
                    <Text style={[styles.miniAvatarText, { color: posColor(p.pos) }]}>{p.nick[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.captainOptionName}>{p.nick}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Badge label={p.pos} small />
                      <Text style={styles.captainOptionClub}>{p.club}</Text>
                    </View>
                  </View>
                  <View style={styles.captainPtsWrap}>
                    <Text style={styles.captainPts}>{((p.pts ?? 0) * 2).toFixed(1)}</Text>
                    <Text style={styles.captainPtsLabel}>×2</Text>
                  </View>
                  {p.id === captainId && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.green} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: escolher esquema */}
      <Modal visible={showSchemeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Esquema tático</Text>
              <TouchableOpacity onPress={() => setShowSchemeModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSub} />
              </TouchableOpacity>
            </View>
            {SCHEMES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.schemeOption, s === scheme && styles.schemeOptionActive]}
                onPress={() => { setScheme(s); setShowSchemeModal(false); }}
              >
                <Text style={[styles.schemeLabel, s === scheme && { color: colors.green }]}>{s}</Text>
                {s === scheme && <Ionicons name="checkmark" size={18} color={colors.green} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function EmptyState({ message, icon }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={28} color={colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function PositionSummary({ players }) {
  const grouped = players.reduce((acc, p) => {
    acc[p.pos] = (acc[p.pos] ?? []).concat(p);
    return acc;
  }, {});

  return (
    <View style={styles.summaryCard}>
      {Object.entries(grouped).map(([pos, list]) => (
        <View key={pos} style={styles.summaryRow}>
          <Badge label={pos} />
          <Text style={styles.summaryNames} numberOfLines={1}>
            {list.map(p => p.nick).join(', ')}
          </Text>
          <Text style={styles.summaryPts}>
            {list.reduce((s, p) => s + (p.pts ?? 0), 0).toFixed(1)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.sm,
  },
  title: { color: colors.text, fontSize: fs.lg, fontWeight: '700' },
  sub: { color: colors.textSub, fontSize: fs.xs, marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: sp.xs },
  ptsBadge: { alignItems: 'center' },
  ptsValue: { color: colors.green, fontWeight: '800', fontSize: fs.xl },
  ptsLabel: { color: colors.textSub, fontSize: fs.xs },

  controls: {
    flexDirection: 'row', gap: sp.sm,
    paddingHorizontal: sp.lg, marginBottom: sp.md,
  },
  controlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.card, borderRadius: r.full,
    borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: sp.md, paddingVertical: 8,
  },
  controlLabel: { color: colors.text, fontSize: fs.xs, fontWeight: '600' },

  sectionHeader: {
    paddingHorizontal: sp.lg, paddingVertical: sp.sm,
  },
  sectionTitle: { color: colors.text, fontSize: fs.md, fontWeight: '700' },

  playerList: { paddingHorizontal: sp.lg },

  playerRight: { alignItems: 'flex-end', gap: 4 },
  captainBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: colors.gold + '20', borderRadius: r.full,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.gold + '60',
  },
  captainLabel: { color: colors.gold, fontSize: 9, fontWeight: '700' },
  ptsRight: { alignItems: 'flex-end' },
  playerPts: { color: colors.green, fontWeight: '700', fontSize: fs.md },
  ptsRightLabel: { color: colors.textSub, fontSize: fs.xs },
  x2label: { color: colors.gold, fontSize: fs.xs, fontWeight: '700' },

  empty: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: sp.xl, gap: sp.sm,
  },
  emptyText: { color: colors.textMuted, fontSize: fs.sm, textAlign: 'center' },

  summaryCard: {
    marginHorizontal: sp.lg, backgroundColor: colors.card,
    borderRadius: r.md, borderWidth: 1, borderColor: colors.cardBorder,
    overflow: 'hidden', marginBottom: sp.md,
  },
  summaryRow: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    paddingHorizontal: sp.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  summaryNames: { flex: 1, color: colors.textSub, fontSize: fs.xs },
  summaryPts: { color: colors.green, fontWeight: '700', fontSize: fs.sm },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: '#000A', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card, borderTopLeftRadius: r.xl, borderTopRightRadius: r.xl,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: sp.lg, paddingBottom: sp.xl,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: sp.sm,
  },
  modalTitle: { color: colors.text, fontSize: fs.lg, fontWeight: '700' },
  modalSub: { color: colors.textSub, fontSize: fs.xs, marginBottom: sp.md },

  captainOption: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md,
    paddingVertical: sp.sm, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  captainOptionActive: { backgroundColor: colors.greenFaint, borderRadius: r.sm, paddingHorizontal: sp.sm },
  miniAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { fontWeight: '700', fontSize: fs.md },
  captainOptionName: { color: colors.text, fontWeight: '600', fontSize: fs.sm },
  captainOptionClub: { color: colors.textSub, fontSize: fs.xs },
  captainPtsWrap: { alignItems: 'center', marginRight: sp.sm },
  captainPts: { color: colors.green, fontWeight: '700', fontSize: fs.md },
  captainPtsLabel: { color: colors.gold, fontSize: fs.xs, fontWeight: '700' },

  schemeOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: sp.md, borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  schemeOptionActive: { },
  schemeLabel: { color: colors.text, fontSize: fs.md, fontWeight: '600' },
});
