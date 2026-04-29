import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fs } from '../theme';

// Exibe o saldo de moedas do usuário
export default function CoinBalance({ amount, large }) {
  return (
    <View style={styles.row}>
      <Ionicons name="logo-bitcoin" size={large ? 22 : 16} color={colors.gold} />
      <Text style={[styles.text, large && styles.large]}>
        {Number(amount).toLocaleString('pt-BR')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { color: colors.gold, fontWeight: '700', fontSize: fs.sm },
  large: { fontSize: fs.xl },
});
