import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import useStore from '../store/useStore';
import { colors, r, sp, fs } from '../theme';

export default function LoginScreen() {
  const [tab,      setTab]      = useState('login');  // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass,  setShowPass] = useState(false);
  const [loading,   setLoading]  = useState(false);
  const login = useStore(s => s.login);

  function handleSubmit() {
    if (tab === 'register' && !name.trim()) {
      return Alert.alert('Campo obrigatório', 'Digite seu nome.');
    }
    if (!email.includes('@')) {
      return Alert.alert('Email inválido', 'Digite um email válido.');
    }
    if (password.length < 6) {
      return Alert.alert('Senha fraca', 'A senha precisa ter pelo menos 6 caracteres.');
    }
    setLoading(true);
    // Simulação de login — substitua por Firebase Auth
    setTimeout(() => {
      login(name || email.split('@')[0], email);
      setLoading(false);
    }, 800);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#0A0A1B', '#0F0F2A', '#0A0A1B']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>⚽</Text>
            </View>
            <Text style={styles.appName}>Fantasy Brasileirão</Text>
            <Text style={styles.tagline}>Série A · Snake Draft · Leilões</Text>
          </View>

          {/* Card de login */}
          <View style={styles.card}>
            {/* Abas Login / Cadastro */}
            <View style={styles.tabRow}>
              {['login', 'register'].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tabBtn, tab === t && styles.tabActive]}
                >
                  <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                    {t === 'login' ? 'Entrar' : 'Criar conta'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campo nome (só no cadastro) */}
            {tab === 'register' && (
              <View style={styles.field}>
                <Text style={styles.label}>Seu nome</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={colors.textSub} />
                  <TextInput
                    style={styles.input}
                    placeholder="Como você quer aparecer na liga"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Campo email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={colors.textSub} />
                <TextInput
                  style={styles.input}
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Campo senha */}
            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSub} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={colors.textSub} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão principal */}
            <Button
              label={tab === 'login' ? 'Entrar' : 'Criar conta e começar'}
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: sp.md }}
            />

            {/* Bônus de início */}
            {tab === 'register' && (
              <View style={styles.bonus}>
                <Ionicons name="logo-bitcoin" size={14} color={colors.gold} />
                <Text style={styles.bonusText}>
                  Você começa com <Text style={{ color: colors.gold, fontWeight: '700' }}>1.000 moedas</Text> para o draft e leilões!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: sp.lg },

  logoArea: { alignItems: 'center', marginBottom: sp.xl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.greenFaint,
    borderWidth: 2, borderColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: sp.md,
  },
  logoEmoji: { fontSize: 36 },
  appName: { color: colors.text, fontSize: fs.xl, fontWeight: '800', letterSpacing: 0.5 },
  tagline: { color: colors.textSub, fontSize: fs.sm, marginTop: 4 },

  card: {
    backgroundColor: colors.card,
    borderRadius: r.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: sp.lg,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: r.sm,
    padding: 3,
    marginBottom: sp.lg,
  },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: r.sm - 2 },
  tabActive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  tabLabel: { color: colors.textSub, fontWeight: '600', fontSize: fs.sm },
  tabLabelActive: { color: colors.text },

  field: { marginBottom: sp.md },
  label: { color: colors.textSub, fontSize: fs.xs, marginBottom: 6, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: r.sm, borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: sp.md, gap: sp.sm,
  },
  input: { flex: 1, color: colors.text, fontSize: fs.md, paddingVertical: 13 },

  bonus: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.gold + '15',
    borderRadius: r.sm, borderWidth: 1, borderColor: colors.gold + '40',
    padding: sp.sm, marginTop: sp.md,
  },
  bonusText: { color: colors.textSub, fontSize: fs.xs, flex: 1 },
});
