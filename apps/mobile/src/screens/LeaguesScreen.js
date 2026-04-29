import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import useStore from '../store/useStore';
import { colors, r, sp, fs } from '../theme';

export default function LeaguesScreen() {
  const { league } = useStore();
  const [tab, setTab] = useState('ranking'); // 'ranking' | 'info'
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin]     = useState(false);

  const sorted = [...(league?.members ?? [])].sort((a, b) => b.pts - a.pts);
  const myEntry = sorted.find(m => m.teamId === 'team_me');
  const myRank  = sorted.findIndex(m => m.teamId === 'team_me') + 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Cabeçalho da liga */}
        <View style={styles.leagueHeader}>
          <View style={styles.leagueBadge}>
            <Ionicons name="trophy" size={28} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.leagueName}>{league?.name ?? 'Minha Liga'}</Text>
            <Text style={styles.leagueSub}>
              {sorted.length} times · Rodada {league?.currentRound ?? 1}
            </Text>
          </View>
        </View>

        {/* Minha posição destaque */}
        {myEntry && (
          <View style={styles.myCard}>
            <View>
              <Text style={styles.myRankLabel}>Minha posição</Text>
              <Text style={styles.myRank}>#{myRank}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.statLabel}>Total pts</Text>
              <Text style={styles.statValue}>{myEntry.pts.toFixed(1)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Rodada</Text>
              <Text style={styles.statValue}>{myEntry.roundPts?.toFixed(1) ?? '—'}</Text>
            </View>
          </View>
        )}

        {/* Abas */}
        <View style={styles.tabRow}>
          {[['ranking', 'Classificação'], ['info', 'Informações']].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tabBtn, tab === key && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, tab === key && styles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'ranking' ? (
          <View style={styles.rankingCard}>
            {/* Cabeçalho da tabela */}
            <View style={[styles.rankRow, styles.rankHeaderRow]}>
              <Text style={[styles.rankCol, styles.rankHeaderText, { width: 30 }]}>#</Text>
              <Text style={[styles.rankCol, styles.rankHeaderText, { flex: 1 }]}>Time</Text>
              <Text style={[styles.rankCol, styles.rankHeaderText]}>Rodada</Text>
              <Text style={[styles.rankCol, styles.rankHeaderText]}>Total</Text>
              <Text style={[styles.rankCol, styles.rankHeaderText]}>J</Text>
              <Text style={[styles.rankCol, styles.rankHeaderText]}>V</Text>
            </View>

            {sorted.map((m, i) => {
              const isMe = m.teamId === 'team_me';
              const medal = ['gold', 'silver', 'bronze'][i] ?? null;
              const medalColor = { gold: colors.gold, silver: colors.silver, bronze: colors.bronze }[medal];
              return (
                <View key={m.teamId} style={[styles.rankRow, isMe && styles.rankRowMe]}>
                  <Text style={[styles.rankCol, { width: 30, color: medalColor ?? colors.textSub, fontWeight: '700' }]}>
                    {i + 1}
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {medal && <Ionicons name="trophy" size={12} color={medalColor} />}
                    <Text style={[styles.rankTeamName, isMe && { color: colors.green, fontWeight: '700' }]}
                          numberOfLines={1}>
                      {m.teamName}
                    </Text>
                  </View>
                  <Text style={styles.rankCol}>{m.roundPts?.toFixed(1) ?? '—'}</Text>
                  <Text style={[styles.rankCol, { color: colors.green, fontWeight: '700' }]}>
                    {m.pts.toFixed(1)}
                  </Text>
                  <Text style={styles.rankCol}>{m.played ?? 0}</Text>
                  <Text style={styles.rankCol}>{m.wins ?? 0}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <LeagueInfo league={league} />
        )}

        {/* Ações da liga */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Outras ligas</Text>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowCreate(true)}>
              <View style={[styles.actionIcon, { backgroundColor: colors.green + '20' }]}>
                <Ionicons name="add-circle-outline" size={22} color={colors.green} />
              </View>
              <Text style={styles.actionLabel}>Criar liga</Text>
              <Text style={styles.actionSub}>Convide amigos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={() => setShowJoin(true)}>
              <View style={[styles.actionIcon, { backgroundColor: colors.blue + '20' }]}>
                <Ionicons name="enter-outline" size={22} color={colors.blue} />
              </View>
              <Text style={styles.actionLabel}>Entrar em liga</Text>
              <Text style={styles.actionSub}>Use um código</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: sp.xl }} />
      </ScrollView>

      {/* Modal: Criar liga */}
      <CreateLeagueModal visible={showCreate} onClose={() => setShowCreate(false)} />

      {/* Modal: Entrar em liga */}
      <JoinLeagueModal visible={showJoin} onClose={() => setShowJoin(false)} />
    </SafeAreaView>
  );
}

function LeagueInfo({ league }) {
  const rules = [
    ['Jogadores por time', '12 (11 titulares + 1 reserva)'],
    ['Sistema de draft', 'Snake Draft'],
    ['Moedas iniciais', '1.000'],
    ['Duração do leilão', '12 horas'],
    ['Capitão', 'Pontua em dobro'],
    ['Desempate', 'Pontos na rodada → Vitórias → H2H'],
  ];

  return (
    <View style={styles.infoCard}>
      {rules.map(([label, value]) => (
        <View key={label} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function CreateLeagueModal({ visible, onClose }) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('8');

  function handleCreate() {
    if (!name.trim()) return Alert.alert('Nome obrigatório', 'Digite o nome da liga.');
    Alert.alert('Liga criada!', `"${name}" criada com sucesso. Compartilhe o código para convidar times.`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Criar liga</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Nome da liga</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="trophy-outline" size={16} color={colors.textSub} />
            <TextInput
              style={styles.input}
              placeholder="Ex: Liga dos Amigos"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.fieldLabel}>Número de times</Text>
          <View style={styles.sizeRow}>
            {['4', '6', '8', '10', '12'].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.sizeBtn, size === n && styles.sizeBtnActive]}
                onPress={() => setSize(n)}
              >
                <Text style={[styles.sizeBtnLabel, size === n && { color: '#000' }]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button label="Criar liga" onPress={handleCreate} style={{ marginTop: sp.md }} />
        </View>
      </View>
    </Modal>
  );
}

function JoinLeagueModal({ visible, onClose }) {
  const [code, setCode] = useState('');

  function handleJoin() {
    if (code.trim().length < 4) return Alert.alert('Código inválido', 'Digite o código da liga.');
    Alert.alert('Entrou na liga!', 'Você entrou com sucesso. O draft começa em breve.');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Entrar em liga</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSub} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Código da liga</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={16} color={colors.textSub} />
            <TextInput
              style={styles.input}
              placeholder="Cole o código aqui"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={t => setCode(t.toUpperCase())}
              autoCapitalize="characters"
            />
          </View>

          <Button label="Entrar na liga" onPress={handleJoin} style={{ marginTop: sp.md }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  leagueHeader: {
    flexDirection: 'row', alignItems: 'center', gap: sp.md,
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.sm,
  },
  leagueBadge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.gold + '15',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.gold + '40',
  },
  leagueName: { color: colors.text, fontSize: fs.xl, fontWeight: '800' },
  leagueSub: { color: colors.textSub, fontSize: fs.xs, marginTop: 3 },

  myCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: sp.lg, marginBottom: sp.md,
    backgroundColor: colors.greenFaint, borderRadius: r.md,
    borderWidth: 1, borderColor: colors.green + '40', padding: sp.md,
  },
  myRankLabel: { color: colors.textSub, fontSize: fs.xs },
  myRank: { color: colors.green, fontSize: fs.xxl, fontWeight: '900' },
  statLabel: { color: colors.textSub, fontSize: fs.xs },
  statValue: { color: colors.text, fontWeight: '700', fontSize: fs.lg },

  tabRow: {
    flexDirection: 'row', marginHorizontal: sp.lg, marginBottom: sp.md,
    backgroundColor: colors.card, borderRadius: r.sm,
    padding: 3, borderWidth: 1, borderColor: colors.cardBorder,
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: r.sm - 2 },
  tabActive: { backgroundColor: colors.bg },
  tabLabel: { color: colors.textSub, fontWeight: '600', fontSize: fs.sm },
  tabLabelActive: { color: colors.text },

  rankingCard: {
    marginHorizontal: sp.lg, backgroundColor: colors.card,
    borderRadius: r.md, borderWidth: 1, borderColor: colors.cardBorder,
    overflow: 'hidden', marginBottom: sp.md,
  },
  rankHeaderRow: { backgroundColor: colors.bg },
  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sp.md, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  rankRowMe: { backgroundColor: colors.greenFaint },
  rankHeaderText: { color: colors.textMuted, fontSize: fs.xs, fontWeight: '700' },
  rankCol: { color: colors.textSub, fontSize: fs.xs, width: 44, textAlign: 'right' },
  rankTeamName: { color: colors.text, fontSize: fs.sm },

  infoCard: {
    marginHorizontal: sp.lg, backgroundColor: colors.card,
    borderRadius: r.md, borderWidth: 1, borderColor: colors.cardBorder,
    overflow: 'hidden', marginBottom: sp.md,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sp.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  infoLabel: { color: colors.textSub, fontSize: fs.sm },
  infoValue: { color: colors.text, fontWeight: '600', fontSize: fs.sm },

  actionsSection: { paddingHorizontal: sp.lg, marginTop: sp.sm },
  sectionTitle: { color: colors.text, fontSize: fs.md, fontWeight: '700', marginBottom: sp.sm },
  actionBtns: { flexDirection: 'row', gap: sp.sm },
  actionCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: r.md,
    borderWidth: 1, borderColor: colors.cardBorder, padding: sp.md,
    alignItems: 'center', gap: sp.xs,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: colors.text, fontWeight: '700', fontSize: fs.sm },
  actionSub: { color: colors.textSub, fontSize: fs.xs },

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
  fieldLabel: { color: colors.textSub, fontSize: fs.xs, fontWeight: '600', marginBottom: 6, marginTop: sp.sm },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm,
    backgroundColor: colors.bg, borderRadius: r.sm,
    borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: sp.md,
  },
  input: { flex: 1, color: colors.text, fontSize: fs.md, paddingVertical: 13 },
  sizeRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.xs },
  sizeBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: colors.bg, borderRadius: r.sm,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  sizeBtnActive: { backgroundColor: colors.green, borderColor: colors.green },
  sizeBtnLabel: { color: colors.text, fontWeight: '700', fontSize: fs.sm },
});
