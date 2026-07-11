import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Typography } from './tokens';

interface Props {
  label: string;
  value: string;
  change?: string;
  changeDir?: 'up' | 'down';
  subtitle?: string;
  delay?: number;
  wide?: boolean;
}

export function MetricCard({ label, value, change, changeDir = 'up', subtitle, delay = 0, wide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, damping: 18, stiffness: 160 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.wrap, wide && styles.wide, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.card}>
        {/* Top highlight line */}
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.07)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topHighlight}
        />

        <Text style={styles.label}>{label}</Text>

        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {change && (
            <View style={[styles.changePill, changeDir === 'up' ? styles.pillUp : styles.pillDown]}>
              <Text style={[styles.changeText, changeDir === 'up' ? styles.textUp : styles.textDown]}>
                {changeDir === 'up' ? '▲' : '▼'} {change}
              </Text>
            </View>
          )}
        </View>

        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Ambient glow */}
        <View style={styles.glow} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  wide: { flex: undefined },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
  },
  label: {
    ...Typography.label,
    color: Colors.text3,
    marginBottom: Spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1.4,
    color: Colors.text1,
    fontVariant: ['tabular-nums'],
    lineHeight: 36,
  },
  changePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: 3,
  },
  pillUp: { backgroundColor: Colors.successBg },
  pillDown: { backgroundColor: Colors.dangerBg },
  changeText: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  textUp: { color: Colors.success },
  textDown: { color: Colors.danger },
  subtitle: {
    ...Typography.caption,
    color: Colors.text3,
    marginTop: 2,
  },
  glow: {
    position: 'absolute',
    bottom: -24,
    right: -24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentGlow,
  },
});
