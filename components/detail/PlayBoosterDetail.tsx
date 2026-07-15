import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, Share,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ProductHero } from '../ProductHero';
import { InvestmentScore } from '../InvestmentScore';
import { PriceChart } from '../PriceChart';
import { TopHitCard } from '../TopHitCard';
import { ValueBreakdown } from '../ValueBreakdown';
import { RecommendationCard } from '../RecommendationCard';
import { SectionHeader } from '../SectionHeader';
import { AddToCollectionModal } from '../AddToCollectionModal';
import { AddToWatchlistModal } from '../AddToWatchlistModal';
import { Colors, Spacing, Radius } from '../tokens';
import { useUserState } from '../../data/userState';
import { useProductArt } from '../../data/scryfall';
import { useSetEV } from '../../data/useSetEV';
import type { Product, Condition } from '../../data/types';

const TABS = ['Overview', 'Play Booster Hits', 'EV Breakdown', 'Price History'] as const;
type Tab = typeof TABS[number];

interface Props { product: Product }

export function PlayBoosterDetail({ product }: Props) {
  const router = useRouter();
  const { addToCollection, addToWatchlist, isInCollection, isInWatchlist } = useUserState();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const inCollection = isInCollection(product.id);
  const inWatchlist = isInWatchlist(product.id);
  const isCase = product.productType === 'play-booster-case';
  const CASE_MULTIPLIER = isCase ? 6 : 1;
  const { loading: evLoading, evData } = useSetEV(product.setCode);

  // Prefer live Scryfall-computed data; fall back to static data in products.ts
  const boxEV = evData?.expectedValue ?? product.expectedValue ?? 0;
  const liveEV = boxEV * CASE_MULTIPLIER;
  const liveSegments = (evData?.evSegments ?? product.evSegments)?.map(s =>
    isCase
      ? { ...s, amount: `$${(parseFloat(s.amount.replace('$', '')) * 6).toFixed(2)}` }
      : s,
  );
  const liveHits = evData?.topHits ?? product.playBoosterHits;
  const isLive = !!evData;

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

  const showOverview = activeTab === 'Overview';
  const showHits = activeTab === 'Play Booster Hits';
  const showEV = activeTab === 'EV Breakdown';
  const showPrice = activeTab === 'Price History';

  const setLines = product.setName.split(':');
  const title = setLines.length > 1 ? `${setLines[0]}:\n${setLines[1].trim()}` : product.setName;
  const heroImageUrl = useProductArt(product.setCode, product.playBoosterHits?.[0]?.name) ?? undefined;

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
        <ProductHero
          setCode={product.setCode}
          year={product.releaseDate.split('-')[0]}
          title={title}
          subtitle={isCase ? 'Play Booster Case (6 Boxes)' : 'Play Booster Box'}
          releaseDate={`Released ${new Date(product.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          heroImageUrl={heroImageUrl}
          metrics={[
            { label: 'Market Price', value: product.currentMarketPrice > 0 ? `$${product.currentMarketPrice.toFixed(2)}` : 'N/A', sub: product.currentMarketPrice > 0 ? `${product.priceChangePct >= 0 ? '+' : ''}${product.priceChangePct.toFixed(2)}% · 7d` : 'No price data' },
            { label: isCase ? 'Case EV' : 'Expected EV', value: evLoading ? '…' : `$${liveEV.toFixed(2)}`, sub: evLoading ? 'Loading…' : product.currentMarketPrice > 0 ? `${((liveEV / product.currentMarketPrice) * 100).toFixed(1)}% of price` : '' },
            { label: 'Investment Score', value: String(product.investmentScore ?? 0), sub: product.investmentScore! >= 80 ? 'EXCELLENT' : product.investmentScore! >= 65 ? 'GOOD' : 'FAIR', isScore: true, score: product.investmentScore ?? 0 },
          ]}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            {TABS.map(tab => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tab}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.content}>
          {(showOverview || showEV) && product.packContents && (
            <View>
              <View style={styles.sectionHead}>
                <SectionHeader eyebrow="Product Details" title={isCase ? 'Case Overview' : 'Box Overview'} />
              </View>
              <View style={styles.card}>
                <Text style={styles.boxDesc}>
                  {isCase
                    ? `Each Play Booster Case contains 6 Play Booster Boxes (${product.packContents.packsPerBox * 6} packs total). Each Play Booster includes ${product.packContents.cardsPerPack} Magic cards.`
                    : (product.packContents.description ?? `Each Play Booster Box contains ${product.packContents.packsPerBox} Play Boosters. Each Play Booster includes ${product.packContents.cardsPerPack} Magic cards.`)}
                </Text>
                <View style={styles.boxStats}>
                  {isCase
                    ? [
                        { val: '6', lbl: 'Boxes\nper Case' },
                        { val: String(product.packContents.packsPerBox * 6), lbl: 'Total\nPacks' },
                        { val: product.packContents.raresPerPack, lbl: 'Rares or higher\nper Pack' },
                        { val: product.packContents.foilRate, lbl: 'Foil in\nof Packs' },
                      ].map((s, i, arr) => (
                        <View key={s.lbl} style={[styles.bsCell, i < arr.length - 1 && styles.bsCellBorder]}>
                          <Text style={styles.bsVal}>{s.val}</Text>
                          <Text style={styles.bsLbl}>{s.lbl}</Text>
                        </View>
                      ))
                    : [
                        { val: String(product.packContents.packsPerBox), lbl: 'Packs\nper Box' },
                        { val: String(product.packContents.cardsPerPack), lbl: 'Cards\nper Pack' },
                        { val: product.packContents.raresPerPack, lbl: 'Rares or higher\nper Pack' },
                        { val: product.packContents.foilRate, lbl: 'Foil in\nof Packs' },
                      ].map((s, i, arr) => (
                        <View key={s.lbl} style={[styles.bsCell, i < arr.length - 1 && styles.bsCellBorder]}>
                          <Text style={styles.bsVal}>{s.val}</Text>
                          <Text style={styles.bsLbl}>{s.lbl}</Text>
                        </View>
                      ))}
                </View>
              </View>
            </View>
          )}

          {(showOverview || showEV) && (liveSegments || evLoading) && (
            <View>
              <View style={styles.sectionHead}>
                <SectionHeader eyebrow={isCase ? 'Per Case Opening (6 Boxes)' : 'Per Box Opening'} title="Expected Value Breakdown" />
                {isLive && <Text style={styles.liveBadge}>LIVE</Text>}
              </View>
              {evLoading && !liveSegments
                ? <View style={styles.loadingBox}><Text style={styles.loadingText}>Computing EV from live card prices…</Text></View>
                : liveSegments && <ValueBreakdown totalEV={`$${(liveEV ?? 0).toFixed(2)}`} segments={liveSegments} />}
            </View>
          )}

          {(showOverview || showHits) && (liveHits || evLoading) && (
            <View>
              {isLive && (
                <View style={styles.liveRow}>
                  <Text style={styles.liveBadge}>LIVE</Text>
                  {evData?.lastUpdated && <Text style={styles.liveDate}>Updated {evData.lastUpdated}</Text>}
                </View>
              )}
              {evLoading && !liveHits
                ? <View style={styles.loadingBox}><Text style={styles.loadingText}>Fetching booster hit data…</Text></View>
                : liveHits && (
                  <TopHitCard
                    hits={liveHits}
                    totalCount={liveHits.length}
                    packsTotal={isCase ? (product.packContents?.packsPerBox ?? 36) * 6 : (product.packContents?.packsPerBox ?? 36)}
                    label={isCase ? 'Play Booster Case Hits' : 'Play Booster Hits'}
                  />
                )}
            </View>
          )}

          {(showOverview || showPrice) && product.priceHistory.length > 0 && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="30-Day Trend" title="Price History" /></View>
              <PriceChart currentPrice={`$${product.currentMarketPrice.toFixed(2)}`} weekChange={weekChange} priceHistory={product.priceHistory} />
            </View>
          )}

          {showOverview && product.scoreBars && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Analysis" title="Investment Score" /></View>
              <InvestmentScore
                score={product.investmentScore ?? 0}
                grade={product.investmentScore! >= 80 ? 'Excellent' : product.investmentScore! >= 65 ? 'Good' : 'Fair'}
                description="Based on EV ratio, price momentum, liquidity, and current supply levels."
                bars={product.scoreBars}
              />
            </View>
          )}

          {showOverview && (
            <View>
              <View style={styles.sectionHead}><SectionHeader eyebrow="Based on Current Pricing" title="Recommendation" /></View>
              <RecommendationCard
                signal={product.recommendation ?? 'HOLD'}
                rationale={product.recommendationRationale ?? ''}
                confidence={product.confidence ?? 60}
              />
            </View>
          )}

          {/* CTAs */}
          <View style={styles.ctaRow}>
            <Pressable
              onPress={() => setShowCollectionModal(true)}
              style={[styles.ctaBtn, styles.ctaPrimary, inCollection && styles.ctaOwned]}
            >
              <Text style={styles.ctaPrimaryText}>{inCollection ? '✓ In Collection' : '+ Add to Collection'}</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowWatchlistModal(true)}
              style={[styles.ctaBtn, styles.ctaSecondary]}
            >
              <Text style={styles.ctaSecondaryText}>{inWatchlist ? '♥ Watching' : '♡ Watchlist'}</Text>
            </Pressable>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <AddToCollectionModal
        visible={showCollectionModal}
        product={product}
        onClose={() => setShowCollectionModal(false)}
        onSave={handleAddToCollection}
      />
      <AddToWatchlistModal
        visible={showWatchlistModal}
        product={product}
        onClose={() => setShowWatchlistModal(false)}
        onSave={handleAddToWatchlist}
      />
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
  tabsScroll: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg },
  tab: { paddingVertical: 12, paddingHorizontal: Spacing.md, position: 'relative' },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.text3, letterSpacing: -0.1 },
  tabTextActive: { color: Colors.text1 },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: Colors.accent, borderRadius: 2 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.md },
  sectionHead: { marginBottom: 10 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  boxDesc: { fontSize: 13, color: Colors.text2, lineHeight: 19, padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  boxStats: { flexDirection: 'row' },
  bsCell: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  bsCellBorder: { borderRightWidth: 1, borderRightColor: Colors.border2 },
  bsVal: { fontSize: 15, fontWeight: '800', color: Colors.text1, letterSpacing: -0.4, fontVariant: ['tabular-nums'], lineHeight: 18 },
  bsLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, color: Colors.text3, textAlign: 'center', marginTop: 3, lineHeight: 12 },
  ctaRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  ctaBtn: { flex: 1, height: 48, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: { backgroundColor: Colors.accent },
  ctaOwned: { backgroundColor: Colors.success },
  ctaSecondary: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  ctaPrimaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  ctaSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.text2 },
  liveBadge: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, color: Colors.success, borderWidth: 1, borderColor: Colors.success, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  liveDate: { fontSize: 10, color: Colors.text3 },
  loadingBox: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, alignItems: 'center' },
  loadingText: { fontSize: 13, color: Colors.text3 },
});
