import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Radius } from '../../components/tokens';

export default function SignUpScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSignUp() {
    if (!displayName || !email || !password || !confirm) { setError('Please fill in all fields.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  if (done) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={s.doneWrap}>
          <Text style={s.doneIcon}>✓</Text>
          <Text style={s.doneTitle}>Check your email</Text>
          <Text style={s.doneSub}>We sent a confirmation link to {email}. Click it to activate your account, then sign in.</Text>
          <Pressable style={s.btn} onPress={() => router.replace('/(auth)/sign-in')}>
            <Text style={s.btnText}>Back to Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.inner}>
            <View style={s.header}>
              <Pressable onPress={() => router.back()} style={s.backBtn}>
                <Text style={s.backText}>← Back</Text>
              </Pressable>
              <Text style={s.title}>Create Account</Text>
              <Text style={s.subtitle}>Start tracking your MTG investments</Text>
            </View>

            <View style={s.form}>
              {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

              {[
                { label: 'Display Name', value: displayName, setter: setDisplayName, placeholder: 'Vault Collector', autoCapitalize: 'words' as const },
                { label: 'Email', value: email, setter: setEmail, placeholder: 'you@example.com', keyboardType: 'email-address' as const, autoCapitalize: 'none' as const },
                { label: 'Password', value: password, setter: setPassword, placeholder: '••••••••', secure: true },
                { label: 'Confirm Password', value: confirm, setter: setConfirm, placeholder: '••••••••', secure: true },
              ].map(f => (
                <View key={f.label} style={s.field}>
                  <Text style={s.label}>{f.label}</Text>
                  <TextInput
                    style={s.input}
                    value={f.value}
                    onChangeText={f.setter}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.text3}
                    secureTextEntry={f.secure}
                    autoCapitalize={f.autoCapitalize}
                    keyboardType={f.keyboardType}
                  />
                </View>
              ))}

              <Pressable style={[s.btn, loading && s.btnDisabled]} onPress={handleSignUp} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.btnText}>Create Account</Text>
                }
              </Pressable>

              <Pressable onPress={() => router.back()} style={s.link}>
                <Text style={s.linkText}>Already have an account? <Text style={s.linkBold}>Sign in</Text></Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  kav: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxxl, gap: Spacing.xl },
  header: { gap: 4 },
  backBtn: { marginBottom: Spacing.sm },
  backText: { fontSize: 14, color: Colors.accent, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text1, letterSpacing: -1 },
  subtitle: { fontSize: 13, color: Colors.text3 },
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
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: Spacing.lg },
  doneIcon: { fontSize: 56, color: Colors.success },
  doneTitle: { fontSize: 24, fontWeight: '800', color: Colors.text1 },
  doneSub: { fontSize: 14, color: Colors.text3, textAlign: 'center', lineHeight: 22 },
});
