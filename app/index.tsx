import React from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { Colors, Spacing, Radius } from '../components/tokens';
import { useUserState } from '../data/userState';

export default function HomeScreen() {
  const router = useRouter();
  const { products, collection, watchlist, recentlyViewed, isInWatchlist, addToWatchlist, removeFromWatchlist, getWatchlistItem } = useUserState();

  const totalValue = collection.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.currentMarketPrice * item.quantity : 0);
  }, 0);

  const totalInvested = collection.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
  const unrealizedGain = totalValue - totalInvested;
  const hasCollection = collection.length > 0;

  const recentProducts = recentlyViewed
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as typeof products;

  const newReleaseProducts = [...products]
    .filter(p => p.releaseDate)
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
    .slice(0, 3);

  const featuredProduct = [...products]
    .filter(p => p.productType === 'play-booster-box')
    .sort((a, b) => b.currentMarketPrice - a.currentMarketPrice)[0];

  const watchlistProducts = watchlist
    .map(w => products.find(p => p.id === w.productId))
    .filter(Boolean) as typeof products;

  function toggleWatchlist(productId: string) {
    const wItem = getWatchlistItem(productId);
    if (wItem) {
      removeFromWatchlist(wItem.id);
    } else {
      const product = products.find(p => p.id === productId);
      if (product) {
        addToWatchlist({ productId, targetPrice: product.currentMarketPrice, dateAdded: new Date().toISOString().split('T')[0] });
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 10, color: Colors.accent, fontWeight: '800' }}>VM</Text>
          </View>
          <Text style={styles.brandName}>VAULT<Text style={styles.brandAccent}>MARK</Text></Text>
        </View>
        <Pressable style={styles.bellBtn}>
          <Text style={styles.bellIcon}>◌</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <Pressable onPress={() => router.push('/discover')} style={styles.searchTouchable}>
          <SearchBar value="" onChangeText={() => {}} editable={false} />
        </Pressable>

        {/* Portfolio Summary */}
        <LinearGradient colors={['#1a0840', '#0d0420', Colors.bg]} style={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            {hasCollection && (
              <View style={[styles.gainPill, unrealizedGain >= 0 ? styles.pillUp : styles.pillDown]}>
                <Text style={[styles.gainText, unrealizedGain >= 0 ? styles.textUp : styles.textDown]}>
                  {unrealizedGain >= 0 ? '▲' : '▼'} ${Math.abs(unrealizedGain).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.portfolioValue}>${totalValue.toFixed(2)}</Text>
          {hasCollection ? (
            <View style={styles.portfolioMeta}>
              <Text style={styles.portfolioMetaText}>${totalInvested.toFixed(2)} invested · {collection.length} product{collection.length !== 1 ? 's' : ''}</Text>
            </View>
          ) : (
            <Text style={styles.portfolioEmpty}>Add products to track your collection value</Text>
          )}
        </LinearGradient>

        {/* Watchlist Opportunities */}
        {watchlistProducts.length > 0 && (
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Price Alerts" title="Watchlist" onAction={() => router.push('/watchlist')} action="See All" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {watchlistProducts.slice(0, 3).map(product => {
                const wItem = watchlist.find(w => w.productId === product.id);
                const atTarget = wItem ? product.currentMarketPrice <= wItem.targetPrice : false;
                return (
                  <Pressable key={product.id} onPress={() => router.push(`/product/${product.id}`)} style={styles.watchChip}>
                    <Text style={styles.watchChipName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.watchChipPrice}>${product.currentMarketPrice.toFixed(2)}</Text>
                    {atTarget && <Text style={styles.watchChipAt}>✓ At Target</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Recently Viewed */}
        {recentProducts.length > 0 && (
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Continue Browsing" title="Recently Viewed" />
            </View>
            <View style={styles.productList}>
              {recentProducts.slice(0, 3).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onWatchlist={() => toggleWatchlist(product.id)}
                  isWatchlisted={isInWatchlist(product.id)}
                  compact
                />
              ))}
            </View>
          </View>
        )}

        {/* New Releases */}
        <View>
          <View style={styles.sectionHead}>
            <SectionHeader eyebrow="Just Released" title="New Releases" onAction={() => router.push('/discover')} action="Browse All" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {newReleaseProducts.map(product => (
              <Pressable key={product.id} onPress={() => router.push(`/product/${product.id}`)} style={styles.releaseCard}>
                <LinearGradient
                  colors={product.productType === 'secret-lair' ? ['#4a1a80', '#1a0535'] : product.productType === 'collector-booster-box' ? ['#3a1a6a', '#0d061a'] : ['#1a3a6a', '#060d1a']}
                  style={styles.releaseArt}
                >
                  <Text style={styles.releaseCode}>{product.setCode}</Text>
                </LinearGradient>
                <View style={styles.releaseInfo}>
                  <Text style={styles.releaseName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.releasePrice}>${product.currentMarketPrice.toFixed(2)}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable onPress={() => router.push('/add-product')} style={styles.qaBtn}>
            <Text style={styles.qaIcon}>+</Text>
            <Text style={styles.qaLabel}>Add Product</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/discover')} style={styles.qaBtn}>
            <Text style={styles.qaIcon}>⌕</Text>
            <Text style={styles.qaLabel}>Browse Sets</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/collection')} style={styles.qaBtn}>
            <Text style={styles.qaIcon}>◈</Text>
            <Text style={styles.qaLabel}>Collection</Text>
          </Pressable>
        </View>

        {/* Featured Product */}
        {featuredProduct && (
          <View>
            <View style={styles.sectionHead}>
              <SectionHeader eyebrow="Featured Analysis" title="Trending Now" />
            </View>
            <ProductCard
              product={featuredProduct}
              onPress={() => router.push(`/product/${featuredProduct.id}`)}
              onWatchlist={() => toggleWatchlist(featuredProduct.id)}
              isWatchlisted={isInWatchlist(featuredProduct.id)}
            />
            <Pressable onPress={() => router.push(`/product/${featuredProduct.id}`)} style={styles.viewAnalysisBtn}>
              <Text style={styles.viewAnalysisText}>View Full Analysis →</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandIcon: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
  brandAccent: { color: Colors.accent },
  bellBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  bellIcon: { fontSize: 16, color: Colors.text3 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxl },

  searchTouchable: {},

  portfolioCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    padding: Spacing.xl,
    gap: 4,
  },
  portfolioHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  portfolioLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, flex: 1 },
  gainPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  pillUp: { backgroundColor: Colors.successBg },
  pillDown: { backgroundColor: Colors.dangerBg },
  gainText: { fontSize: 11, fontWeight: '700' },
  textUp: { color: Colors.success },
  textDown: { color: Colors.danger },
  portfolioValue: { fontSize: 36, fontWeight: '800', color: Colors.text1, letterSpacing: -1.5, fontVariant: ['tabular-nums'], lineHeight: 40 },
  portfolioMeta: {},
  portfolioMetaText: { fontSize: 12, color: Colors.text3 },
  portfolioEmpty: { fontSize: 12, color: Colors.text3, fontStyle: 'italic' },

  sectionHead: { marginBottom: -Spacing.sm },

  horizontalList: { gap: Spacing.md, paddingVertical: 2 },
  watchChip: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    minWidth: 140,
    maxWidth: 180,
  },
  watchChipName: { fontSize: 12, fontWeight: '700', color: Colors.text1, marginBottom: 4 },
  watchChipPrice: { fontSize: 16, fontWeight: '800', color: Colors.text1, fontVariant: ['tabular-nums'] },
  watchChipAt: { fontSize: 10, fontWeight: '700', color: Colors.success, marginTop: 2 },

  productList: { gap: Spacing.sm },

  releaseCard: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  releaseArt: { height: 90, alignItems: 'center', justifyContent: 'center' },
  releaseCode: { fontSize: 16, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  releaseInfo: { padding: Spacing.md, gap: 4 },
  releaseName: { fontSize: 12, fontWeight: '700', color: Colors.text1, lineHeight: 16 },
  releasePrice: { fontSize: 13, fontWeight: '800', color: Colors.accent, fontVariant: ['tabular-nums'] },

  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  qaBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  qaIcon: { fontSize: 20, color: Colors.accent },
  qaLabel: { fontSize: 10, fontWeight: '700', color: Colors.text3, textAlign: 'center', letterSpacing: 0.3 },

  viewAnalysisBtn: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: Radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAnalysisText: { fontSize: 13, fontWeight: '700', color: Colors.accent },
});
