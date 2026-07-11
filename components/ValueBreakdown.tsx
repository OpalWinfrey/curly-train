import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Radius, Spacing } from './tokens';

interface Segment {
  label: string;
  percentage: number;
  amount: string;
  color: string;
}

export interface CategoryItem {
  category: string;
  cardName: string;
  value: string;
  color: string;
}

interface Props {
  totalEV: string;
  segments: Segment[];
  topByCategory?: CategoryItem[];
}

function DonutChart({ segments, totalEV }: { segments: Segment[]; totalEV: string }) {
  const SIZE = 120;
  const cx = SIZE / 2, cy = SIZE / 2;
  const OUTER = 52, INNER = 32;
  const GAP = 0.025;

  let angle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  segments.forEach(seg => {
    const sweep = (seg.percentage / 100) * Math.PI * 2 - GAP;
    const startA = angle + GAP / 2;
    const endA = angle + sweep + GAP / 2;
    const x1o = cx + OUTER * Math.cos(startA), y1o = cy + OUTER * Math.sin(startA);
    const x2o = cx + OUTER * Math.cos(endA),   y2o = cy + OUTER * Math.sin(endA);
    const x1i = cx + INNER * Math.cos(endA),   y1i = cy + INNER * Math.sin(endA);
    const x2i = cx + INNER * Math.cos(startA), y2i = cy + INNER * Math.sin(startA);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M${x1o},${y1o} A${OUTER},${OUTER} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${INNER},${INNER} 0 ${large},0 ${x2i},${y2i} Z`;
    paths.push({ d, color: seg.color });
    angle += (seg.percentage / 100) * Math.PI * 2;
  });

  return (
    <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} />)}
        <Circle cx={cx} cy={cy} r={INNER - 1} fill={Colors.surface2} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.donutCenter]}>
        <Text style={styles.donutVal}>{totalEV}</Text>
        <Text style={styles.donutLbl}>TOTAL EV</Text>
      </View>
    </View>
  );
}

export function ValueBreakdown({ totalEV, segments, topByCategory }: Props) {
  return (
    <View style={styles.row}>
      {/* Left: donut + legend */}
      <View style={[styles.card, topByCategory ? styles.leftCard : styles.fullCard]}>
        <Text style={styles.cardHeader}>EXPECTED VALUE BREAKDOWN</Text>
        <View style={styles.inner}>
          <DonutChart segments={segments} totalEV={totalEV} />
          <View style={styles.legend}>
            {segments.map(seg => (
              <View key={seg.label} style={styles.legRow}>
                <View style={[styles.dot, { backgroundColor: seg.color }]} />
                <Text style={styles.legName}>{seg.label} ({seg.percentage}%)</Text>
                <Text style={styles.legVal}>{seg.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Right: top value by category */}
      {topByCategory && (
        <View style={[styles.card, styles.rightCard]}>
          <Text style={styles.cardHeader}>TOP VALUE BY CATEGORY</Text>
          <View style={styles.catList}>
            {topByCategory.map(item => (
              <View key={item.category} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: item.color }]} />
                <View style={styles.catInfo}>
                  <Text style={styles.catLabel}>{item.category}</Text>
                  <Text style={styles.catCard} numberOfLines={1}>{item.cardName}</Text>
                </View>
                <Text style={styles.catVal}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  fullCard: { flex: 1 },
  leftCard: { flex: 1.1 },
  rightCard: { flex: 1 },

  cardHeader: {
    fontSize: 9, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase',
    color: Colors.text3, marginBottom: 10,
  },

  inner: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  donutCenter: { alignItems: 'center', justifyContent: 'center' },
  donutVal: {
    fontSize: 13, fontWeight: '800', letterSpacing: -0.4, color: Colors.text1,
    fontVariant: ['tabular-nums'], lineHeight: 15, textAlign: 'center',
  },
  donutLbl: {
    fontSize: 7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4,
    color: Colors.text3, textAlign: 'center', marginTop: 2,
  },
  legend: { flex: 1, gap: 5 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 2, flexShrink: 0 },
  legName: { flex: 1, fontSize: 9.5, fontWeight: '500', color: Colors.text2 },
  legVal: { fontSize: 10, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'] },

  catList: { gap: 8 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catDot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  catInfo: { flex: 1, minWidth: 0 },
  catLabel: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, color: Colors.text3 },
  catCard: { fontSize: 10.5, fontWeight: '600', color: Colors.text1, marginTop: 1 },
  catVal: { fontSize: 11, fontWeight: '700', color: Colors.success, fontVariant: ['tabular-nums'] },
});
