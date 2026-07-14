import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import { CardRow, CardHit } from './CardRow';
import { SectionHeader } from './SectionHeader';

interface Props {
  hits: CardHit[];
  totalCount: number;
  packsTotal?: number; // 36 = single box (default), 216 = case of 6, 10 = bundle
  label?: string;
  onViewAll?: () => void;
}

export function TopHitCard({ hits, totalCount, packsTotal = 36, label = 'Play Booster Hits', onViewAll }: Props) {
  const isMultiBox = packsTotal > 36;
  const pullColLabel = isMultiBox ? 'Expected/Case' : 'Pull Rate';

  return (
    <View>
      <View style={{ marginBottom: 10 }}>
        <SectionHeader
          eyebrow="By EV Contribution"
          title={`Top ${label}`}
          action={`View All (${totalCount})`}
          onAction={onViewAll}
        />
      </View>

      <View style={styles.card}>
        {/* Column headers */}
        <View style={styles.colHeader}>
          <Text style={[styles.colLabel, { flex: 1 }]}>Card</Text>
          <Text style={[styles.colLabel, { width: 18 }]}></Text>
          <Text style={[styles.colLabel, { width: 48, textAlign: 'right' }]}>Avg Price</Text>
          <Text style={[styles.colLabel, { width: 58, textAlign: 'right' }]}>{pullColLabel}</Text>
          <Text style={[styles.colLabel, { width: 40, textAlign: 'right' }]}>EV</Text>
        </View>
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by: </Text>
          <Text style={styles.sortValue}>EV Contribution ↓</Text>
        </View>

        {hits.map((hit, i) => (
          <CardRow key={hit.name} hit={hit} isLast={i === hits.length - 1} packsTotal={packsTotal} />
        ))}
      </View>

      <Pressable onPress={onViewAll} style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View All {label}</Text>
      </Pressable>
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
    marginBottom: 10,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
    gap: 8,
  },
  colLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: Colors.text3,
  },
  viewAllBtn: {
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(139,92,246,0.3)',
    backgroundColor: 'rgba(139,92,246,0.06)',
    paddingVertical: 15,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: -0.2,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border2,
  },
  sortLabel: { fontSize: 9, fontWeight: '500', color: Colors.text3 },
  sortValue: { fontSize: 9, fontWeight: '700', color: Colors.accent },
});
