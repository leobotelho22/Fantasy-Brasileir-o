import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Button from '../components/Button';
import useStore from '../store/useStore';
import { colors, r, sp, fs, posColor } from '../theme';
import { ALL_PLAYERS, DRAFT_STATE } from '../data/mock';

const POSITIONS = ['TODOS', 'GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

export default function DraftScreen() {
  const { team, draft, makeDraftPick } = useStore();
  const [filter, setFilter]   = useState('TODOS');
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState('available'); // 'available' | 'board'

  const draftState = draft ?? DRAFT_STATE;

  // Players already drafted
  const pickedIds = new Set((draftState.picks ?? []).map(pk => pk.playerId));

  // My team's picks
  const myPicks = (draftState.picks ?? [])
    .filter(pk => pk.teamId === 'team_me')
    .map(pk => ALL_PLAYERS.find(p => p.id === pk.playerId))
    .filter(Boolean);

  const available = useMemo(() => {
    return ALL_PLAYERS
      .filter(p => !pickedIds.has(p.id))
      .filter(p => filter === 'TODOS' || p.pos === filter)
      .filter(p => !search || p.nick.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  }, [pickedIds, filter, search]);

  const isMyTurn   = draftState.currentTeam === 'team_me';
  const currentPick = (draftState.picks?.length ?? 0) + 1;
  const totalPicks  = (draftState.teams?.length ?? 8) * 12;
  const progress    = currentPick / totalPicks;

  function handlePick(player) {
    if (!isMyTurn) return;
    makeDraftPick(player.id);
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* Banner status do draft */}
      <View style={[styles.statusBanner, isMyTurn && styles.statusBannerActive]}>
        {isMyTurn ? (
          <>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>É a sua vez! Escolha um jogador.</Text>
          </>
        ) : (
          <>
            <Ionicons name="hourglass-outline" size={14} color={colors.textSub} />
            <Text style={styles.statusTextSub}>
              Aguardando {draftState.currentTeamName ?? 'outro time'}...
            </Text>
          </>
        )}
        <View style={styles.pickCounter}>
          <Text style={styles.pickCounterText}>Pick {currentPick}/{totalPicks}</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
      </View>

      {/* Abas: Disponíveis / Board */}
      <View style={styles.tabRow}>
        {[['available', 'Disponíveis'], ['board', 'Board']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tabBtn, tab === key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'available' ? (
        <>
          {/* Barra de busca */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={16} color={colors.textSub} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar jogador ou clube..."
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

          {/* Filtro por posição */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {POSITIONS.map(pos => (
              <TouchableOpacity
                key={pos}
                onPress={() => setFilter(pos)}
                style={[styles.filterChip, filter === pos && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, filter === pos && styles.filterLabelActive]}>
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de jogadores */}
          <FlatList
            data={available}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.empty}>
                <Ionicons name="search" size={32} color={colors.textMuted} />
                <Text style={styles.emptyText}>Nenhum jogador encontrado.</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <DraftPlayerRow
                player={item}
                isMyTurn={isMyTurn}
                onPick={() => handlePick(item)}
                alreadyMine={myPicks.some(p => p.id === item.id)}
              />
            )}
          />
        </>
      ) : (
        // Board: picks por rodada
        <DraftBoard draftState={draftState} />
      )}
    </SafeAreaView>
  );
}

function DraftPlayerRow({ player, isMyTurn, onPick }) {
  return (
    <View style={styles.draftRow}>
      <View style={[styles.avatar, { backgroundColor: posColor(player.pos) + '25' }]}>
        <Text style={[styles.avatarText, { color: posColor(player.pos) }]}>{player.nick[0]}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.playerName}>{player.nick}</Text>
        <View style={styles.row}>
          <Badge label={player.pos} small />
          <Text style={styles.club}>{player.club}</Text>
        </View>
      </View>
      <View style={styles.playerStats}>
        <Text style={styles.statPts}>{(player.pts ?? 0).toFixed(1)}</Text>
        <Text style={styles.statLabel}>pts</Text>
        <Text style={styles.statAvg}>méd {(player.avg ?? 0).toFixed(1)}</Text>
      </View>
      {isMyTurn && (
        <TouchableOpacity onPress={onPick} style={styles.pickBtn}>
          <Text style={styles.pickBtnText}>Pegar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DraftBoard({ draftState }) {
  const numTeams = draftState.teams?.length ?? 8;
  const picks    = draftState.picks ?? [];
  const rounds   = Math.ceil((picks.length + 1) / numTeams);

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ padding: sp.md }}>
          {/* Cabeçalho com nomes dos times */}
          <View style={styles.boardRow}>
            <View style={styles.boardRdCell} />
            {(draftState.teams ?? []).map(t => (
              <View key={t.id} style={styles.boardCell}>
                <Text style={styles.boardTeamName} numberOfLines={1}>{t.name.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
          {Array.from({ length: rounds }).map((_, rdIdx) => {
            const round = rdIdx + 1;
            const teamOrder = round % 2 === 1
              ? draftState.teams
              : [...(draftState.teams ?? [])].reverse();
            return (
              <View key={round} style={styles.boardRow}>
                <View style={styles.boardRdCell}>
                  <Text style={styles.boardRd}>R{round}</Text>
                </View>
                {(draftState.teams ?? []).map(t => {
                  const pos  = teamOrder.findIndex(x => x.id === t.id);
                  const pick = picks[(rdIdx * numTeams) + pos];
                  const player = pick ? ALL_PLAYERS.find(p => p.id === pick.playerId) : null;
                  const isMe   = t.id === 'team_me';
                  return (
                    <View
                      key={t.id}
                      style={[styles.boardCell, styles.boardPickCell, isMe && styles.boardPickCellMe]}
                    >
                      {player ? (
                        <>
                          <Text style={styles.boardPickName} numberOfLines={1}>{player.nick}</Text>
                          <Badge label={player.pos} small />
                        </>
                      ) : (
                        <View style={styles.boardEmpty}>
                          {rdIdx * numTeams + pos === picks.length && (
                            <View style={styles.currentPickDot} />
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    marginHorizontal: sp.lg, marginTop: sp.md,
    backgroundColor: colors.card, borderRadius: r.md,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: sp.md,
  },
  statusBannerActive: { borderColor: colors.green, backgroundColor: colors.greenFaint },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  statusText: { color: colors.green, fontWeight: '700', fontSize: fs.sm, flex: 1 },
  statusTextSub: { color: colors.textSub, fontSize: fs.sm, flex: 1 },
  pickCounter: {
    backgroundColor: colors.cardBorder, borderRadius: r.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  pickCounterText: { color: colors.text, fontSize: fs.xs, fontWeight: '600' },

  progressBar: {
    height: 3, backgroundColor: colors.cardBorder,
    marginHorizontal: sp.lg, marginTop: sp.sm, borderRadius: 2,
  },
  progressFill: { height: 3, backgroundColor: colors.green, borderRadius: 2 },

  tabRow: {
    flexDirection: 'row', margin: sp.lg, marginBottom: sp.sm,
    backgroundColor: colors.card, borderRadius: r.sm,
    padding: 3, borderWidth: 1, borderColor: colors.cardBorder,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: r.sm - 2 },
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

  filterScroll: { paddingLeft: sp.lg, marginBottom: sp.sm },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: r.full,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    marginRight: sp.sm,
  },
  filterChipActive: { backgroundColor: colors.green, borderColor: colors.green },
  filterLabel: { color: colors.textSub, fontSize: fs.xs, fontWeight: '600' },
  filterLabelActive: { color: '#000' },

  listContent: { paddingHorizontal: sp.lg, paddingBottom: sp.xl },
  draftRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: r.md,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: sp.md, marginBottom: sp.sm, gap: sp.sm,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontWeight: '700', fontSize: fs.lg },
  info: { flex: 1 },
  playerName: { color: colors.text, fontWeight: '600', fontSize: fs.md },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  club: { color: colors.textSub, fontSize: fs.xs, marginLeft: sp.sm },
  playerStats: { alignItems: 'flex-end' },
  statPts: { color: colors.green, fontWeight: '700', fontSize: fs.md },
  statLabel: { color: colors.textSub, fontSize: fs.xs },
  statAvg: { color: colors.textMuted, fontSize: fs.xs, marginTop: 2 },
  pickBtn: {
    backgroundColor: colors.green, borderRadius: r.full,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  pickBtnText: { color: '#000', fontWeight: '700', fontSize: fs.sm },

  empty: { alignItems: 'center', paddingTop: sp.xl, gap: sp.md },
  emptyText: { color: colors.textMuted, fontSize: fs.sm },

  // Board
  boardRow: { flexDirection: 'row', marginBottom: 2 },
  boardRdCell: { width: 32, justifyContent: 'center', alignItems: 'center' },
  boardRd: { color: colors.textSub, fontSize: 9, fontWeight: '700' },
  boardCell: { width: 80, alignItems: 'center', padding: 3 },
  boardTeamName: { color: colors.textSub, fontSize: 9, fontWeight: '700' },
  boardPickCell: {
    backgroundColor: colors.card, borderRadius: r.sm,
    borderWidth: 1, borderColor: colors.cardBorder,
    minHeight: 42, justifyContent: 'center', alignItems: 'center', gap: 2,
  },
  boardPickCellMe: { borderColor: colors.green + '60', backgroundColor: colors.greenFaint },
  boardPickName: { color: colors.text, fontSize: 8, fontWeight: '600', textAlign: 'center' },
  boardEmpty: { width: '100%', minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  currentPickDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
});
