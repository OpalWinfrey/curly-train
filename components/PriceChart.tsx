import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Colors, Radius, Spacing, Typography } from './tokens';
import type { PricePoint } from '../data/types';

const PERIODS = ['1W', '1M', 'All'] as const;
type Period = typeof PERIODS[number];

interface Props {
  currentPrice: string;
  weekChange: string;
  priceHistory: PricePoint[];
}

function filterHistory(history: PricePoint[], period: Period): number[] {
  if (history.length === 0) return [0, 0];
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const days = period === '1W' ? 7 : period === '1M' ? 30 : Infinity;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const filtered = days === Infinity
    ? sorted
    : sorted.filter(p => new Date(p.date) >= cutoff);
  const prices = (filtered.length >= 2 ? filtered : sorted).map(p => p.price);
  return prices.length >= 2 ? prices : [prices[0], prices[0]];
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PriceChart({ currentPrice, weekChange, priceHistory }: Props) {
  const [period, setPeriod] = useState<Period>('1M');
  const chartWidth = Dimensions.get('window').width - 72;

  const prices = filterHistory(priceHistory, period);
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

  const sorted = [...priceHistory].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sorted[0]?.date ?? '';
  const midDate = sorted[Math.floor(sorted.length / 2)]?.date ?? '';
  const lastDate = sorted[sorted.length - 1]?.date ?? '';

  const axisLeft = period === '1W'
    ? formatAxisDate(sorted.slice(-7)[0]?.date ?? firstDate)
    : period === '1M' ? formatAxisDate(firstDate)
    : formatAxisDate(firstDate);

  const axisMid = formatAxisDate(midDate);
  const axisRight = formatAxisDate(lastDate);

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
        {[1, 2, 3].map(i => (
          <Path
            key={i}
            d={`M0,${padT + (i / 4) * (H - padT - padB)} L${W},${padT + (i / 4) * (H - padT - padB)}`}
            stroke="rgba(255,255,255,0.035)"
            strokeWidth={1}
          />
        ))}
        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path d={linePath} fill="none" stroke={Colors.accent} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
        <Circle cx={lastX} cy={lastY} r={7} fill={Colors.accentGlow} />
        <Circle cx={lastX} cy={lastY} r={3.5} fill={Colors.accent} />
      </Svg>

      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{axisLeft}</Text>
        <Text style={styles.axisLabel}>{axisMid}</Text>
        <Text style={styles.axisLabel}>{axisRight}</Text>
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
