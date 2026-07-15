import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  StatusBar, ActivityIndicator, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Radius } from '../../components/tokens';
import type { UserProfile } from '../../data/types';

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('is_public', true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            bio: data.bio,
            avatarUrl: data.avatar_url,
            isPublic: data.is_public,
            itemCount: data.item_count ?? 0,
          });
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [username]);

  const initials = (profile?.displayName || username || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={s.center}><ActivityIndicator color={Colors.accent} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (notFound || !profile) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </Pressable>
        <View style={s.center}>
          <Text style={s.notFoundIcon}>◉</Text>
          <Text style={s.notFoundTitle}>Profile Not Found</Text>
          <Text style={s.notFoundSub}>This profile doesn't exist or isn't public.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </Pressable>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.displayName}>{profile.displayName || username}</Text>
          {profile.username && <Text style={s.handle}>@{profile.username}</Text>}
          {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}
        </View>

        {/* Stats */}
        <View style={s.statsCard}>
          <Text style={s.statsTitle}>Vault Summary</Text>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{profile.itemCount}</Text>
              <Text style={s.statLabel}>Products</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>◈</Text>
              <Text style={s.statLabel}>Collector</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.stat}>
              <Text style={s.statValue}>MTG</Text>
              <Text style={s.statLabel}>Investor</Text>
            </View>
          </View>
        </View>

        <View style={s.badgeRow}>
          <View style={s.badge}><Text style={s.badgeText}>🌐 Public Vault</Text></View>
          <View style={s.badge}><Text style={s.badgeText}>◈ VaultMark Member</Text></View>
        </View>

        <Text style={s.footer}>
          Shared via VaultMark · MTG Investment Tracker
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  backBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backText: { fontSize: 14, color: Colors.accent, fontWeight: '600' },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl, gap: Spacing.xl, alignItems: 'center' },
  avatarWrap: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 2, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.accent },
  displayName: { fontSize: 26, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5 },
  handle: { fontSize: 14, color: Colors.text3 },
  bio: { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  statsCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, gap: Spacing.lg },
  statsTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, textAlign: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text1 },
  statLabel: { fontSize: 10, fontWeight: '600', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  badge: { backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.accent },
  footer: { fontSize: 11, color: Colors.text3, textAlign: 'center' },
  notFoundIcon: { fontSize: 48, color: Colors.text3 },
  notFoundTitle: { fontSize: 20, fontWeight: '700', color: Colors.text1 },
  notFoundSub: { fontSize: 14, color: Colors.text3 },
});
