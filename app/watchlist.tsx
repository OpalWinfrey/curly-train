import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

import { WatchlistItemCard } from '../components/WatchlistItemCard';
import { EmptyState } from '../components/EmptyState';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { Colors, Spacing, Radius } from '../components/tokens';
import { useUserState } from '../data/userState';
import type { Condition, WatchlistItem, Product } from '../data/types';

export default function WatchlistScreen() {
  const router = useRouter();
  const { products, watchlist, removeFromWatchlist, moveWatchlistToCollection } = useUserState();
  const [purchaseItem, setPurchaseItem] = useState<{ wItem: WatchlistItem; product: Product } | null>(null);

  const enriched = watchlist
    .map(wItem => ({ wItem, product: products.find(p => p.id === wItem.productId) }))
    .filter((e): e is { wItem: typeof e.wItem; product: NonNullable<typeof e.product> } => e.product != null);

  const atTarget = enriched.filter(e => e.product.currentMarketPrice <= e.wItem.targetPrice);
  const aboveTarget = enriched.filter(e => e.product.currentMarketPrice > e.wItem.targetPrice);

  function handleMarkPurchased(qty: number, price: number, date: string, condition: Condition, notes: string) {
    if (!purchaseItem) return;
    moveWatchlistToCollection(purchaseItem.wItem.id, price, qty, date, notes);
    setPurchaseItem(null);
  }

  if (watchlist.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={styles.header}>
          <Text style={styles.title}>Watchlist</Text>
          <Pressable onPress={() => router.push('/add-product')} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
        <EmptyState
          icon="◎"
          title="Your Watchlist is Empty"
          subtitle="Start watching products to track their prices and get notified when they hit your target."
          ctaLabel="Browse Products"
          onCta={() => router.push('/discover')}
        />
      </SafeAreaView>
    );
  }

  const allItems = [
    ...atTarget.map(e => ({ ...e, section: 'at-target' as const })),
    ...aboveTarget.map(e => ({ ...e, section: 'above-target' as const })),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Watchlist</Text>
          <Text style={styles.subtitle}>{watchlist.length} product{watchlist.length !== 1 ? 's' : ''} · {atTarget.length} at target</Text>
        </View>
        <Pressable onPress={() => router.push('/add-product')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={allItems}
        keyExtractor={e => e.wItem.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          atTarget.length > 0 ? (
            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>✓ {atTarget.length} product{atTarget.length !== 1 ? 's are' : ' is'} at or below your target price</Text>
            </View>
          ) : null
        }
        renderItem={({ item: e }) => (
          <WatchlistItemCard
            item={e.wItem}
            product={e.product}
            onPress={() => router.push(`/product/${e.product.id}`)}
            onRemove={() => removeFromWatchlist(e.wItem.id)}
            onMarkPurchased={() => setPurchaseItem({ wItem: e.wItem, product: e.product })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      <AddToCollectionModal
        visible={purchaseItem !== null}
        product={purchaseItem?.product ?? null}
        onClose={() => setPurchaseItem(null)}
        onSave={handleMarkPurchased}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text1, letterSpacing: -1 },
  subtitle: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  addBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.lg },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl, gap: 0 },
  alertBanner: {
    backgroundColor: Colors.successBg,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  alertText: { fontSize: 13, fontWeight: '700', color: Colors.success },
});
