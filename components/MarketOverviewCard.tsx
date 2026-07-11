import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { Colors, Radius, Spacing } from './tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PERIODS = ['7D', '30D', '90D', '1Y', 'ALL'] as const;
type Period = typeof PERIODS[number];

const DATA: Record<Period, number[]> = {
  '7D': [143.20, 140.80, 144.50, 146.10, 145.30, 147.80, 149.99],
  '30D': [
    132, 128, 125, 130, 133, 135, 131, 129, 134, 138,
    136, 140, 137, 142, 145, 143, 148, 146, 149, 147,
    144, 149, 151, 148, 152, 150, 149, 152, 148, 149.99,
  ],
  '90D': [
    118, 120, 122, 119, 125, 124, 128, 126, 130, 127,
    132, 130, 128, 133, 135, 132, 136, 134, 138, 135,
    140, 138, 136, 141, 143, 140, 144, 142, 145, 143,
    138, 140, 142, 139, 144, 143, 147, 145, 148, 146,
    143, 148, 150, 147, 151, 149, 150, 153, 149, 149.99,
  ],
  '1Y': [
    105, 108, 112, 110, 115, 113, 118, 116, 120, 118,
    115, 120, 122, 119, 125, 123, 127, 125, 130, 128,
    125, 130, 132, 129, 134, 132, 136, 134, 138, 136,
    133, 138, 140, 137, 142, 140, 144, 142, 145, 143,
    149.99,
  ],
  'ALL': [
    95, 100, 105, 108, 112, 110, 115, 113, 118, 116,
    115, 120, 122, 119, 125, 123, 127, 125, 130, 128,
    125, 130, 132, 129, 134, 132, 136, 134, 138, 136,
    133, 138, 140, 137, 142, 140, 144, 142, 145, 143,
    149.99,
  ],
};

interface Props {
  score: number;
  grade: string;
  price: string;
  change7D: string;
  change30D: string;
}

