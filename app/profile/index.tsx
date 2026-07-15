import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, TextInput, ActivityIndicator, Share, Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import { useUserState } from '../../data/userState';
import { PRODUCTS } from '../../data/products';
import { Colors, Spacing, Radius } from '../../components/tokens';
import type { UserProfile } from '../../data/types';

function SettingRow({ label, value, onPress, note }: { label: string; value?: string; onPress?: () => void; note?: string }) {
  return (
    <Pressable onPress={onPress} style={[ps.row, !onPress && ps.rowStatic]}>
      <View style={ps.rowInfo}>
        <Text style={ps.rowLabel}>{label}</Text>
        {note && <Text style={ps.rowNote}>{note}</Text>}
      </View>
      {value && <Text style={ps.rowValue}>{value}</Text>}
      {onPress && <Text style={ps.rowArrow}>›</Text>}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={ps.section}>
      <Text style={ps.sectionTitle}>{title}</Text>
      <View style={ps.sectionCard}>{children}</View>
    </View>
  );
}

function Div() { return <View style={ps.divider} />; }

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { collection, preferences, updatePreferences } = useUserState();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => {
        if (data) {
          const p: UserProfile = {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            bio: data.bio,
            avatarUrl: data.avatar_url,
            isPublic: data.is_public,
            itemCount: data.item_count ?? 0,
          };
          setProfile(p);
          setDisplayName(data.display_name ?? '');
          setUsername(data.username ?? '');
          setBio(data.bio ?? '');
          setIsPublic(data.is_public ?? true);
        }
        setLoadingProfile(false);
      });
  }, [session]);

  async function saveProfile() {
    if (!session) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      display_name: displayName.trim(),
      username: username.trim().toLowerCase() || null,
      bio: bio.trim(),
      is_public: isPublic,
    }).eq('id', session.user.id);
    setSaving(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setDirty(false);
    }
  }

  async function handleShare() {
    const uname = username.trim().toLowerCase();
    if (!uname) { Alert.alert('Set a username first to get a shareable link.'); return; }
    const url = `vaultmark://profile/${uname}`;
    const totalValue = collection
      .reduce((s, item) => {
        const p = PRODUCTS.find(p => p.id === item.productId);
        return s + (p ? p.currentMarketPrice * item.quantity : 0);
      }, 0);
    await Share.share({
      title: 'My VaultMark Profile',
      message: `Check out my MTG collection on VaultMark!\n\n${collection.length} product${collection.length !== 1 ? 's' : ''} · $${totalValue.toFixed(2)} value\n\n${url}`,
    });
  }

  const initials = (displayName || 'VM').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (loadingProfile) {
    return (
      <SafeAreaView style={ps.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={ps.loadingWrap}><ActivityIndicator color={Colors.accent} size="large" /></View>
      </SafeAreaView>
    );
  }

  const totalValue = collection.reduce((s, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.productId);
    return s + (p ? p.currentMarketPrice * item.quantity : 0);
  }, 0);
  const totalInvested = collection.reduce((s, item) => s + item.purchasePrice * item.quantity, 0);
  const pnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return (
    <SafeAreaView style={ps.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView style={ps.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={ps.scrollContent}>

        {/* Avatar + identity */}
        <View style={ps.profileHeader}>
          <View style={ps.avatar}>
            <Text style={ps.avatarText}>{initials}</Text>
          </View>
          <View style={ps.identityFields}>
            <View style={ps.field}>
              <Text style={ps.fieldLabel}>Display Name</Text>
              <TextInput
                style={ps.fieldInput}
                value={displayName}
                onChangeText={v => { setDisplayName(v); setDirty(true); }}
                placeholder="Your name"
                placeholderTextColor={Colors.text3}
              />
            </View>
            <View style={ps.field}>
              <Text style={ps.fieldLabel}>Username</Text>
              <TextInput
                style={ps.fieldInput}
                value={username}
                onChangeText={v => { setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, '')); setDirty(true); }}
                placeholder="username"
                placeholderTextColor={Colors.text3}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={ps.field}>
          <Text style={ps.fieldLabel}>Bio</Text>
          <TextInput
            style={[ps.fieldInput, ps.bioInput]}
            value={bio}
            onChangeText={v => { setBio(v); setDirty(true); }}
            placeholder="MTG collector & investor..."
            placeholderTextColor={Colors.text3}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Stats */}
        <View style={ps.statsRow}>
          {[
            { label: 'Items', value: `${collection.length}` },
            { label: 'Value', value: `$${totalValue.toFixed(0)}` },
            { label: 'Gain/Loss', value: `${pnl >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%`, color: pnl >= 0 ? Colors.success : Colors.danger },
          ].map(stat => (
            <View key={stat.label} style={ps.statCard}>
              <Text style={[ps.statValue, stat.color ? { color: stat.color } : {}]}>{stat.value}</Text>
              <Text style={ps.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Public toggle + share */}
        <View style={ps.shareRow}>
          <Pressable
            style={[ps.publicToggle, isPublic && ps.publicToggleOn]}
            onPress={() => { setIsPublic(v => !v); setDirty(true); }}
          >
            <Text style={[ps.publicToggleText, isPublic && ps.publicToggleTextOn]}>
              {isPublic ? '🌐 Public Profile' : '🔒 Private Profile'}
            </Text>
          </Pressable>
          {isPublic && (
            <Pressable style={ps.shareBtn} onPress={handleShare}>
              <Text style={ps.shareBtnText}>Share ↑</Text>
            </Pressable>
          )}
        </View>

        {dirty && (
          <Pressable style={[ps.saveBtn, saving && ps.saveBtnDisabled]} onPress={saveProfile} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={ps.saveBtnText}>Save Profile</Text>
            }
          </Pressable>
        )}

        {/* Preferences */}
        <Section title="Preferences">
          <SettingRow
            label="Currency"
            value={preferences.currency}
            onPress={() => updatePreferences({ currency: preferences.currency === 'USD' ? 'EUR' : preferences.currency === 'EUR' ? 'GBP' : 'USD' })}
          />
          <Div />
          <SettingRow
            label="Preferred Marketplace"
            value={preferences.marketplace}
            onPress={() => updatePreferences({ marketplace: preferences.marketplace === 'TCGPlayer' ? 'CardMarket' : preferences.marketplace === 'CardMarket' ? 'eBay' : 'TCGPlayer' })}
          />
          <Div />
          <SettingRow label="App Theme" value="Dark" note="Light mode coming soon" />
        </Section>

        <Section title="Financial Settings">
          <SettingRow
            label="Selling Fee Assumption"
            value={`${preferences.sellingFeePct}%`}
            onPress={() => updatePreferences({ sellingFeePct: preferences.sellingFeePct === 12.9 ? 10 : preferences.sellingFeePct === 10 ? 15 : 12.9 })}
            note="Used in profit/loss calculations"
          />
          <Div />
          <SettingRow
            label="Default Tax Estimate"
            value={`${preferences.taxRatePct}%`}
            onPress={() => updatePreferences({ taxRatePct: preferences.taxRatePct === 0 ? 15 : preferences.taxRatePct === 15 ? 25 : 0 })}
          />
        </Section>

        <Section title="Notifications">
          <SettingRow label="Price Alerts" value="Coming Soon" />
          <Div />
          <SettingRow label="New Release Alerts" value="Coming Soon" />
        </Section>

        <Section title="Data">
          <SettingRow label="Data Source" value="Mock Data" note="Live TCGPlayer data coming in a future update" />
          <Div />
          <SettingRow label="Export Collection" onPress={() => {}} note="Export as CSV (coming soon)" />
        </Section>

        <Section title="About">
          <SettingRow label="Version" value="1.0.0 (Alpha)" />
          <Div />
          <SettingRow label="Account" value={session?.user.email ?? ''} />
        </Section>

        <View style={ps.disclaimerBox}>
          <Text style={ps.disclaimerText}>
            VaultMark uses mock data for demonstration purposes. Market prices are illustrative. Always verify on TCGPlayer or CardMarket before buying.
          </Text>
        </View>

        <Pressable style={ps.signOutBtn} onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ])}>
          <Text style={ps.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl },
  profileHeader: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 2, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.accent },
  identityFields: { flex: 1, gap: Spacing.sm },
  field: { gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: Colors.text3, textTransform: 'uppercase' },
  fieldInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: 14, color: Colors.text1 },
  bioInput: { minHeight: 70, textAlignVertical: 'top' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.text1, fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.5 },
  shareRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  publicToggle: { flex: 1, paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center' },
  publicToggleOn: { borderColor: Colors.accent, backgroundColor: 'rgba(139,92,246,0.1)' },
  publicToggleText: { fontSize: 13, fontWeight: '700', color: Colors.text3 },
  publicToggleTextOn: { color: Colors.accent },
  shareBtn: { paddingVertical: 10, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.accent },
  shareBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  section: { gap: 6 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm, minHeight: 52 },
  rowStatic: { opacity: 0.8 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.text1 },
  rowNote: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.text3 },
  rowArrow: { fontSize: 18, color: Colors.text3, lineHeight: 20 },
  divider: { height: 1, backgroundColor: Colors.border2, marginLeft: Spacing.lg },
  disclaimerBox: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  disclaimerText: { fontSize: 11, color: Colors.text3, lineHeight: 17 },
  signOutBtn: { borderWidth: 1, borderColor: Colors.danger, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  signOutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
