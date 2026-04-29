import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import CoinBalance from '../components/CoinBalance';
import CountdownTimer from '../components/CountdownTimer';
import useStore from '../store/useStore';
import { colors, r, sp, fs } from '../theme';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, team, coins, round, league } = useStore();

  // Classificação do usuário na liga
  const sorted = [...(league?.members ?? [])].sort((a, b) => b.pts - a.pts);
  const myRank = sorted.findIndex(m => m.teamId === 'team_me') + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Cabeçalho ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.teamName}>{team.name}</Text>
          </View>
          <CoinBalance amount={coins} />
        </View>

        {/* ── Banner da rodada ──────────────────────────────────────── */}
        <LinearGradient
          colors={['#00E67620', '#00E67608']}
          style={styles.roundBanner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <View style={styles.roundLeft}>
            <View style={styles.liveRow}>
              <View style={[styles.liveDot, round.status !== 'live' && styles.liveDotOff]} />
              <Text style={[styles.liveText, round.status !== 'live' && { color: colors.textSub }]}>
                {round.status === 'live' ? 'AO VIVO' : round.status === 'finished' ? 'ENCERRADA' : 'EM BREVE'}
              </Text>
            </View>
            <Text style={styles.roundTitle}>Rodada {round.number}</Text>
            {round.status !== 'finished' && (
              <View style={styles.deadlineRow}>
                <Ionicons name="time-outline" size={12} color={colors.textSub} />
                <Text style={styles.deadlineLabel}> Prazo: </Text>
                <CountdownTimer endsAt={round.deadline} />
              </View>
            )}
          </View>
          <View style={styles.roundRight}>
            <Text style={styles.roundPts}>{team.roundPts?.toFixed(1)}</Text>
            <Text style={styles.roundPtsLabel}>pontos</Text>
          </View>
        </LinearGradient>

        {/* ── Cards de estatísticas ─────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard icon="trophy" label="Classificação" value={`#${myRank}`} color={colors.gold} />
          <StatCard icon="star"   label="Total pts"    value={team.totalPts?.toFixed(0)} color={colors.green} />
          <StatCard icon="people" label="Liga"          value={league?.name.split(' ')[0]} color={colors.blue} />
        </View>

        {/* ── Meu time (preview) ────────────────────────────────────── */}
        <SectionHeader title="Meu Time" onPress={() => navigation.navigate('Meu Time')} />
        <View style={styles.teamPreview}>
          {(team.starters ?? []).slice(0, 5).map(pid => {
            const p = require('../data/mock').ALL_PLAYERS.find(x => x.id === pid);
            if (!p) return null;
            return (
              <View key={pid} style={styles.previewPlayer}>
                <View style={styles.previewAvatar}>
                  <Text style={styles.previewAvatarText}>{p.nick[0]}</Text>
                </View>
                <Text style={styles.previewName} numberOfLines={1}>{p.nick}</Text>
                <Text style={styles.previewPts}>{p.pts?.toFixed(1)}</Text>
              </View>
            );
          })}
          <TouchableOpacity
            onPress={() => navigation.navigate('Meu Time')}
            style={styles.previewMore}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.green} />
          </TouchableOpacity>
        </View>

        {/* ── Leilões em destaque ───────────────────────────────────── */}
        <SectionHeader title="Leilões ativos" onPress={() => navigation.navigate('Mercado')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.auctionScroll}>
          {useStore.getState().auctions.slice(0, 3).map(a => (
            <TouchableOpacity
              key={a.id}
              onPress={() => navigation.navigate('Mercado')}
              style={styles.auctionMini}
            >
              <View style={styles.auctionAvatar}>
                <Text style={styles.auctionAvatarText}>{a.player?.nick?.[0]}</Text>
              </View>
              <Text style={styles.auctionPlayer} numberOfLines={1}>{a.player?.nick}</Text>
              <CoinBalance amount={a.currentBid} small />
              <CountdownTimer endsAt={a.endsAt} style={{ fontSize: 10, marginTop: 2 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Ranking da liga ───────────────────────────────────────── */}
        <SectionHeader title="Ranking da liga" onPress={() => navigation.navigate('Liga')} />
        <View style={styles.rankingCard}>
          {sorted.slice(0, 5).map((m, i) => (
            <View key={m.teamId} style={[styles.rankRow, m.teamId === 'team_me' && styles.rankRowMe]}>
              <Text style={[styles.rankPos, i < 3 && { color: [colors.gold, colors.silver, colors.bronze][i] }]}>
                #{i + 1}
              </Text>
              <Text style={styles.rankTeam}>{m.teamName}</Text>
              <Text style={styles.rankPts}>{m.pts.toFixed(1)}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: sp.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, onPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.sectionMore}>Ver tudo →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.sm,
  },
  greeting: { color: colors.textSub, fontSize: fs.sm },
  teamName: { color: colors.text, fontSize: fs.lg, fontWeight: '700' },

  roundBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: sp.lg, marginBottom: sp.md,
    borderRadius: r.lg, borderWidth: 1, borderColor: colors.green + '30',
    padding: sp.lg,
  },
  roundLeft: { flex: 1 },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green, marginRight: 5 },
  liveDotOff: { backgroundColor: colors.textMuted },
  liveText: { color: colors.green, fontSize: fs.xs, fontWeight: '700', letterSpacing: 1 },
  roundTitle: { color: colors.text, fontSize: fs.lg, fontWeight: '700' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  deadlineLabel: { color: colors.textSub, fontSize: fs.xs },
  roundRight: { alignItems: 'flex-end' },
  roundPts: { color: colors.green, fontSize: fs.xxl, fontWeight: '800' },
  roundPtsLabel: { color: colors.textSub, fontSize: fs.xs },

  statsRow: { flexDirection: 'row', gap: sp.sm, paddingHorizontal: sp.lg, marginBottom: sp.md },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: r.md,
    borderWidth: 1, borderColor: colors.cardBorder,
    padding: sp.md, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: fs.lg, fontWeight: '800' },
  statLabel: { color: colors.textSub, fontSize: fs.xs },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sp.lg, marginBottom: sp.sm, marginTop: sp.sm,
  },
  sectionTitle: { color: colors.text, fontSize: fs.md, fontWeight: '700' },
  sectionMore:  { color: colors.green, fontSize: fs.xs },

  teamPreview: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: sp.lg, backgroundColor: colors.card,
    borderRadius: r.md, borderWidth: 1, borderColor: colors.cardBorder,
    padding: sp.md, marginBottom: sp.md, gap: sp.sm,
  },
  previewPlayer: { flex: 1, alignItems: 'center' },
  previewAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  previewAvatarText: { color: colors.text, fontWeight: '700', fontSize: fs.sm },
  previewName: { color: colors.textSub, fontSize: 9, textAlign: 'center' },
  previewPts: { color: colors.green, fontWeight: '700', fontSize: fs.xs },
  previewMore: {
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
  },

  auctionScroll: { paddingLeft: sp.lg, marginBottom: sp.md },
  auctionMini: {
    backgroundColor: colors.card, borderRadius: r.md, borderWidth: 1,
    borderColor: colors.cardBorder, padding: sp.md, width: 110,
    marginRight: sp.sm, alignItems: 'center',
  },
  auctionAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center', marginBottom: sp.sm,
  },
  auctionAvatarText: { color: colors.text, fontWeight: '700', fontSize: fs.md },
  auctionPlayer: { color: colors.text, fontWeight: '600', fontSize: fs.xs, marginBottom: 4 },

  rankingCard: {
    marginHorizontal: sp.lg, backgroundColor: colors.card,
    borderRadius: r.md, borderWidth: 1, borderColor: colors.cardBorder,
    overflow: 'hidden', marginBottom: sp.md,
  },
  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sp.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  rankRowMe: { backgroundColor: colors.greenFaint },
  rankPos: { color: colors.textSub, fontWeight: '700', width: 30, fontSize: fs.sm },
  rankTeam: { color: colors.text, flex: 1, fontSize: fs.sm },
  rankPts: { color: colors.green, fontWeight: '700', fontSize: fs.sm },
});
