import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import { useUserState } from '../data/userState';
import { formatPrice } from '../data/formatPrice';
import type { CollectionItem, Product } from '../data/types';

interface Props {
  item: CollectionItem;
  product: Product;
  onPress: () => void;
  onRemove: () => void;
}

export function CollectionItemCard({ item, product, onPress, onRemove }: Props) {
  const { preferences } = useUserState();
  const { currency, sellingFeePct, taxRatePct } = preferences;

  const currentValue = product.currentMarketPrice * item.quantity;
  const totalPaid = item.purchasePrice * item.quantity;
  const netProceeds = currentValue * (1 - sellingFeePct / 100);
  const afterFeePnl = netProceeds - totalPaid;
  const pnl = taxRatePct > 0 && afterFeePnl > 0
    ? afterFeePnl * (1 - taxRatePct / 100)
    : afterFeePnl;
  const pnlPct = totalPaid > 0 ? (pnl / totalPaid) * 100 : 0;
  const isPositive = pnl >= 0;
  const showNetLabel = sellingFeePct > 0 || taxRatePct > 0;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.meta}>Qty {item.quantity} · Paid {formatPrice(item.purchasePrice, currency)} each</Text>
        </View>
        <View style={styles.valueCol}>
          <Text style={styles.currentValue}>{formatPrice(currentValue, currency)}</Text>
          <View style={[styles.pnlPill, isPositive ? styles.pillUp : styles.pillDown]}>
            <Text style={[styles.pnlText, isPositive ? styles.textUp : styles.textDown]}>
              {isPositive ? '+' : ''}{formatPrice(pnl, currency)} ({isPositive ? '+' : ''}{pnlPct.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>INVESTED</Text>
          <Text style={styles.statValue}>{formatPrice(totalPaid, currency)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>MARKET PRICE</Text>
          <Text style={styles.statValue}>{formatPrice(product.currentMarketPrice, currency)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{showNetLabel ? 'NET RETURN' : 'RETURN'}</Text>
          <Text style={[styles.statValue, isPositive ? styles.textUp : styles.textDown]}>
            {isPositive ? '+' : ''}{pnlPct.toFixed(1)}%
          </Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      </View>

      {item.notes ? <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text> : null}
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
    gap: 0,
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
  meta: { fontSize: 11, color: Colors.text3, marginTop: 3 },
  valueCol: { alignItems: 'flex-end', gap: 4 },
  currentValue: { fontSize: 18, fontWeight: '800', color: Colors.text1, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  pnlPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full },
  pillUp: { backgroundColor: Colors.successBg },
  pillDown: { backgroundColor: Colors.dangerBg },
  pnlText: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  textUp: { color: Colors.success },
  textDown: { color: Colors.danger },
  bottom: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  stat: { flex: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.text3, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'] },
  removeBtn: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: 11, color: Colors.danger },
  notes: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, fontSize: 11, color: Colors.text3, fontStyle: 'italic' },
});
