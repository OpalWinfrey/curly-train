import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';

import { ProductHero } from '../components/ProductHero';
import { MarketOverviewCard } from '../components/MarketOverviewCard';
import { EVMetricsRow } from '../components/EVMetricsRow';
import { TopHitCard } from '../components/TopHitCard';
import { ValueBreakdown } from '../components/ValueBreakdown';
import type { CategoryItem } from '../components/ValueBreakdown';
import { RecommendationCard } from '../components/RecommendationCard';
import { SectionHeader } from '../components/SectionHeader';
import { BottomNav } from '../components/BottomNav';
import { Colors, Spacing, Radius, ChartColors } from '../components/tokens';
import type { CardHit } from '../components/CardRow';

const HITS: CardHit[] = [
  { name: 'Ugin, Eye of the Storms',  rarity: 'M', price: '$49.99', pullRate: '295', pullPct: '0.34%', evContribution: '$2.84', artColors: ['#1a3a6a', '#060d1a'], artInitial: 'U' },
  { name: 'Mardu Siegebreaker',        rarity: 'M', price: '$34.99', pullRate: '275', pullPct: '0.36%', evContribution: '$2.60', artColors: ['#6a1a1a', '#1a0606'], artInitial: 'M' },
  { name: 'Abuelo, Ancestral Echo',    rarity: 'M', price: '$28.99', pullRate: '310', pullPct: '0.32%', evContribution: '$1.88', artColors: ['#4a4210', '#1a1606'], artInitial: 'A' },
  { name: 'Elspeth, Storm Slayer',     rarity: 'M', price: '$24.99', pullRate: '340', pullPct: '0.29%', evContribution: '$1.69', artColors: ['#e8e4d0', '#2a2826'], artInitial: 'E' },
  { name: 'Narset, Jeskai Waymaster',  rarity: 'M', price: '$21.99', pullRate: '370', pullPct: '0.27%', evContribution: '$1.44', artColors: ['#1a2a5a', '#060810'], artInitial: 'N' },
];

const EV_SEGMENTS = [
  { label: 'Mythics',        percentage: 19.8, amount: '$25.04', color: ChartColors.mythics },
  { label: 'Rares',          percentage: 28.6, amount: '$36.19', color: ChartColors.rares },
  { label: 'Foils',          percentage: 18.7, amount: '$23.71', color: ChartColors.foils },
  { label: 'Showcase',       percentage: 15.9, amount: '$20.11', color: ChartColors.showcase },
  { label: 'Special Guests', percentage: 8.4,  amount: '$10.64', color: ChartColors.specialGuests },
  { label: 'Bulk & Commons', percentage: 8.6,  amount: '$10.05', color: ChartColors.bulk },
];

const TOP_BY_CATEGORY: CategoryItem[] = [
  { category: 'Mythics',        cardName: 'Ugin, Eye of the Storms', value: '$2.84', color: ChartColors.mythics },
  { category: 'Rares',          cardName: 'Mardu Siegebreaker',       value: '$2.60', color: ChartColors.rares },
  { category: 'Foils',          cardName: 'Abuelo, Ancestral Echo',   value: '$1.88', color: ChartColors.foils },
  { category: 'Showcase',       cardName: 'Elspeth, Storm Slayer',    value: '$1.69', color: ChartColors.showcase },
  { category: 'Special Guests', cardName: 'Demonic Tutor (SPG)',      value: '$1.25', color: ChartColors.specialGuests },
];

const REC_BULLETS = [
  'Strong EV at 84.5% of market price',
  'High-impact mythics drive long-term demand',
  'Limited supply and sealed demand remains strong',
  'Play booster EV expected to increase over time',
];

export default function ProductScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Nav */}
      <View style={styles.nav}>
        <Pressable style={styles.navBtn} hitSlop={12} onPress={() => router.back()}>
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

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>

        <ProductHero
          setCode="TDM"
          year="2025"
          title={`Tarkir:\nDragonstorm`}
          subtitle="Play Booster Box"
          releaseDate="Released Apr 11, 2025"
          price="$149.99"
          priceChange="$3.69 (2.52%) past 7 days"
        />

        <View style={styles.content}>

          <MarketOverviewCard
            score={82}
            grade="Excellent"
            price="$149.99"
            change7D="2.52%"
            change30D="8.17%"
          />

          <EVMetricsRow
            estimatedEV="$126.74"
            evPct="84.5% of price"
            breakEvenChance="61%"
            avgPullValue="$3.52"
            recommendation="BUY"
            rationale="Strong value at current price point"
          />

          <TopHitCard hits={HITS} totalCount={50} />

          <ValueBreakdown
            totalEV="$126.74"
            segments={EV_SEGMENTS}
            topByCategory={TOP_BY_CATEGORY}
          />

          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Based on Current Data" title="Our Recommendation" />
            </View>
            <RecommendationCard
              signal="BUY"
              bullets={REC_BULLETS}
              confidence={4}
              confidenceLabel="High"
            />
          </View>

        </View>
      </ScrollView>

      <BottomNav activeTab="products" />
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
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  sectionHead: { marginBottom: 10 },
});
