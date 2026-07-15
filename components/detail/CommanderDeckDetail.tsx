import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { InvestmentScore } from '../InvestmentScore';
import { PriceChart } from '../PriceChart';
import { RecommendationCard } from '../RecommendationCard';
import { SectionHeader } from '../SectionHeader';
import { IncludedCardRow } from '../IncludedCardRow';
import { AddToCollectionModal } from '../AddToCollectionModal';
import { AddToWatchlistModal } from '../AddToWatchlistModal';
import { Colors, Spacing, Radius } from '../tokens';
import { useUserState } from '../../data/userState';
import type { Product, Condition } from '../../data/types';

interface Props { product: Product }

export function CommanderDeckDetail({ product }: Props) {
  const router = useRouter();
  const { addToCollection, addToWatchlist, isInCollection, isInWatchlist } = useUserState();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const inCollection = isInCollection(product.id);
  const inWatchlist = isInWatchlist(product.id);

  const includedCards = product.includedCards ?? [];
  const totalCardValue = includedCards.reduce((s, c) => s + c.price, 0);
  const changeSign = product.priceChangeWeek >= 0 ? '+' : '';
  const weekChange = `${changeSign}$${Math.abs(product.priceChangeWeek).toFixed(2)} · ${changeSign}${product.priceChangePct.toFixed(2)}%`;

  function handleAddToCollection(qty: number, price: number, date: string, condition: Condition, notes: string) {
    addToCollection({ productId: product.id, quantity: qty, purchasePrice: price, purchaseDate: date, condition, notes });
    setShowCollectionModal(false);
  }

  function handleAddToWatchlist(targetPrice: number, notes: string) {
    addToWatchlist({ productId: product.id, targetPrice, dateAdded: new Date().toISOString().split('T')[0], notes });
    setShowWatchlistModal(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.nav}>
        <Pressable style={styles.navBtn} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 10, color: Colors.accent, fontWeight: '800' }}>VM</Text>
          </View>
          <Text style={styles.brandName}>VAULT<Text style={styles.brandAccent}>MARK</Text></Text>
        </View>
        <View style={styles.navActions}>
          <Pressable onPress={() => setShowWatchlistModal(true)} style={styles.navBtn} hitSlop={8}>
            <Text style={[styles.navBtnIcon, inWatchlist && { color: Colors.danger }]}>{inWatchlist ? '♥' : '♡'}</Text>
          </Pressable>
          <Pressable style={styles.navBtn} hitSlop={8}><Text style={styles.navBtnIcon}>↑</Text></Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#0a1a2e', '#050d18', Colors.bg]} style={styles.hero}>
          <View style={styles.heroContent}>
            <LinearGradient colors={['#1a3050', '#0a1828', '#030810']} style={styles.artBox}>
              <Text style={styles.artCmd}>CMD</Text>
              <Text style={styles.artDeck}>DECK</Text>
              <View style={styles.artBadge}>
                <Text style={styles.artBadgeText}>100</Text>
              </View>
            </LinearGradient>

            <View style={styles.heroInfo}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>COMMANDER DECK</Text>
              </View>
              <Text style={styles.deckName} numberOfLines={3}>{product.name}</Text>
              <Text style={styles.setName}>{product.setName}</Text>
              <Text style={styles.releaseDate}>
                {new Date(product.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>${product.currentMarketPrice.toFixed(2)}</Text>
                <Text style={[styles.priceChange, { color: product.priceChangeWeek >= 0 ? Colors.success : Colors.danger }]}>
                  {changeSign}${Math.abs(product.priceChangeWeek).toFixed(2)} · 7d
                </Text>
              </View>
            </View>
          </View>

          {/* Key metrics row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCell}>
              <Text style={styles.metricVal}>${product.currentMarketPrice.toFixed(2)}</Text>
              <Text style={styles.metricLbl}>Market Price</Text>
            </View>
            {totalCardValue > 0 && (
              <View style={[styles.metricCell, styles.metricBorder]}>
                <Text style={[styles.metricVal, { color: totalCardValue > product.currentMarketPrice ? Colors.success : Colors.text1 }]}>
                  ${totalCardValue.toFixed(2)}
                </Text>
                <Text style={styles.metricLbl}>Singles Value</Text>
              </View>
            )}
            <View style={[styles.metricCell, styles.metricBorder]}>
              <Text style={[styles.metricVal, { color: Colors.accent }]}>{product.investmentScore ?? '—'}</Text>
              <Text style={styles.metricLbl}>Invest Score</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Included cards */}
          {includedCards.length > 0 && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Deck Contents" title="Notable Cards" /></View>
              <View style={styles.card}>
                {includedCards.map((card, i) => (
                  <IncludedCardRow key={card.name} card={card} isLast={i === includedCards.length - 1} />
                ))}
              </View>
            </View>
          )}

          {/* Price History */}
          {product.priceHistory.length > 0 && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="30-Day Trend" title="Price History" /></View>
              <PriceChart currentPrice={`$${product.currentMarketPrice.toFixed(2)}`} weekChange={weekChange} priceHistory={product.priceHistory} />
            </View>
          )}

          {/* Investment Score */}
          {product.scoreBars && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Analysis" title="Investment Score" /></View>
              <InvestmentScore
                score={product.investmentScore ?? 0}
                grade={(product.investmentScore ?? 0) >= 80 ? 'Excellent' : (product.investmentScore ?? 0) >= 65 ? 'Good' : 'Fair'}
                description="Based on singles value, price momentum, liquidity, and reprint risk of key cards."
                bars={product.scoreBars}
              />
            </View>
          )}

          {/* Recommendation */}
          <View>
            <View style={styles.sectionHead}><SectionHeader eyebrow="Based on Current Data" title="Recommendation" /></View>
            <RecommendationCard
              signal={product.recommendation ?? 'HOLD'}
              rationale={product.recommendationRationale ?? ''}
              confidence={product.confidence ?? 60}
            />
          </View>

          <View style={styles.ctaRow}>
            <Pressable onPress={() => setShowCollectionModal(true)} style={[styles.ctaBtn, styles.ctaPrimary, inCollection && styles.ctaOwned]}>
              <Text style={styles.ctaPrimaryText}>{inCollection ? '✓ In Collection' : '+ Add to Collection'}</Text>
            </Pressable>
            <Pressable onPress={() => setShowWatchlistModal(true)} style={[styles.ctaBtn, styles.ctaSecondary]}>
              <Text style={styles.ctaSecondaryText}>{inWatchlist ? '♥ Watching' : '♡ Watchlist'}</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <AddToCollectionModal visible={showCollectionModal} product={product} onClose={() => setShowCollectionModal(false)} onSave={handleAddToCollection} />
      <AddToWatchlistModal visible={showWatchlistModal} product={product} onClose={() => setShowWatchlistModal(false)} onSave={handleAddToWatchlist} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 22, color: Colors.text2, lineHeight: 26, marginTop: -2 },
  navBtnIcon: { fontSize: 16, color: Colors.text2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandIcon: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
  brandAccent: { color: Colors.accent },
  navActions: { flexDirection: 'row', gap: 8 },
  scroll: { flex: 1 },
  hero: { paddingHorizontal: Spacing.lg, paddingBottom: 0, paddingTop: Spacing.md },
  heroContent: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  artBox: { width: 110, height: 150, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)', gap: 2 },
  artCmd: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.45)', letterSpacing: 2 },
  artDeck: { fontSize: 20, fontWeight: '900', color: 'rgba(255,255,255,0.85)', letterSpacing: 2 },
  artBadge: { backgroundColor: 'rgba(59,130,246,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, marginTop: 4, borderWidth: 1, borderColor: 'rgba(59,130,246,0.5)' },
  artBadgeText: { fontSize: 11, fontWeight: '800', color: '#93c5fd', letterSpacing: 0.5 },
  heroInfo: { flex: 1, gap: 5 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  typeText: { fontSize: 9, fontWeight: '800', color: '#93c5fd', letterSpacing: 0.8 },
  deckName: { fontSize: 14, fontWeight: '800', color: Colors.text1, letterSpacing: -0.3, lineHeight: 19 },
  setName: { fontSize: 12, color: Colors.text3, fontWeight: '500' },
  releaseDate: { fontSize: 11, color: Colors.text3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  price: { fontSize: 18, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  priceChange: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  metricsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border2, marginTop: Spacing.sm },
  metricCell: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  metricBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border2 },
  metricVal: { fontSize: 16, fontWeight: '800', color: Colors.text1, letterSpacing: -0.4, fontVariant: ['tabular-nums'] },
  metricLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, color: Colors.text3, marginTop: 3 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  sectionHead: { marginBottom: 10 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  ctaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  ctaBtn: { flex: 1, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: { backgroundColor: Colors.accent },
  ctaOwned: { backgroundColor: Colors.success },
  ctaSecondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  ctaPrimaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  ctaSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.text2 },
});
