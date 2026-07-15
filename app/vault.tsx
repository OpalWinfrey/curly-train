import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  StatusBar, FlatList, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { CollectionItemCard } from '../components/CollectionItemCard';
import { WatchlistItemCard } from '../components/WatchlistItemCard';
import { EmptyState } from '../components/EmptyState';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { Colors, Spacing, Radius } from '../components/tokens';
import { PRODUCTS } from '../data/products';
import { useUserState } from '../data/userState';
import type { Condition, CollectionItem, WatchlistItem, Product } from '../data/types';

type Segment = 'owned' | 'watching';
type SortKey = 'value' | 'pnl' | 'name' | 'date';

export default function VaultScreen() {
  const router = useRouter();
  const { collection, watchlist, removeFromCollection, updateCollectionItem, removeFromWatchlist, moveWatchlistToCollection, isLoading } = useUserState();
  const [segment, setSegment] = useState<Segment>('owned');
  const [sort, setSort] = useState<SortKey>('value');
  const [editItem, setEditItem] = useState<{ item: CollectionItem; product: Product } | null>(null);
  const [purchaseItem, setPurchaseItem] = useState<{ wItem: WatchlistItem; product: Product } | null>(null);

  // — Collection logic —
  const enrichedCollection = collection
    .map(item => ({ item, product: PRODUCTS.find(p => p.id === item.productId)! }))
    .filter(e => e.product != null);

  const sortedCollection = [...enrichedCollection].sort((a, b) => {
    const aVal = a.product.currentMarketPrice * a.item.quantity;
    const bVal = b.product.currentMarketPrice * b.item.quantity;
    const aPnl = aVal - a.item.purchasePrice * a.item.quantity;
    const bPnl = bVal - b.item.purchasePrice * b.item.quantity;
    if (sort === 'value') return bVal - aVal;
    if (sort === 'pnl') return bPnl - aPnl;
    if (sort === 'name') return a.product.name.localeCompare(b.product.name);
    if (sort === 'date') return b.item.purchaseDate.localeCompare(a.item.purchaseDate);
    return 0;
  });

  const totalValue = enrichedCollection.reduce((s, e) => s + e.product.currentMarketPrice * e.item.quantity, 0);
  const totalInvested = enrichedCollection.reduce((s, e) => s + e.item.purchasePrice * e.item.quantity, 0);
  const totalPnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const sortedByPct = [...enrichedCollection].sort((a, b) => {
    const ap = ((a.product.currentMarketPrice - a.item.purchasePrice) / a.item.purchasePrice) * 100;
    const bp = ((b.product.currentMarketPrice - b.item.purchasePrice) / b.item.purchasePrice) * 100;
    return bp - ap;
  });
  const best = sortedByPct[0];
  const worst = sortedByPct[sortedByPct.length - 1];

  // — Watchlist logic —
  const enrichedWatchlist = watchlist
    .map(wItem => ({ wItem, product: PRODUCTS.find(p => p.id === wItem.productId)! }))
    .filter(e => e.product != null);
  const atTarget = enrichedWatchlist.filter(e => e.product.currentMarketPrice <= e.wItem.targetPrice);
  const aboveTarget = enrichedWatchlist.filter(e => e.product.currentMarketPrice > e.wItem.targetPrice);
  const allWatchlist = [
    ...atTarget.map(e => ({ ...e, atTarget: true })),
    ...aboveTarget.map(e => ({ ...e, atTarget: false })),
  ];

  function handleUpdateItem(qty: number, price: number, date: string, condition: Condition, notes: string) {
    if (!editItem) return;
    updateCollectionItem(editItem.item.id, { quantity: qty, purchasePrice: price, purchaseDate: date, condition, notes });
    setEditItem(null);
  }

  function handleMarkPurchased(qty: number, price: number, date: string, _condition: Condition, notes: string) {
    if (!purchaseItem) return;
    moveWatchlistToCollection(purchaseItem.wItem.id, price, qty, date, notes);
    setPurchaseItem(null);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={s.loadingWrap}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>My Vault</Text>
        <Pressable onPress={() => router.push('/add-product')} style={s.addBtn}>
          <Text style={s.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Segment Toggle */}
      <View style={s.segmentWrap}>
        <Pressable
          style={[s.seg, segment === 'owned' && s.segActive]}
          onPress={() => setSegment('owned')}
        >
          <Text style={[s.segText, segment === 'owned' && s.segTextActive]}>
            Owned{collection.length > 0 ? ` (${collection.length})` : ''}
          </Text>
        </Pressable>
        <Pressable
          style={[s.seg, segment === 'watching' && s.segActive]}
          onPress={() => setSegment('watching')}
        >
          <Text style={[s.segText, segment === 'watching' && s.segTextActive]}>
            Watching{watchlist.length > 0 ? ` (${watchlist.length})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Owned Tab */}
      {segment === 'owned' && (
        collection.length === 0 ? (
          <EmptyState
            icon="◈"
            title="Your Collection is Empty"
            subtitle="Start adding sealed products you own to track their value and performance."
            ctaLabel="Add Your First Product"
            onCta={() => router.push('/add-product')}
          />
        ) : (
          <FlatList
            data={sortedCollection}
            keyExtractor={e => e.item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.list}
            ListHeaderComponent={() => (
              <>
                <LinearGradient colors={['#1a0840', '#0d0420', Colors.bg]} style={s.summaryCard}>
                  <Text style={s.summaryLabel}>Total Collection Value</Text>
                  <Text style={s.summaryValue}>${totalValue.toFixed(2)}</Text>
                  <View style={s.summaryRow}>
                    <View style={s.summaryStat}>
                      <Text style={s.summaryStatLabel}>Invested</Text>
                      <Text style={s.summaryStatValue}>${totalInvested.toFixed(2)}</Text>
                    </View>
                    <View style={s.summaryStat}>
                      <Text style={s.summaryStatLabel}>Gain/Loss</Text>
                      <Text style={[s.summaryStatValue, totalPnl >= 0 ? s.textUp : s.textDown]}>
                        {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                      </Text>
                    </View>
                    <View style={s.summaryStat}>
                      <Text style={s.summaryStatLabel}>Products</Text>
                      <Text style={s.summaryStatValue}>{collection.length}</Text>
                    </View>
                  </View>
                </LinearGradient>

                {enrichedCollection.length >= 2 && (
                  <View style={s.performers}>
                    {[
                      { label: '▲ Best', e: best, accent: Colors.success },
                      { label: '▼ Worst', e: worst, accent: Colors.danger },
                    ].map(({ label, e, accent }) => e ? (
                      <View key={label} style={s.performerCard}>
                        <Text style={[s.performerBadge, { color: accent }]}>{label}</Text>
                        <Text style={s.performerName} numberOfLines={1}>{e.product.name}</Text>
                        <Text style={[s.performerPct, { color: accent }]}>
                          {(() => { const p = ((e.product.currentMarketPrice - e.item.purchasePrice) / e.item.purchasePrice) * 100; return `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`; })()}
                        </Text>
                      </View>
                    ) : null)}
                  </View>
                )}

                <View style={s.sortRow}>
                  <Text style={s.sortLabel}>Sort:</Text>
                  {(['value', 'pnl', 'name', 'date'] as SortKey[]).map(k => (
                    <Pressable key={k} onPress={() => setSort(k)} style={[s.sortChip, sort === k && s.sortChipActive]}>
                      <Text style={[s.sortChipText, sort === k && s.sortChipTextActive]}>
                        {k === 'value' ? 'Value' : k === 'pnl' ? 'P&L' : k === 'name' ? 'Name' : 'Date'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            renderItem={({ item: e }) => (
              <CollectionItemCard
                item={e.item}
                product={e.product}
                onPress={() => setEditItem(e)}
                onRemove={() => removeFromCollection(e.item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          />
        )
      )}

      {/* Watching Tab */}
      {segment === 'watching' && (
        watchlist.length === 0 ? (
          <EmptyState
            icon="◎"
            title="Your Watchlist is Empty"
            subtitle="Watch products to track their prices and buy when they hit your target."
            ctaLabel="Browse Products"
            onCta={() => router.push('/discover')}
          />
        ) : (
          <FlatList
            data={allWatchlist}
            keyExtractor={e => e.wItem.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.list}
            ListHeaderComponent={
              atTarget.length > 0 ? (
                <View style={s.alertBanner}>
                  <Text style={s.alertText}>✓ {atTarget.length} product{atTarget.length !== 1 ? 's are' : ' is'} at or below your target price</Text>
                </View>
              ) : undefined
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
        )
      )}

      <AddToCollectionModal
        visible={editItem !== null}
        product={editItem?.product ?? null}
        onClose={() => setEditItem(null)}
        onSave={handleUpdateItem}
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text1, letterSpacing: -1 },
  addBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.lg },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  segmentWrap: { flexDirection: 'row', marginHorizontal: Spacing.xl, marginBottom: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 4 },
  seg: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.md - 2 },
  segActive: { backgroundColor: Colors.accent },
  segText: { fontSize: 13, fontWeight: '700', color: Colors.text3 },
  segTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  summaryCard: { borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', padding: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.lg },
  summaryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3 },
  summaryValue: { fontSize: 36, fontWeight: '800', color: Colors.text1, letterSpacing: -1.5, fontVariant: ['tabular-nums'], lineHeight: 40 },
  summaryRow: { flexDirection: 'row', gap: Spacing.md },
  summaryStat: { flex: 1 },
  summaryStatLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.text3, marginBottom: 3 },
  summaryStatValue: { fontSize: 13, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'] },
  textUp: { color: Colors.success },
  textDown: { color: Colors.danger },
  performers: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  performerCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: 3 },
  performerBadge: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  performerName: { fontSize: 12, fontWeight: '700', color: Colors.text1 },
  performerPct: { fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md, flexWrap: 'wrap' },
  sortLabel: { fontSize: 11, color: Colors.text3, fontWeight: '600' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sortChipActive: { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: Colors.accent },
  sortChipText: { fontSize: 11, fontWeight: '600', color: Colors.text3 },
  sortChipTextActive: { color: Colors.accent },
  alertBanner: { backgroundColor: Colors.successBg, borderWidth: 1, borderColor: Colors.success, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  alertText: { fontSize: 13, fontWeight: '700', color: Colors.success },
});
