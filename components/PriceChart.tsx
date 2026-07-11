import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Colors, Radius, Spacing, Typography } from './tokens';

const PERIODS = ['1W', '1M', '3M', 'All'] as const;
type Period = typeof PERIODS[number];

const DATA: Record<Period, number[]> = {
  '1W': [143.20, 140.80, 144.50, 146.10, 145.30, 147.80, 149.99],
  '1M': [
    132,128,125,130,133,135,131,129,134,138,
    136,140,137,142,145,143,148,146,149,147,
    144,149,151,148,152,150,149,152,148,149.99,
  ],
  '3M': [
    118,120,122,119,125,124,128,126,130,127,
    132,130,128,133,135,132,136,134,138,135,
    140,138,136,141,143,140,144,142,145,143,
    138,140,142,139,144,143,147,145,148,146,
    143,148,150,147,151,149,150,153,149,149.99,
  ],
  'All': [
    105,108,112,110,115,113,118,116,120,118,
    115,120,122,119,125,123,127,125,130,128,
    125,130,132,129,134,132,136,134,138,136,
    133,138,140,137,142,140,144,142,145,143,
    149.99,
  ],
};

interface Props {
  currentPrice: string;
  weekChange: string;
}

export function PriceChart({ currentPrice, weekChange }: Props) {
  const [period, setPeriod] = useState<Period>('1M');
  const chartWidth = Dimensions.get('window').width - 72; // 36px padding each side

  const prices = DATA[period];
  const minP = Math.min(...prices) - 2;
  const maxP = Math.max(...prices) + 2;
  const H = 90;
  const W = chartWidth;
  const padT = 8, padB = 4;

  function xp(i: number) { return (i / (prices.length - 1)) * W; }
  function yp(p: number) { return padT + (1 - (p - minP) / (maxP - minP)) * (H - padT - padB); }

  const linePath = prices.map((p, i) => `${i === 0 ? 'M' : 'L'}${xp(i).toFixed(1)},${yp(p).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${xp(prices.length - 1).toFixed(1)},${H} L0,${H} Z`;

  const lastX = xp(prices.length - 1);
  const lastY = yp(prices[prices.length - 1]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.priceBig}>{currentPrice}</Text>
          <Text style={styles.priceChange}>{weekChange} this week</Text>
        </View>
        <View style={styles.periods}>
          {PERIODS.map(p => (
            <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.periodBtn, p === period && styles.periodActive]}>
              <Text style={[styles.periodText, p === period && styles.periodTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.accent} stopOpacity="0.2" />
            <Stop offset="1" stopColor={Colors.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* Grid lines */}
        {[1, 2, 3].map(i => (
          <Path
            key={i}
            d={`M0,${padT + (i / 4) * (H - padT - padB)} L${W},${padT + (i / 4) * (H - padT - padB)}`}
            stroke="rgba(255,255,255,0.035)"
            strokeWidth={1}
          />
        ))}
        {/* Area */}
        <Path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <Path d={linePath} fill="none" stroke={Colors.accent} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
        {/* Endpoint */}
        <Circle cx={lastX} cy={lastY} r={7} fill={Colors.accentGlow} />
        <Circle cx={lastX} cy={lastY} r={3.5} fill={Colors.accent} />
      </Svg>

      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{period === '1W' ? 'Jul 4' : period === '1M' ? 'Jun 11' : period === '3M' ? 'Apr 11' : 'Jan'}</Text>
        <Text style={styles.axisLabel}>{period === '1W' ? 'Jul 7' : period === '1M' ? 'Jun 26' : period === '3M' ? 'Jun 1' : 'Apr'}</Text>
        <Text style={styles.axisLabel}>Jul 11</Text>
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
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  priceBig: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: Colors.text1, fontVariant: ['tabular-nums'], lineHeight: 30 },
  priceChange: { fontSize: 12, fontWeight: '600', color: Colors.success, marginTop: 3, fontVariant: ['tabular-nums'] },
  periods: { flexDirection: 'row', gap: 3 },
  periodBtn: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  periodActive: { backgroundColor: 'rgba(139,92,246,0.12)' },
  periodText: { ...Typography.caption, fontWeight: '600', color: Colors.text3 },
  periodTextActive: { color: Colors.accent },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLabel: { ...Typography.caption, color: Colors.text3, fontWeight: '500', fontVariant: ['tabular-nums'] },
});
