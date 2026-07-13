import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '../components/tokens';
import { BottomNav } from '../components/BottomNav';

interface SetProduct {
  id: string;
  name: string;
  format: string;
  setCode: string;
  year: string;
  price: string;
  ev: string;
  evPct: string;
  score: number;
  signal: 'BUY' | 'HOLD' | 'WAIT' | 'SKIP';
  colors: readonly [string, string, string];
  glowColors: readonly [string, string, string];
}

const SETS: SetProduct[] = [
  {
    id: 'tdm',
    name: 'Tarkir: Dragonstorm',
    format: 'Play Booster Box',
    setCode: 'TDM',
    year: '2025',
    price: '$149.99',
    ev: '$126.74',
    evPct: '84.5%',
    score: 82,
    signal: 'BUY',
    colors: ['#1A0840', '#0A0520', '#060211'],
    glowColors: ['rgba(139,92,246,0.45)', 'transparent', 'rgba(251,146,60,0.2)'],
  },
  {
    id: 'ffi',
    name: 'Final Fantasy',
    format: 'Play Booster Box',
    setCode: 'FFI',
    year: '2025',
    price: '$199.99',
    ev: '$184.20',
    evPct: '92.1%',
    score: 91,
    signal: 'BUY',
    colors: ['#081828', '#040C18', '#020608'],
    glowColors: ['rgba(59,130,246,0.45)', 'transparent', 'rgba(251,191,36,0.25)'],
  },
  {
    id: 'blb',
    name: 'Bloomburrow',
    format: 'Play Booster Box',
    setCode: 'BLB',
    year: '2024',
    price: '$129.99',
    ev: '$98.40',
    evPct: '75.7%',
    score: 74,
    signal: 'HOLD',
    colors: ['#0A2010', '#051508', '#020A02'],
    glowColors: ['rgba(34,197,94,0.4)', 'transparent', 'rgba(134,239,172,0.15)'],
  },
  {
    id: 'dsk',
    name: 'Duskmourn: House of Horror',
    format: 'Play Booster Box',
    setCode: 'DSK',
    year: '2024',
    price: '$119.99',
    ev: '$87.20',
    evPct: '72.7%',
    score: 65,
    signal: 'HOLD',
    colors: ['#1A0810', '#0A0408', '#060208'],
    glowColors: ['rgba(239,68,68,0.35)', 'transparent', 'rgba(168,85,247,0.2)'],
  },
  {
    id: 'mh3',
    name: 'Modern Horizons 3',
    format: 'Play Booster Box',
    setCode: 'MH3',
    year: '2024',
    price: '$249.99',
    ev: '$198.50',
    evPct: '79.4%',
    score: 88,
    signal: 'BUY',
    colors: ['#0A1830', '#050C18', '#020608'],
    glowColors: ['rgba(251,146,60,0.4)', 'transparent', 'rgba(139,92,246,0.2)'],
  },
  {
    id: 'otj',
    name: 'Outlaws of Thunder Junction',
    format: 'Play Booster Box',
    setCode: 'OTJ',
    year: '2024',
    price: '$109.99',
    ev: '$74.30',
    evPct: '67.6%',
    score: 52,
    signal: 'WAIT',
    colors: ['#1A1008', '#0A0804', '#060402'],
    glowColors: ['rgba(245,158,11,0.4)', 'transparent', 'rgba(239,68,68,0.15)'],
  },
];

const SIGNAL_COLOR: Record<string, string> = {
  BUY:  Colors.success,
  HOLD: Colors.warning,
  WAIT: Colors.warning,
  SKIP: Colors.danger,
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  return (
    <View style={[scoreRingStyles.wrap, { borderColor: `${color}55` }]}>
      <Text style={[scoreRingStyles.num, { color }]}>{score}</Text>
      <Text style={scoreRingStyles.lbl}>score</Text>
    </View>
  );
}

