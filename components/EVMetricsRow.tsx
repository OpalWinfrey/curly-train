import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';

interface Props {
  estimatedEV: string;
  evPct: string;
  breakEvenChance: string;
  avgPullValue: string;
  recommendation: string;
  rationale: string;
}

export function EVMetricsRow({
  estimatedEV, evPct, breakEvenChance, avgPullValue, recommendation, rationale,
}: Props) {
  return (
    <View style={styles.row}>
      {/* EV Metrics card */}
      <View style={[styles.card, styles.leftCard]}>
        <Text style={styles.header}>EXPECTED VALUE</Text>
        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.mLabel}>ESTIMATED EV</Text>
          <Text style={styles.mValue}>{estimatedEV}</Text>
          <Text style={styles.mSub}>{evPct}</Text>
        </View>

        <View style={[styles.metric, styles.metricDivider]}>
          <Text style={styles.mLabel}>BREAK EVEN CHANCE</Text>
          <Text style={styles.mValue}>{breakEvenChance}</Text>
          <Text style={styles.mSub}>To open value</Text>
        </View>

        <View style={[styles.metric, styles.metricDivider, { marginBottom: 0 }]}>
          <Text style={styles.mLabel}>AVG PULL VALUE</Text>
          <Text style={styles.mValue}>{avgPullValue}</Text>
          <Text style={styles.mSub}>Per booster</Text>
        </View>
      </View>

      {/* Recommendation card */}
      <View style={[styles.card, styles.rightCard]}>
        <Text style={styles.header}>RECOMMENDATION</Text>
        <View style={styles.divider} />

        <Text style={styles.buyLabel}>{recommendation}</Text>
        <Text style={styles.buyRationale}>{rationale}</Text>

        <View style={styles.buyIconWrap}>
          <Text style={styles.buyIconText}>↗</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  leftCard: { flex: 3 },
  rightCard: { flex: 2 },

  header: {
    fontSize: 9, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase',
    color: Colors.text3, marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },

  metric: { marginBottom: 8 },
  metricDivider: { paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border2 },
  mLabel: {
    fontSize: 8, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase',
    color: Colors.text3, marginBottom: 2,
  },
  mValue: {
    fontSize: 19, fontWeight: '800', color: Colors.text1,
    letterSpacing: -0.5, fontVariant: ['tabular-nums'], lineHeight: 21,
  },
  mSub: { fontSize: 9, fontWeight: '500', color: Colors.text3, marginTop: 1 },

  buyLabel: {
    fontSize: 36, fontWeight: '900', color: Colors.success,
    letterSpacing: -0.5, lineHeight: 38, marginBottom: 6,
  },
  buyRationale: { fontSize: 10, fontWeight: '500', color: Colors.text2, lineHeight: 14 },

  buyIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10,
  },
  buyIconText: { fontSize: 16, color: Colors.success },
});
