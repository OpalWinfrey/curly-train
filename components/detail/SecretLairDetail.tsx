import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, Share,
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

function MetricTile({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <View style={mStyles.tile}>
      <Text style={mStyles.label}>{label}</Text>
      <Text style={[mStyles.value, accent ? { color: accent } : {}]}>{value}</Text>
      {sub && <Text style={mStyles.sub}>{sub}</Text>}
    </View>
  );
}
const mStyles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: Colors.surface2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, alignItems: 'center' },
  label: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: Colors.text3, marginBottom: 4, textAlign: 'center' },
  value: { fontSize: 17, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5, fontVariant: ['tabular-nums'], lineHeight: 20 },
  sub: { fontSize: 10, color: Colors.text3, marginTop: 2, textAlign: 'center' },
});

function RatingBar({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const displayValue = invert ? 100 - value : value;
  const color = displayValue >= 70 ? Colors.success : displayValue >= 45 ? Colors.warning : Colors.danger;
  return (
    <View style={rStyles.row}>
      <Text style={rStyles.label}>{label}</Text>
      <View style={rStyles.track}>
        <View style={[rStyles.fill, { width: `${displayValue}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[rStyles.score, { color }]}>{displayValue}</Text>
    </View>
  );
}
const rStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label: { width: 160, fontSize: 12, fontWeight: '600', color: Colors.text2 },
  track: { flex: 1, height: 6, backgroundColor: Colors.surface2, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  score: { width: 28, fontSize: 12, fontWeight: '700', textAlign: 'right', fontVariant: ['tabular-nums'] },
});

export function SecretLairDetail({ product }: Props) {
  const router = useRouter();
  const { addToCollection, addToWatchlist, isInCollection, isInWatchlist } = useUserState();
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const inCollection = isInCollection(product.id);
  const inWatchlist = isInWatchlist(product.id);
  const meta = product.secretLairMetadata;

  const mainCards = (product.includedCards ?? []).filter(c => !c.isBonus);
  const bonusCards = (product.includedCards ?? []).filter(c => c.isBonus);
  const totalCardValue = (product.includedCards ?? []).reduce((s, c) => s + c.price, 0);
  const msrp = meta?.msrpNonfoil ?? 29.99;
  const isUnreleased = !!product.releaseDate && new Date(product.releaseDate) > new Date();
  const changeSign = product.priceChangeWeek >= 0 ? '+' : '';
  const weekChange = `${changeSign}$${Math.abs(product.priceChangeWeek).toFixed(2)} · ${changeSign}${product.priceChangePct.toFixed(2)}%`;
  const sealedVsMsrp = product.currentMarketPrice - msrp;
  const cardVsMsrp = totalCardValue - msrp;

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
          <Pressable style={styles.navBtn} hitSlop={8} onPress={() => Share.share({ message: `Check out ${product.setName} on VaultMark`, url: `https://vaultmark-sealed.vercel.app` })}><Text style={styles.navBtnIcon}>↑</Text></Pressable>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#2a0a50', '#150520', Colors.bg]} style={styles.hero}>
          <View style={styles.heroContent}>
            {/* Secret Lair art placeholder */}
            <LinearGradient colors={['#4a1a80', '#1a0535', '#050108']} style={styles.artBox}>
              <Text style={styles.artSL}>SECRET</Text>
              <Text style={styles.artLair}>LAIR</Text>
              <View style={styles.artDrop}>
                <Text style={styles.artDropText}>DROP</Text>
              </View>
            </LinearGradient>

            <View style={styles.heroInfo}>
              {meta?.isSoldOut && (
                <View style={styles.soldOutBadge}>
                  <Text style={styles.soldOutText}>SOLD OUT</Text>
                </View>
              )}
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>SECRET LAIR</Text>
              </View>
              <Text style={styles.dropName}>{product.name}</Text>
              <Text style={styles.setName}>{product.setName}</Text>
              <Text style={styles.releaseDate}>
                {new Date(product.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              {meta && (
                <View style={styles.editionRow}>
                  {(meta.edition === 'nonfoil' || meta.edition === 'both') && meta.msrpNonfoil && (
                    <View style={styles.msrpTag}><Text style={styles.msrpText}>Nonfoil ${meta.msrpNonfoil}</Text></View>
                  )}
                  {(meta.edition === 'foil' || meta.edition === 'both') && meta.msrpFoil && (
                    <View style={[styles.msrpTag, styles.msrpFoil]}><Text style={[styles.msrpText, { color: Colors.gold }]}>✦ Foil ${meta.msrpFoil}</Text></View>
                  )}
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Value Summary */}
          <View>
            <View style={styles.sectionHead}><SectionHeader eyebrow="Market Data" title="Value Summary" /></View>
            <View style={styles.metricGrid}>
              <MetricTile label="Original MSRP" value={`$${msrp.toFixed(2)}`} sub="Nonfoil" />
              <MetricTile label="Current Sealed" value={product.currentMarketPrice > 0 ? `$${product.currentMarketPrice.toFixed(2)}` : 'N/A'}
                accent={product.currentMarketPrice > msrp ? Colors.success : Colors.danger} />
            </View>
            <View style={[styles.metricGrid, { marginTop: Spacing.sm }]}>
              <MetricTile label="Card Singles" value={`$${totalCardValue.toFixed(2)}`}
                accent={totalCardValue > msrp ? Colors.success : Colors.danger} />
              <MetricTile label="Singles vs MSRP"
                value={`${cardVsMsrp >= 0 ? '+' : ''}$${cardVsMsrp.toFixed(2)}`}
                accent={cardVsMsrp >= 0 ? Colors.success : Colors.danger}
                sub={cardVsMsrp >= 0 ? `${((cardVsMsrp / msrp) * 100).toFixed(0)}% above MSRP` : 'below MSRP'} />
            </View>
            <View style={[styles.metricGrid, { marginTop: Spacing.sm }]}>
              <MetricTile label="Sealed vs MSRP"
                value={`${sealedVsMsrp >= 0 ? '+' : ''}$${sealedVsMsrp.toFixed(2)}`}
                accent={sealedVsMsrp >= 0 ? Colors.success : Colors.danger} />
              <MetricTile label="Cards in Drop" value={String((product.includedCards ?? []).length)}
                sub={bonusCards.length > 0 ? `${bonusCards.length} bonus` : undefined} />
            </View>
          </View>

          {/* Included Cards */}
          {mainCards.length > 0 && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Drop Contents" title="Included Cards" /></View>
              <View style={styles.card}>
                {mainCards.map((card, i) => (
                  <IncludedCardRow key={card.name} card={card} isLast={i === mainCards.length - 1} />
                ))}
              </View>
            </View>
          )}

          {/* Bonus Cards */}
          {bonusCards.length > 0 && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Bonus Content" title="Bonus Card" /></View>
              <View style={styles.card}>
                {bonusCards.map((card, i) => (
                  <IncludedCardRow key={card.name} card={card} isLast={i === bonusCards.length - 1} />
                ))}
              </View>
            </View>
          )}

          {/* Investment Metrics */}
          {meta && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Analysis" title="Investment Metrics" /></View>
              <View style={styles.card}>
                <View style={styles.ratingSection}>
                  <RatingBar label="Collector Appeal" value={meta.collectorAppeal} />
                  <RatingBar label="Commander Playability" value={meta.commanderPlayability} />
                  <RatingBar label="Reprint Risk" value={meta.reprintRisk} invert />
                  <RatingBar label="Liquidity" value={meta.liquidity} />
                </View>
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
              <View style={styles.sectionHead}><SectionHeader eyebrow="Overall" title="Investment Score" /></View>
              <InvestmentScore
                score={product.investmentScore ?? 0}
                grade={(product.investmentScore ?? 0) >= 80 ? 'Excellent' : (product.investmentScore ?? 0) >= 65 ? 'Good' : 'Fair'}
                description="Based on card value vs MSRP, reprint risk, Commander playability, and aftermarket demand."
                bars={product.scoreBars}
              />
            </View>
          )}

          {/* Recommendation */}
          <View>
            <View style={styles.sectionHead}><SectionHeader eyebrow="Based on Current Data" title="Recommendation" /></View>
            {isUnreleased ? (
              <View style={styles.unreleased}><Text style={styles.unreleasedText}>Full analysis available after release — check back soon.</Text></View>
            ) : (
              <RecommendationCard
                signal={product.recommendation ?? 'HOLD'}
                rationale={product.recommendationRationale ?? ''}
                confidence={product.confidence ?? 60}
              />
            )}
          </View>

          {/* CTAs */}
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
  hero: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, paddingTop: Spacing.md },
  heroContent: { flexDirection: 'row', gap: Spacing.md },
  artBox: { width: 120, height: 160, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', gap: 2 },
  artSL: { fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  artLair: { fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.9)', letterSpacing: 3 },
  artDrop: { backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, marginTop: 4 },
  artDropText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  heroInfo: { flex: 1, gap: 6 },
  soldOutBadge: { alignSelf: 'flex-start', backgroundColor: Colors.dangerBg, borderWidth: 1, borderColor: Colors.danger, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  soldOutText: { fontSize: 9, fontWeight: '800', color: Colors.danger, letterSpacing: 0.8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(212,168,67,0.15)', borderWidth: 1, borderColor: Colors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  typeText: { fontSize: 9, fontWeight: '800', color: Colors.gold, letterSpacing: 0.8 },
  dropName: { fontSize: 15, fontWeight: '800', color: Colors.text1, letterSpacing: -0.4, lineHeight: 20 },
  setName: { fontSize: 12, color: Colors.text3, fontWeight: '500' },
  releaseDate: { fontSize: 11, color: Colors.text3 },
  editionRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  msrpTag: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  msrpFoil: { borderColor: Colors.gold },
  msrpText: { fontSize: 11, fontWeight: '700', color: Colors.text2 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  sectionHead: { marginBottom: 10 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  metricGrid: { flexDirection: 'row', gap: Spacing.sm },
  ratingSection: { padding: Spacing.lg, gap: Spacing.md },
  ctaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  ctaBtn: { flex: 1, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: { backgroundColor: Colors.accent },
  ctaOwned: { backgroundColor: Colors.success },
  ctaSecondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  ctaPrimaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  ctaSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.text2 },
  unreleased: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, alignItems: 'center' },
  unreleasedText: { fontSize: 13, color: Colors.text3 },
});
