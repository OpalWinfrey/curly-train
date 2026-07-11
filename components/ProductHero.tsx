import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop, Path } from 'react-native-svg';
import { Colors, Radius, Spacing, Typography } from './tokens';

interface Metric {
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
  metrics: [Metric, Metric, Metric];
}

function MiniGauge({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 900, delay: 400, useNativeDriver: false }).start();
  }, []);

  const R = 14;
  const CIRC = 2 * Math.PI * R;
  const ARC = CIRC * 0.75;

  return (
    <View style={{ width: 36, height: 36, position: 'relative' }}>
      <Svg width={36} height={36} viewBox="0 0 36 36">
        <Defs>
          <SvgGrad id="gaugeG" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={Colors.success} />
            <Stop offset="1" stopColor="#34D399" />
          </SvgGrad>
        </Defs>
        <Circle cx={18} cy={18} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={3}
          strokeLinecap="round" strokeDasharray={`${ARC} ${CIRC}`} transform="rotate(135 18 18)" />
        <Circle cx={18} cy={18} r={R} fill="none" stroke="url(#gaugeG)" strokeWidth={3}
          strokeLinecap="round" strokeDasharray={`${ARC * (score / 100)} ${CIRC}`} transform="rotate(135 18 18)" />
      </Svg>
    </View>
  );
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

  return (
    <View style={styles.container}>
      {/* Row: box art + info */}
      <View style={styles.heroRow}>
        {/* Box Art Placeholder */}
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
            {/* Label strip */}
            <LinearGradient
              colors={['transparent', 'rgba(6,2,17,0.95)']}
              style={styles.boxLabelGrad}
            >
              <Text style={styles.boxMagic}>MAGIC</Text>
              <Text style={styles.boxGathering}>THE GATHERING</Text>
              <Text style={styles.boxSetName}>TARKIR</Text>
              <Text style={styles.boxSetSub}>DRAGONSTORM</Text>
              <Text style={styles.boxFormatLabel}>PLAY BOOSTERS</Text>
            </LinearGradient>
          </LinearGradient>
        </View>

        {/* Product Info */}
        <View style={styles.info}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Play Booster Box</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{subtitle}</Text>
          <Text style={styles.release}>{releaseDate}</Text>

          {/* Mini metrics */}
          <View style={styles.metricStack}>
            {metrics.map((m, i) => (
              <View key={i} style={styles.miniMetric}>
                <Text style={styles.mmLabel}>{m.label}</Text>
                {m.isScore && m.score != null ? (
                  <View style={styles.scoreRow}>
                    <MiniGauge score={m.score} />
                    <View style={{ marginLeft: 6 }}>
                      <Text style={styles.mmValue}>{m.score}</Text>
                      <Text style={[styles.mmSub, { color: Colors.success }]}>{m.sub}</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.mmValue}>{m.value}</Text>
                    <Text style={styles.mmSub}>{m.sub}</Text>
                  </>
                )}
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
    paddingBottom: Spacing.xl,
    position: 'relative',
  },
  heroRow: { flexDirection: 'row', gap: Spacing.md },

  // Box art
  boxArtWrap: { flexShrink: 0, width: 140 },
  boxArt: {
    width: 140, height: 188,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'flex-end',
  },
  boxLabelGrad: { padding: Spacing.sm, paddingTop: Spacing.xxl },
  boxMagic: { fontSize: 8, fontWeight: '800', color: 'rgba(255,255,255,0.85)', textAlign: 'center', letterSpacing: 1 },
  boxGathering: { fontSize: 5, fontWeight: '500', color: 'rgba(255,255,255,0.35)', textAlign: 'center', letterSpacing: 0.5, marginBottom: 4 },
  boxSetName: { fontSize: 13, fontWeight: '900', color: 'rgba(255,255,255,0.92)', textAlign: 'center', letterSpacing: 1 },
  boxSetSub: { fontSize: 8, fontWeight: '700', color: 'rgba(200,160,240,0.85)', textAlign: 'center', letterSpacing: 0.5 },
  boxFormatLabel: { fontSize: 6, fontWeight: '500', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 2, letterSpacing: 0.5 },

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
  title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: Colors.text1, lineHeight: 22, marginBottom: 2 },
  sub: { fontSize: 13, fontWeight: '500', color: Colors.text2, marginBottom: 2 },
  release: { fontSize: 11, color: Colors.text3, fontWeight: '500', marginBottom: Spacing.lg },

  // Metric stack
  metricStack: { gap: Spacing.sm },
  miniMetric: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
  },
  mmLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color: Colors.text3, marginBottom: 2 },
  mmValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.8, color: Colors.text1, fontVariant: ['tabular-nums'], lineHeight: 20 },
  mmSub: { fontSize: 10, color: Colors.text3, fontWeight: '500', marginTop: 1 },
  scoreRow: { flexDirection: 'row', alignItems: 'center' },
});
