import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';
import { colors, r, sp, fs } from '../theme';

// Card de jogador usado no mercado, draft e escalação
export default function PlayerCard({ player, onPress, action, actionLabel, actionVariant = 'primary', rightContent }) {
  if (!player) return null;

  const statusColor = {
    available: colors.green,
    injured:   colors.danger,
    suspended: colors.warning,
  }[player.status] ?? colors.textSub;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={styles.card}
    >
      {/* Avatar circular com inicial */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{player.nick[0]}</Text>
      </View>

      {/* Info central */}
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{player.nick}</Text>
          {player.status !== 'available' && (
            <Ionicons
              name={player.status === 'injured' ? 'medical' : 'warning'}
              size={12} color={statusColor} style={{ marginLeft: 4 }}
            />
          )}
        </View>
        <View style={[styles.row, { marginTop: 3 }]}>
          <Badge label={player.pos} small />
          <Text style={styles.club}>{player.club}</Text>
        </View>
      </View>

      {/* Direita: pontos ou conteúdo customizado */}
      {rightContent ?? (
        <View style={styles.right}>
          <Text style={styles.pts}>{player.pts?.toFixed(1)}</Text>
          <Text style={styles.ptsLabel}>pts</Text>
          <Text style={styles.avg}>méd {player.avg?.toFixed(1)}</Text>
        </View>
      )}

      {/* Botão de ação (opcional) */}
      {action && (
        <TouchableOpacity
          onPress={action}
          activeOpacity={0.75}
          style={[styles.actionBtn, actionVariant === 'danger' && styles.actionDanger]}
        >
          <Text style={[styles.actionLabel, actionVariant === 'danger' && { color: colors.danger }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: r.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: sp.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp.sm,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    marginRight: sp.md,
  },
  avatarText: { color: colors.text, fontWeight: '700', fontSize: fs.lg },
  info: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { color: colors.text, fontWeight: '600', fontSize: fs.md, flex: 1 },
  club: { color: colors.textSub, fontSize: fs.xs, marginLeft: sp.sm },
  right: { alignItems: 'flex-end', marginLeft: sp.sm },
  pts: { color: colors.green, fontWeight: '700', fontSize: fs.lg },
  ptsLabel: { color: colors.textSub, fontSize: fs.xs },
  avg: { color: colors.textMuted, fontSize: fs.xs, marginTop: 2 },
  actionBtn: {
    backgroundColor: colors.greenFaint,
    borderRadius: r.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: sp.sm,
    borderWidth: 1,
    borderColor: colors.green,
  },
  actionDanger: { backgroundColor: colors.danger + '15', borderColor: colors.danger },
  actionLabel: { color: colors.green, fontWeight: '700', fontSize: fs.xs },
});
