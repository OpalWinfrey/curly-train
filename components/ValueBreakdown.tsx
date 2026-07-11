import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Radius, Spacing, Typography } from './tokens';

interface Segment {
  label: string;
  percentage: number;
  amount: string;
  color: string;
}

interface Props {
  totalEV: string;
  segments: Segment[];
}

function DonutChart({ segments, totalEV }: { segments: Segment[]; totalEV: string }) {
  const SIZE = 130;
  const cx = SIZE / 2, cy = SIZE / 2;
  const OUTER = 56, INNER = 35;
  const GAP = 0.025;

  let angle = -Math.PI / 2;
  const paths: { d: string; color: string }[] = [];

  segments.forEach(seg => {
    const sweep = (seg.percentage / 100) * Math.PI * 2 - GAP;
    const startA = angle + GAP / 2;
    const endA = angle + sweep + GAP / 2;

    const x1o = cx + OUTER * Math.cos(startA);
    const y1o = cy + OUTER * Math.sin(startA);
    const x2o = cx + OUTER * Math.cos(endA);
    const y2o = cy + OUTER * Math.sin(endA);
    const x1i = cx + INNER * Math.cos(endA);
    const y1i = cy + INNER * Math.sin(endA);
    const x2i = cx + INNER * Math.cos(startA);
    const y2i = cy + INNER * Math.sin(startA);

    const large = sweep > Math.PI ? 1 : 0;
    const d = `M${x1o},${y1o} A${OUTER},${OUTER} 0 ${large},1 ${x2o},${y2o} L${x1i},${y1i} A${INNER},${INNER} 0 ${large},0 ${x2i},${y2i} Z`;
    paths.push({ d, color: seg.color });
    angle += (seg.percentage / 100) * Math.PI * 2;
  });

  return (
    <View style={{ width: SIZE, height: SIZE, position: 'relative' }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} />)}
        {/* Center */}
        <Circle cx={cx} cy={cy} r={INNER - 1} fill={Colors.surface2} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.donutCenter]}>
        <Text style={styles.donutVal}>{totalEV}</Text>
        <Text style={styles.donutLbl}>Expected{'\n'}Value / Box</Text>
      </View>
    </View>
  );
}

export function ValueBreakdown({ totalEV, segments }: Props) {
  return (
    <View style={styles.card}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  inner: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'center' },
  donutCenter: { alignItems: 'center', justifyContent: 'center' },
  donutVal: { fontSize: 17, fontWeight: '800', letterSpacing: -0.6, color: Colors.text1, fontVariant: ['tabular-nums'], lineHeight: 19 },
  donutLbl: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.text3, textAlign: 'center', marginTop: 2, lineHeight: 12 },
  legend: { flex: 1, gap: 7 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 2, flexShrink: 0 },
  legName: { flex: 1, fontSize: 11, fontWeight: '500', color: Colors.text2 },
  legVal: { fontSize: 11, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'] },
});
