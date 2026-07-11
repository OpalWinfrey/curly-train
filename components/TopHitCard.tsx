import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import { CardRow, CardHit } from './CardRow';
import { SectionHeader } from './SectionHeader';

interface Props {
  hits: CardHit[];
  totalCount: number;
  onViewAll?: () => void;
}

export function TopHitCard({ hits, totalCount, onViewAll }: Props) {
  return (
    <View>
      <View style={{ marginBottom: 10 }}>
        <SectionHeader
          eyebrow="By EV Contribution"
          title="Top Play Booster Hits"
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
          <Text style={[styles.colLabel, { width: 58, textAlign: 'right' }]}>Pull Rate</Text>
          <Text style={[styles.colLabel, { width: 40, textAlign: 'right' }]}>EV</Text>
        </View>

        {hits.map((hit, i) => (
          <CardRow key={hit.name} hit={hit} isLast={i === hits.length - 1} />
        ))}
      </View>

      <Pressable onPress={onViewAll} style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>View All Play Booster Hits</Text>
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
});
