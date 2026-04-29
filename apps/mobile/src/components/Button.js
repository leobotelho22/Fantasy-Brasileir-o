import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, r, fs } from '../theme';

// Botão reutilizável com variantes: primary | secondary | danger | ghost
export default function Button({ label, onPress, variant = 'primary', disabled, loading, style }) {
  const bg = {
    primary:   colors.green,
    secondary: colors.cardBorder,
    danger:    colors.danger,
    ghost:     'transparent',
  }[variant];

  const textColor = variant === 'secondary' ? colors.text
    : variant === 'ghost' ? colors.green
    : '#000';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.base, { backgroundColor: bg }, disabled && styles.disabled, style]}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: r.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fs.md,
    fontWeight: '700',
  },
  disabled: { opacity: 0.4 },
});
