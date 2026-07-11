import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Radius, Spacing, Typography } from './tokens';

interface ScoreBar {
  label: string;
  value: number;
  color: string;
}

interface Props {
  score: number;
  grade: string;
  description: string;
  bars: ScoreBar[];
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function InvestmentScore({ score, grade, description, bars }: Props) {
  const animValue = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const R = 38;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const START_ANGLE = 135; // degrees, matching 0.75π
  const ARC_FRACTION = 0.75; // 270° arc

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animValue, { toValue: score / 100, duration: 1000, delay: 200, useNativeDriver: false }),
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE * ARC_FRACTION, 0],
  });

  return (
    <Animated.View style={[styles.card, { opacity: fadeIn }]}>
      <View style={styles.inner}>
        {/* Gauge */}
        <View style={styles.gaugeWrap}>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={Colors.accent2} />
                <Stop offset="1" stopColor={Colors.accent} />
              </LinearGradient>
            </Defs>
            {/* Track */}
            <Circle
              cx={50} cy={50} r={R}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
              transform={`rotate(${START_ANGLE} 50 50)`}
            />
            {/* Fill */}
            <AnimatedCircle
              cx={50} cy={50} r={R}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(${START_ANGLE} 50 50)`}
            />
          </Svg>
          <View style={styles.gaugeCenterAbs}>
            <Text style={styles.gaugeNumber}>{score}</Text>
            <Text style={styles.gaugeMax}>/100</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.grade}>{grade}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.bars}>
            {bars.map(bar => (
              <View key={bar.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{bar.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${bar.value}%`, backgroundColor: bar.color }]} />
                </View>
                <Text style={[styles.barVal, { color: bar.color }]}>{bar.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    overflow: 'hidden',
  },
  inner: { flexDirection: 'row', gap: Spacing.xl, alignItems: 'center' },
  gaugeWrap: { width: 100, height: 100, position: 'relative', flexShrink: 0 },
  gaugeCenterAbs: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    color: Colors.text1,
    fontVariant: ['tabular-nums'],
    lineHeight: 30,
  },
  gaugeMax: { fontSize: 11, color: Colors.text3, fontWeight: '500' },
  details: { flex: 1 },
  grade: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: Colors.success, marginBottom: 4 },
  description: { ...Typography.caption, color: Colors.text2, lineHeight: 16, marginBottom: 12 },
  bars: { gap: 7 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { ...Typography.label, color: Colors.text3, width: 54 },
  barTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  barVal: { ...Typography.caption, fontWeight: '700', width: 22, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
