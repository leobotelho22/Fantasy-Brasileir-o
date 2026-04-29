import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { posColor, colors, r, fs } from '../theme';

// Badge de posição (GOL, ZAG, etc.) ou status (lesionado, suspenso)
export default function Badge({ label, color, small }) {
  const bg = color ?? posColor(label);
  const size = small ? styles.small : styles.normal;
  return (
    <View style={[styles.base, size, { backgroundColor: bg + '30', borderColor: bg }]}>
      <Text style={[styles.text, small && { fontSize: fs.xs }, { color: bg }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: r.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  normal: { paddingHorizontal: 8, paddingVertical: 3 },
  small:  { paddingHorizontal: 5, paddingVertical: 1 },
  text: {
    fontSize: fs.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