export function MarketOverviewCard({ score, grade, price, change7D, change30D }: Props) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [period, setPeriod] = useState<Period>('30D');

  const R = 32;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const ARC_FRACTION = 0.75;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: score / 100,
      duration: 1000,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, []);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE * ARC_FRACTION, 0],
  });

  // Chart dimensions — available width after gauge (76) + price zone (min 80) + gaps (16)
  const screenW = Dimensions.get('window').width;
  const CHART_ZONE_W = Math.max(100, screenW - 64 - 76 - 80 - 24);
  const CHART_W = CHART_ZONE_W - 28; // leave 28px for y-axis labels
  const CHART_H = 60;
  const PAD = 3;

  const prices = DATA[period];
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  function xp(i: number) { return (i / (prices.length - 1)) * CHART_W; }
  function yp(p: number) { return PAD + (1 - (p - minP) / range) * (CHART_H - PAD * 2); }

  const linePath = prices.map((p, i) => `${i === 0 ? 'M' : 'L'}${xp(i).toFixed(1)},${yp(p).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  // 4 evenly-spaced y-axis labels, displayed top→bottom
  const step = (maxP - minP) / 3;
  const yLabels = [3, 2, 1, 0].map(i => `$${Math.round(minP + i * step)}`);

  return (
    <View style={styles.card}>
      <Text style={styles.cardHeader}>MARKET OVERVIEW</Text>
      <View style={styles.body}>

        {/* Gauge */}
        <View style={styles.gaugeZone}>
          <View style={styles.gaugeWrap}>
            <Svg width={76} height={76} viewBox="0 0 76 76">
              <Defs>
                <LinearGradient id="mgGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={Colors.accent2} />
                  <Stop offset="1" stopColor={Colors.accent} />
                </LinearGradient>
              </Defs>
              <Circle cx={38} cy={38} r={R} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth={5} strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
                transform={`rotate(135 38 38)`} />
              <AnimatedCircle cx={38} cy={38} r={R} fill="none"
                stroke="url(#mgGrad)" strokeWidth={5} strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(135 38 38)`} />
            </Svg>
            <View style={[StyleSheet.absoluteFill, styles.gaugeCenterAbs]}>
              <Text style={styles.gaugeNum}>{score}</Text>
            </View>
          </View>
          <Text style={styles.gaugeGrade}>{grade.toUpperCase()}</Text>
          <Text style={styles.gaugeLabel}>INVESTMENT SCORE</Text>
        </View>

        {/* Price stats */}
        <View style={styles.priceZone}>
          <Text style={styles.pzEyebrow}>MARKET PRICE</Text>
          <Text style={styles.pzPrice}>{price}</Text>
          <Text style={styles.changeUp}>▲ {change7D} (7D)</Text>
          <Text style={styles.changeUp}>▲ {change30D} (30D)</Text>
        </View>

        {/* Chart */}
        <View style={[styles.chartZone, { width: CHART_ZONE_W }]}>
          <View style={styles.periodRow}>
            {PERIODS.map(p => (
              <Pressable key={p} onPress={() => setPeriod(p)}
                style={[styles.periodBtn, p === period && styles.periodActive]}>
                <Text style={[styles.periodText, p === period && styles.periodTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chartRow}>
            <Svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
              <Defs>
                <LinearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={Colors.success} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={Colors.success} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path d={areaPath} fill="url(#chartAreaGrad)" />
              <Path d={linePath} fill="none" stroke={Colors.success} strokeWidth={1.5}
                strokeLinejoin="round" strokeLinecap="round" />
            </Svg>
            <View style={[styles.yAxis, { height: CHART_H }]}>
              {yLabels.map((lbl, i) => (
                <Text key={i} style={styles.yLabel}>{lbl}</Text>
              ))}
            </View>
          </View>
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
  cardHeader: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    color: Colors.text3, marginBottom: 12,
  },
  body: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // Gauge
  gaugeZone: { alignItems: 'center', width: 76, flexShrink: 0 },
  gaugeWrap: { width: 76, height: 76, position: 'relative' },
  gaugeCenterAbs: { alignItems: 'center', justifyContent: 'center' },
  gaugeNum: {
    fontSize: 22, fontWeight: '800', color: Colors.text1,
    letterSpacing: -0.6, fontVariant: ['tabular-nums'],
  },
  gaugeGrade: { fontSize: 10, fontWeight: '700', color: Colors.success, marginTop: 5, letterSpacing: 0.3 },
  gaugeLabel: {
    fontSize: 7, fontWeight: '600', color: Colors.text3, letterSpacing: 0.4,
    textTransform: 'uppercase', marginTop: 2, textAlign: 'center',
  },

  // Price
  priceZone: { flex: 1 },
  pzEyebrow: {
    fontSize: 8, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase',
    color: Colors.text3, marginBottom: 3,
  },
  pzPrice: {
    fontSize: 20, fontWeight: '800', color: Colors.text1,
    letterSpacing: -0.6, fontVariant: ['tabular-nums'], lineHeight: 22, marginBottom: 5,
  },
  changeUp: { fontSize: 10.5, fontWeight: '600', color: Colors.success, fontVariant: ['tabular-nums'], marginBottom: 1 },

  // Chart
  chartZone: { flexShrink: 0 },
  periodRow: { flexDirection: 'row', gap: 1, marginBottom: 4 },
  periodBtn: { paddingHorizontal: 4, paddingVertical: 3, borderRadius: 5 },
  periodActive: { backgroundColor: 'rgba(139,92,246,0.15)' },
  periodText: { fontSize: 9, fontWeight: '600', color: Colors.text3 },
  periodTextActive: { color: Colors.accent },
  chartRow: { flexDirection: 'row', alignItems: 'flex-start' },
  yAxis: { justifyContent: 'space-between', paddingLeft: 3, width: 28 },
  yLabel: { fontSize: 8, fontWeight: '500', color: Colors.text3, fontVariant: ['tabular-nums'] },
});
