import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import type { WatchlistItem, Product } from '../data/types';

interface Props {
  item: WatchlistItem;
  product: Product;
  onPress: () => void;
  onRemove: () => void;
  onMarkPurchased: () => void;
}

export function WatchlistItemCard({ item, product, onPress, onRemove, onMarkPurchased }: Props) {
  const current = product.currentMarketPrice;
  const target = item.targetPrice;
  const diff = current - target;
  const diffPct = target > 0 ? (diff / target) * 100 : 0;
  const atOrBelowTarget = current <= target;
  const nearTarget = !atOrBelowTarget && diffPct <= 10;

  const statusColor = atOrBelowTarget ? Colors.success : nearTarget ? Colors.warning : Colors.danger;
  const statusBg = atOrBelowTarget ? Colors.successBg : nearTarget ? Colors.warnBg : Colors.dangerBg;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.setName}>{product.setName}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.currentPrice}>${current.toFixed(2)}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {atOrBelowTarget ? '✓ At Target' : `${diffPct.toFixed(1)}% above`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TARGET</Text>
          <Text style={styles.statValue}>${target.toFixed(2)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DIFFERENCE</Text>
          <Text style={[styles.statValue, { color: atOrBelowTarget ? Colors.success : Colors.danger }]}>
            {diff >= 0 ? '+' : ''}${diff.toFixed(2)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TYPE</Text>
          <Text style={styles.statValue} numberOfLines={1}>{product.productType.replace(/-/g, ' ')}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onMarkPurchased} style={styles.buyBtn}>
          <Text style={styles.buyBtnText}>Mark as Purchased</Text>
        </Pressable>
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  nameCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.text1, letterSpacing: -0.3, lineHeight: 18 },
  setName: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  priceCol: { alignItems: 'flex-end', gap: 4 },
  currentPrice: { fontSize: 18, fontWeight: '800', color: Colors.text1, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  statusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  bottom: { flexDirection: 'row', padding: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.md },
  stat: { flex: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.text3, marginBottom: 2 },
  statValue: { fontSize: 12, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'], textTransform: 'capitalize' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    borderRadius: Radius.md,
    paddingVertical: 9,
    alignItems: 'center',
  },
  buyBtnText: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  removeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: 11, color: Colors.danger },
});
