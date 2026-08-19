import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import type { CardAlertWithPrice } from '../data/useCardAlertPrices';
import { useUserState } from '../data/userState';
import { formatPrice } from '../data/formatPrice';

interface Props {
  entry: CardAlertWithPrice;
  onRemove: () => void;
}

export function CardAlertCard({ entry, onRemove }: Props) {
  const { preferences } = useUserState();
  const { currency } = preferences;
  const { alert, currentPriceCents, availableQuantity, triggered } = entry;

  const target = alert.targetPriceCents / 100;
  const current = currentPriceCents != null ? currentPriceCents / 100 : null;

  const statusColor = triggered ? Colors.success : Colors.text3;
  const statusBg = triggered ? Colors.successBg : Colors.surface;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>{alert.cardName}</Text>
          <Text style={styles.setName}>{alert.setCode} #{alert.collectorNumber} · {alert.finish === 'foil' ? 'Foil' : 'Non-foil'}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.currentPrice}>{current != null ? formatPrice(current, currency) : 'N/A'}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {triggered ? '✓ Hit!' : current == null ? 'Not in stock' : 'Watching'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>TARGET</Text>
          <Text style={styles.statValue}>{formatPrice(target, currency)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>IN STOCK</Text>
          <Text style={styles.statValue}>{availableQuantity}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Text style={styles.removeText}>✕</Text>
        </Pressable>
      </View>
    </View>
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
  statValue: { fontSize: 12, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'] },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  removeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: 11, color: Colors.danger },
});
