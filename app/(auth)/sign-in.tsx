import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Radius } from '../../components/tokens';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, AuthProvider updates session and _layout.tsx re-renders with tabs
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
        <View style={s.inner}>
          <View style={s.logoWrap}>
            <Text style={s.logo}>◈</Text>
            <Text style={s.appName}>VaultMark</Text>
            <Text style={s.tagline}>MTG Investment Tracker</Text>
          </View>

          <View style={s.form}>
            {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

            <View style={s.field}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.text3}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.text3}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Pressable style={[s.btn, loading && s.btnDisabled]} onPress={handleSignIn} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.btnText}>Sign In</Text>
              }
            </Pressable>

            <Pressable onPress={() => router.push('/(auth)/sign-up')} style={s.link}>
              <Text style={s.linkText}>Don't have an account? <Text style={s.linkBold}>Sign up</Text></Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  kav: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.xxl },
  logoWrap: { alignItems: 'center', gap: 6 },
  logo: { fontSize: 48, color: Colors.accent },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.text1, letterSpacing: -1 },
  tagline: { fontSize: 13, color: Colors.text3 },
  form: { gap: Spacing.md },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: Colors.danger, borderRadius: Radius.md, padding: Spacing.md },
  errorText: { fontSize: 13, color: Colors.danger },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text2, letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 14,
    fontSize: 15, color: Colors.text1,
  },
  btn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { fontSize: 14, color: Colors.text3 },
  linkBold: { color: Colors.accent, fontWeight: '700' },
});
