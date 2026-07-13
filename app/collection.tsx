import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { CollectionItemCard } from '../components/CollectionItemCard';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { AddToCollectionModal } from '../components/AddToCollectionModal';
import { Colors, Spacing, Radius } from '../components/tokens';
import { PRODUCTS } from '../data/products';
import { useUserState } from '../data/userState';
import type { Condition, CollectionItem, Product } from '../data/types';

type SortKey = 'value' | 'pnl' | 'name' | 'date';

export default function CollectionScreen() {
  const router = useRouter();
  const { collection, removeFromCollection, updateCollectionItem } = useUserState();
  const [sort, setSort] = useState<SortKey>('value');
  const [editItem, setEditItem] = useState<{ item: CollectionItem; product: Product } | null>(null);

  const enriched = collection
    .map(item => ({ item, product: PRODUCTS.find(p => p.id === item.productId)! }))
    .filter(e => e.product != null);

  const sorted = [...enriched].sort((a, b) => {
    const aValue = a.product.currentMarketPrice * a.item.quantity;
    const bValue = b.product.currentMarketPrice * b.item.quantity;
    const aPnl = aValue - a.item.purchasePrice * a.item.quantity;
    const bPnl = bValue - b.item.purchasePrice * b.item.quantity;
    if (sort === 'value') return bValue - aValue;
    if (sort === 'pnl') return bPnl - aPnl;
    if (sort === 'name') return a.product.name.localeCompare(b.product.name);
    if (sort === 'date') return b.item.purchaseDate.localeCompare(a.item.purchaseDate);
    return 0;
  });

  const totalValue = enriched.reduce((s, e) => s + e.product.currentMarketPrice * e.item.quantity, 0);
  const totalInvested = enriched.reduce((s, e) => s + e.item.purchasePrice * e.item.quantity, 0);
  const totalPnl = totalValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const best = [...enriched].sort((a, b) => {
    const aPnlPct = ((a.product.currentMarketPrice - a.item.purchasePrice) / a.item.purchasePrice) * 100;
    const bPnlPct = ((b.product.currentMarketPrice - b.item.purchasePrice) / b.item.purchasePrice) * 100;
    return bPnlPct - aPnlPct;
  })[0];

  const worst = [...enriched].sort((a, b) => {
    const aPnlPct = ((a.product.currentMarketPrice - a.item.purchasePrice) / a.item.purchasePrice) * 100;
    const bPnlPct = ((b.product.currentMarketPrice - b.item.purchasePrice) / b.item.purchasePrice) * 100;
    return aPnlPct - bPnlPct;
  })[0];

  function handleUpdateItem(qty: number, price: number, date: string, condition: Condition, notes: string) {
    if (!editItem) return;
    updateCollectionItem(editItem.item.id, { quantity: qty, purchasePrice: price, purchaseDate: date, condition, notes });
    setEditItem(null);
  }

  if (collection.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
        <View style={styles.header}>
          <Text style={styles.title}>Collection</Text>
          <Pressable onPress={() => router.push('/add-product')} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
        <EmptyState
          icon="◈"
          title="Your Collection is Empty"
          subtitle="Start adding sealed products you own to track their value and performance."
          ctaLabel="Add Your First Product"
          onCta={() => router.push('/add-product')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>Collection</Text>
        <Pressable onPress={() => router.push('/add-product')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={e => e.item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <>
            {/* Summary */}
            <LinearGradient colors={['#1a0840', '#0d0420', Colors.bg]} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Collection Value</Text>
              <Text style={styles.summaryValue}>${totalValue.toFixed(2)}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Invested</Text>
                  <Text style={styles.summaryStatValue}>${totalInvested.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Gain/Loss</Text>
                  <Text style={[styles.summaryStatValue, totalPnl >= 0 ? styles.textUp : styles.textDown]}>
                    {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryStatLabel}>Products</Text>
                  <Text style={styles.summaryStatValue}>{collection.length}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Best/Worst */}
            {enriched.length >= 2 && (
              <View style={styles.performers}>
                {[
                  { label: '▲ Best', item: best?.item, product: best?.product, accent: Colors.success },
                  { label: '▼ Worst', item: worst?.item, product: worst?.product, accent: Colors.danger },
                ].map(({ label, item, product, accent }) => item && product ? (
                  <View key={label} style={styles.performerCard}>
                    <Text style={[styles.performerBadge, { color: accent }]}>{label}</Text>
                    <Text style={styles.performerName} numberOfLines={1}>{product.name}</Text>
                    <Text style={[styles.performerPct, { color: accent }]}>
                      {(() => { const p = ((product.currentMarketPrice - item.purchasePrice) / item.purchasePrice) * 100; return `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`; })()}
                    </Text>
                  </View>
                ) : null)}
              </View>
            )}

            {/* Sort */}
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              {(['value', 'pnl', 'name', 'date'] as SortKey[]).map(k => (
                <Pressable key={k} onPress={() => setSort(k)} style={[styles.sortChip, sort === k && styles.sortChipActive]}>
                  <Text style={[styles.sortChipText, sort === k && styles.sortChipTextActive]}>
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

      <AddToCollectionModal
        visible={editItem !== null}
        product={editItem?.product ?? null}
        onClose={() => setEditItem(null)}
        onSave={handleUpdateItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text1, letterSpacing: -1 },
  addBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: Radius.lg },
  addBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl, gap: 0 },
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
});
