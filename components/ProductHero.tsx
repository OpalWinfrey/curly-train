import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { Colors, Radius, Spacing } from './tokens';
import { scryfallSetIcon } from '../data/scryfall';

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
  heroImageUrl?: string;
}

function SetIconOverlay({ setCode }: { setCode: string }) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <View style={styles.setIconWrap}>
      <SvgUri width={28} height={28} uri={scryfallSetIcon(setCode)} onError={() => setError(true)} />
    </View>
  );
}

export function ProductHero({ setCode, year, title, subtitle, releaseDate, metrics, heroImageUrl }: Props) {
  const [imgError, setImgError] = useState(false);
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
            {/* Card art background */}
            {heroImageUrl && !imgError && (
              <Image
                source={{ uri: heroImageUrl }}
                style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            )}

            {/* Gradient vignette over the art */}
            <LinearGradient
              colors={['transparent', 'rgba(6,2,17,0.9)']}
              style={styles.boxLabelGrad}
            >
              <SetIconOverlay setCode={setCode} />
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

  boxArtWrap: { flexShrink: 0, width: 130 },
  boxArt: {
    width: 130, height: 200,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'flex-end',
  },
  boxLabelGrad: { padding: Spacing.sm, paddingTop: Spacing.xxl, gap: 2 },
  setIconWrap: { marginBottom: 4, opacity: 0.9 },
  boxSetName: { fontSize: 12, fontWeight: '900', color: 'rgba(255,255,255,0.92)', letterSpacing: 0.5 },
  boxSetSub: { fontSize: 8, fontWeight: '700', color: 'rgba(200,160,240,0.85)', letterSpacing: 0.3 },
  boxFormatLabel: { fontSize: 6, fontWeight: '500', color: 'rgba(255,255,255,0.4)', marginTop: 2, letterSpacing: 0.5 },

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
