import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from './tokens';

interface MetricItem {
  label: string;
  value: string;
  sub: string;
  isScore?: boolean;
  score?: number;
}

interface Props {
  setCode: string;
  year: string;
  title: string;
  subtitle: string;
  releaseDate: string;
  metrics: MetricItem[];
}

export function ProductHero({ setCode, year, title, subtitle, releaseDate, metrics }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  const titleLines = title.split('\n');

  return (
    <View style={styles.container}>
      <View style={styles.heroRow}>
        {/* Box art */}
        <View style={styles.boxArtWrap}>
          <LinearGradient
            colors={['#1A0840', '#0A0520', '#060211']}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
            style={styles.boxArt}
          >
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: shimmerOpacity }]}>
              <LinearGradient
                colors={['rgba(139,92,246,0.4)', 'transparent', 'rgba(251,146,60,0.2)']}
                start={{ x: 0.7, y: 0.2 }}
                end={{ x: 0.3, y: 0.9 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <LinearGradient
              colors={['transparent', 'rgba(6,2,17,0.95)']}
              style={styles.boxLabelGrad}
            >
              <Text style={styles.boxMagic}>MAGIC</Text>
              <Text style={styles.boxGathering}>THE GATHERING</Text>
              {titleLines.map((line, i) => (
                <Text
                  key={i}
                  style={i === 0 ? styles.boxSetName : styles.boxSetSub}
                  numberOfLines={1}
                >
                  {line.replace(':', '').trim().toUpperCase()}
                </Text>
              ))}
              <Text style={styles.boxFormatLabel}>{setCode} · {year}</Text>
            </LinearGradient>
          </LinearGradient>
        </View>

        {/* Product info */}
        <View style={styles.info}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{subtitle}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.release}>{releaseDate}</Text>

          {/* Metrics */}
          <View style={styles.metricsCol}>
            {metrics.map((m) => (
              <View key={m.label} style={styles.metricItem}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={[
                  styles.metricValue,
                  m.isScore && m.score !== undefined
                    ? { color: m.score >= 80 ? Colors.success : m.score >= 65 ? Colors.accent : Colors.warning }
                    : {}
                ]}>
                  {m.value}
                </Text>
                {m.sub ? <Text style={styles.metricSub}>{m.sub}</Text> : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heroRow: { flexDirection: 'row', gap: Spacing.md },

  // Box art
  boxArtWrap: { flexShrink: 0, width: 130 },
  boxArt: {
    width: 130, height: 200,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'flex-end',
  },
  boxLabelGrad: { padding: Spacing.sm, paddingTop: Spacing.xxl },
  boxMagic: { fontSize: 8, fontWeight: '800', color: 'rgba(255,255,255,0.85)', textAlign: 'center', letterSpacing: 1 },
  boxGathering: { fontSize: 5, fontWeight: '500', color: 'rgba(255,255,255,0.35)', textAlign: 'center', letterSpacing: 0.5, marginBottom: 4 },
  boxSetName: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.92)', textAlign: 'center', letterSpacing: 0.5 },
  boxSetSub: { fontSize: 8, fontWeight: '700', color: 'rgba(200,160,240,0.85)', textAlign: 'center', letterSpacing: 0.3 },
  boxFormatLabel: { fontSize: 6, fontWeight: '500', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 3, letterSpacing: 0.5 },

  // Info
  info: { flex: 1, paddingTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent2,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: Spacing.sm,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: Colors.text1, lineHeight: 22, marginBottom: 4 },
  release: { fontSize: 11, color: Colors.text3, fontWeight: '500', marginBottom: Spacing.md },

  metricsCol: { gap: 10 },
  metricItem: { gap: 1 },
  metricLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: Colors.text3 },
  metricValue: { fontSize: 16, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  metricSub: { fontSize: 10, color: Colors.text3, fontWeight: '500' },
});
