import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ProductHero } from '../components/ProductHero';
import { InvestmentScore } from '../components/InvestmentScore';
import { PriceChart } from '../components/PriceChart';
import { TopHitCard } from '../components/TopHitCard';
import { ValueBreakdown } from '../components/ValueBreakdown';
import { RecommendationCard } from '../components/RecommendationCard';
import { SectionHeader } from '../components/SectionHeader';
import { Colors, Spacing, Radius, ChartColors } from '../components/tokens';
import type { CardHit } from '../components/CardRow';

const TABS = ['Overview', 'Play Booster Hits', 'EV Breakdown', 'Price History'] as const;
type Tab = typeof TABS[number];

const HITS: CardHit[] = [
  { name: 'Ugin, Eye of the Storms',  rarity: 'M', price: '$49.99', pullRate: '295', pullPct: '0.34%', evContribution: '$2.84', artColors: ['#1a3a6a', '#060d1a'], artInitial: 'U' },
  { name: 'Mardu Siegebreaker',         rarity: 'M', price: '$34.99', pullRate: '275', pullPct: '0.36%', evContribution: '$2.60', artColors: ['#6a1a1a', '#1a0606'], artInitial: 'M' },
  { name: 'Abuelo, Ancestral Echo',     rarity: 'M', price: '$28.99', pullRate: '310', pullPct: '0.32%', evContribution: '$1.88', artColors: ['#4a4210', '#1a1606'], artInitial: 'A' },
  { name: 'Elspeth, Storm Slayer',      rarity: 'M', price: '$24.99', pullRate: '340', pullPct: '0.29%', evContribution: '$1.69', artColors: ['#e8e4d0', '#2a2826'], artInitial: 'E' },
  { name: 'Narset, Jeskai Waymaster',   rarity: 'M', price: '$21.99', pullRate: '370', pullPct: '0.27%', evContribution: '$1.44', artColors: ['#1a2a5a', '#060810'], artInitial: 'N' },
];

const EV_SEGMENTS = [
  { label: 'Mythics',           percentage: 19.8, amount: '$25.04', color: ChartColors.mythics },
  { label: 'Rares',             percentage: 28.6, amount: '$36.19', color: ChartColors.rares },
  { label: 'Foils',             percentage: 18.7, amount: '$23.71', color: ChartColors.foils },
  { label: 'Showcase',          percentage: 15.9, amount: '$20.11', color: ChartColors.showcase },
  { label: 'Special Guests',    percentage: 8.4,  amount: '$10.64', color: ChartColors.specialGuests },
  { label: 'Bulk & Commons',    percentage: 8.6,  amount: '$10.05', color: ChartColors.bulk },
];

const SCORE_BARS = [
  { label: 'EV Ratio',   value: 88, color: Colors.success },
  { label: 'Momentum',   value: 76, color: Colors.accent },
  { label: 'Liquidity',  value: 82, color: Colors.accent },
  { label: 'Supply',     value: 72, color: Colors.warning },
];

export default function ProductScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Nav */}
      <View style={styles.nav}>
        <Pressable style={styles.navBtn} hitSlop={12}>
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 10, color: Colors.accent, fontWeight: '800' }}>VM</Text>
          </View>
          <Text style={styles.brandName}>VAULT<Text style={styles.brandAccent}>MARK</Text></Text>
        </View>
        <View style={styles.navActions}>
          <Pressable style={styles.navBtn} hitSlop={8}><Text style={styles.navBtnIcon}>☆</Text></Pressable>
          <Pressable style={styles.navBtn} hitSlop={8}><Text style={styles.navBtnIcon}>↑</Text></Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ProductHero
          setCode="TDM"
          year="2025"
          title={`Tarkir:\nDragonstorm`}
          subtitle="Play Booster Box"
          releaseDate="Released Apr 11, 2025"
          metrics={[
            { label: 'Market Price', value: '$149.99', sub: '+2.52% · 7d' },
            { label: 'Expected EV',  value: '$126.74', sub: '84.5% of price' },
            { label: 'Investment Score', value: '78', sub: 'GOOD', isScore: true, score: 78 },
          ]}
        />

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            {TABS.map(tab => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.tabActive]}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>

          {/* Box Overview */}
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Product Details" title="Box Overview" />
            </View>
            <View style={styles.card}>
              <Text style={styles.boxDesc}>
                Each Play Booster Box contains 36 Play Boosters.{'\n'}Each Play Booster includes 14 Magic cards.
              </Text>
              <View style={styles.boxStats}>
                {[
                  { val: '36', lbl: 'Packs\nper Box' },
                  { val: '14', lbl: 'Cards\nper Pack' },
                  { val: '1–4', lbl: 'Rares or higher\nper Pack' },
                  { val: '~33%', lbl: 'Foil in\nof Packs' },
                ].map((s, i, arr) => (
                  <View key={s.lbl} style={[styles.bsCell, i < arr.length - 1 && styles.bsCellBorder]}>
                    <Text style={styles.bsVal}>{s.val}</Text>
                    <Text style={styles.bsLbl}>{s.lbl}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* EV Breakdown */}
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Per Box Opening" title="Expected Value Breakdown" />
            </View>
            <ValueBreakdown totalEV="$126.74" segments={EV_SEGMENTS} />
          </View>

          {/* Top Hits */}
          <TopHitCard hits={HITS} totalCount={50} />

          {/* Price History */}
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="30-Day Trend" title="Price History" />
            </View>
            <PriceChart currentPrice="$149.99" weekChange="+$3.78 · +2.59%" />
          </View>

          {/* Investment Score */}
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Analysis" title="Investment Score" />
            </View>
            <InvestmentScore
              score={78}
              grade="Good"
              description="Strong EV ratio and upward price momentum. Supply tightening post-release."
              bars={SCORE_BARS}
            />
          </View>

          {/* Recommendation */}
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Based on Current Pricing" title="Recommendation" />
            </View>
            <RecommendationCard
              signal="BUY"
              rationale="Solid buy window. Price sits 12.4% below the 52W high with an 84.5% EV ratio. Ugin anchors the chase slot, supply is tightening post-release, and 30-day momentum is positive."
              confidence={78}
            />
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontSize: 22, color: Colors.text2, lineHeight: 26, marginTop: -2 },
  navBtnIcon: { fontSize: 16, color: Colors.text2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandIcon: {
    width: 26, height: 26,
    borderRadius: 7,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
  brandAccent: { color: Colors.accent },
  navActions: { flexDirection: 'row', gap: 8 },

  scroll: { flex: 1 },

  tabsScroll: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg },
  tab: { paddingVertical: 12, paddingHorizontal: Spacing.md, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.text3, letterSpacing: -0.1, whiteSpace: 'nowrap' },
  tabTextActive: { color: Colors.text1 },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: Colors.accent, borderRadius: 2 },

  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  sectionHead: { marginBottom: 10 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  boxDesc: {
    fontSize: 13, color: Colors.text2, lineHeight: 19,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  boxStats: { flexDirection: 'row' },
  bsCell: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  bsCellBorder: { borderRightWidth: 1, borderRightColor: Colors.border2 },
  bsVal: { fontSize: 15, fontWeight: '800', color: Colors.text1, letterSpacing: -0.4, fontVariant: ['tabular-nums'], lineHeight: 18 },
  bsLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, color: Colors.text3, textAlign: 'center', marginTop: 3, lineHeight: 12 },
});