const scoreRingStyles = StyleSheet.create({
  wrap: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  num: { fontSize: 14, fontWeight: '800', lineHeight: 16 },
  lbl: { fontSize: 7, fontWeight: '600', color: Colors.text3, letterSpacing: 0.3 },
});

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filtered = query
    ? SETS.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.setCode.toLowerCase().includes(query) ||
        s.year.includes(query)
      )
    : SETS;

  const featured = SETS[0];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandVM}>VM</Text>
          </View>
          <Text style={styles.brandName}>
            VAULT<Text style={styles.brandAccent}>MARK</Text>
          </Text>
        </View>
        <View style={styles.topBarRight}>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero tagline */}
        {!query && (
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              Invest Smarter{'\n'}in Sealed Magic.
            </Text>
            <Text style={styles.heroSub}>
              Real-time EV analysis for every MTG sealed product
            </Text>
          </View>
        )}

        {/* Search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search sets, codes, formats..."
              placeholderTextColor={Colors.text3}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Text style={styles.clearIcon}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Featured card */}
        {!query && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.eyebrow}>FEATURED THIS WEEK</Text>
              <Text style={styles.sectionTitle}>Top Pick</Text>
            </View>

            <Pressable onPress={() => router.push('/product')} style={styles.featuredPress}>
              <LinearGradient
                colors={featured.colors}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={styles.featuredCard}
              >
                <LinearGradient
                  colors={featured.glowColors}
                  start={{ x: 0.75, y: 0.1 }}
                  end={{ x: 0.25, y: 0.9 }}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.featuredTop}>
                  <View style={styles.featuredCodeBadge}>
                    <Text style={styles.featuredCodeText}>
                      {featured.setCode} · {featured.year}
                    </Text>
                  </View>
                  <View style={[
                    styles.signalBadge,
                    {
                      backgroundColor: `${SIGNAL_COLOR[featured.signal]}1A`,
                      borderColor: `${SIGNAL_COLOR[featured.signal]}44`,
                    },
                  ]}>
                    <Text style={[styles.signalText, { color: SIGNAL_COLOR[featured.signal] }]}>
                      {featured.signal}
                    </Text>
                  </View>
                </View>

                <View style={styles.featuredBottom}>
                  <Text style={styles.featuredName}>{featured.name}</Text>
                  <Text style={styles.featuredFormat}>{featured.format}</Text>

                  <View style={styles.featuredStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statVal}>{featured.price}</Text>
                      <Text style={styles.statLbl}>Market Price</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statVal}>{featured.ev}</Text>
                      <Text style={styles.statLbl}>Expected EV</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statVal, { color: Colors.success }]}>
                        {featured.evPct}
                      </Text>
                      <Text style={styles.statLbl}>EV of Price</Text>
                    </View>
                  </View>
                </View>

                {/* Score badge */}
                <View style={styles.featuredScore}>
                  <Text style={styles.featuredScoreNum}>{featured.score}</Text>
                  <Text style={styles.featuredScoreLbl}>SCORE</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Product list */}
        <View style={styles.section}>
          {!query ? (
            <View style={styles.sectionHead}>
              <Text style={styles.eyebrow}>ALL PRODUCTS</Text>
              <Text style={styles.sectionTitle}>Browse Sets</Text>
            </View>
          ) : (
            <View style={styles.sectionHead}>
              <Text style={styles.eyebrow}>SEARCH RESULTS</Text>
              <Text style={styles.sectionTitle}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
              </Text>
            </View>
          )}

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⊘</Text>
              <Text style={styles.emptyTitle}>No sets found</Text>
              <Text style={styles.emptySub}>Try searching by set name or code</Text>
            </View>
          ) : (
            <View style={styles.productList}>
              {filtered.map((set, i) => (
                <Pressable
                  key={set.id}
                  onPress={() => router.push('/product')}
                  style={[styles.productRow, i === filtered.length - 1 && styles.productRowLast]}
                >
                  {/* Thumbnail */}
                  <LinearGradient
                    colors={set.colors}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={styles.thumb}
                  >
                    <LinearGradient
                      colors={set.glowColors}
                      start={{ x: 0.8, y: 0.1 }}
                      end={{ x: 0.2, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.thumbCode}>{set.setCode}</Text>
                  </LinearGradient>

                  {/* Info */}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{set.name}</Text>
                    <Text style={styles.productMeta}>
                      {set.format} · {set.year}
                    </Text>
                    <View style={styles.productPriceLine}>
                      <Text style={styles.productPrice}>{set.price}</Text>
                      <Text style={styles.productEV}>EV {set.evPct}</Text>
                    </View>
                  </View>

                  {/* Right */}
                  <View style={styles.productRight}>
                    <ScoreRing score={set.score} color={SIGNAL_COLOR[set.signal]} />
                    <View style={[
                      styles.signalPill,
                      { backgroundColor: `${SIGNAL_COLOR[set.signal]}15` },
                    ]}>
                      <Text style={[styles.signalPillText, { color: SIGNAL_COLOR[set.signal] }]}>
                        {set.signal}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandIcon: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  brandVM: { fontSize: 10, color: Colors.accent, fontWeight: '800' },
  brandName: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
  brandAccent: { color: Colors.accent },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  betaBadge: {
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
  },
  betaText: { fontSize: 9, fontWeight: '700', color: Colors.accent, letterSpacing: 0.8 },

  // Hero
  heroSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  heroTitle: {
    fontSize: 30, fontWeight: '800', letterSpacing: -1,
    color: Colors.text1, lineHeight: 34, marginBottom: 8,
  },
  heroSub: { fontSize: 13, color: Colors.text2, fontWeight: '500', lineHeight: 19 },

  // Search
  searchWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 11,
    gap: 8,
  },
  searchIcon: { fontSize: 16, color: Colors.text3 },
  searchInput: {
    flex: 1, fontSize: 14, color: Colors.text1, fontWeight: '500',
  },
  clearIcon: { fontSize: 12, color: Colors.text3 },

  // Section
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionHead: { marginBottom: 12 },
  eyebrow: {
    fontSize: 9, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: Colors.text3, marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 19, fontWeight: '800', letterSpacing: -0.5, color: Colors.text1,
  },

  // Featured card
  featuredPress: { borderRadius: Radius.xl, overflow: 'hidden' },
  featuredCard: {
    borderRadius: Radius.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.xl,
    minHeight: 180,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.xl,
  },
  featuredCodeBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  featuredCodeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  signalBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.sm, borderWidth: 1,
  },
  signalText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  featuredBottom: { gap: 4 },
  featuredName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.6, color: '#fff', lineHeight: 25 },
  featuredFormat: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500', marginBottom: 12 },
  featuredStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: Radius.md, padding: 10, gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  featuredScore: {
    position: 'absolute', top: Spacing.xl, right: Spacing.xl,
    alignItems: 'center',
  },
  featuredScoreNum: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -1, lineHeight: 30 },
  featuredScoreLbl: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8 },

  // Product list
  productList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  productRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border2,
  },
  productRowLast: { borderBottomWidth: 0 },
  thumb: {
    width: 52, height: 68, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  thumbCode: { fontSize: 9, fontWeight: '900', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 },
  productInfo: { flex: 1, minWidth: 0 },
  productName: { fontSize: 13.5, fontWeight: '700', color: Colors.text1, letterSpacing: -0.3 },
  productMeta: { fontSize: 10.5, color: Colors.text3, fontWeight: '500', marginTop: 2 },
  productPriceLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  productPrice: { fontSize: 13, fontWeight: '800', color: Colors.text1, letterSpacing: -0.3 },
  productEV: {
    fontSize: 10, fontWeight: '700', color: Colors.success,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  productRight: { alignItems: 'center', gap: 6, flexShrink: 0 },
  signalPill: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.sm,
  },
  signalPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },

  // Empty state
  emptyState: {
    alignItems: 'center', paddingVertical: 48,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyIcon: { fontSize: 32, color: Colors.text3, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.text2, marginBottom: 4 },
  emptySub: { fontSize: 12, color: Colors.text3, fontWeight: '500' },
});
