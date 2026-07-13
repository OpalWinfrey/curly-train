import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';

interface Props {
  signal: 'BUY' | 'HOLD' | 'WAIT' | 'SKIP';
  rationale: string;
  confidence: number;  // 0–100 percentage
}

const SIGNAL_COLOR: Record<string, string> = {
  BUY: Colors.success,
  HOLD: Colors.warning,
  WAIT: Colors.warning,
  SKIP: Colors.danger,
};

export function RecommendationCard({ signal, rationale, confidence }: Props) {
  const signalColor = SIGNAL_COLOR[signal] ?? Colors.success;

  const bullets = rationale.split(/\.\s+/).filter(Boolean).map(s => s.replace(/\.$/, ''));
  const confidenceBars = Math.max(1, Math.min(5, Math.round(confidence / 20)));
  const confidenceLabel = confidence >= 75 ? 'High' : confidence >= 50 ? 'Med' : 'Low';

  // Bar heights increase from left to right (signal-strength style)
  const BAR_HEIGHTS = [10, 14, 18, 22, 26];

  return (
    <View style={styles.card}>
      <View style={styles.inner}>

        {/* Left: signal + icon */}
        <View style={styles.signalZone}>
          <Text style={[styles.signalText, { color: signalColor }]}>{signal}</Text>
          <View style={[styles.shieldWrap, { backgroundColor: `${signalColor}1A` }]}>
            <Text style={[styles.shieldIcon, { color: signalColor }]}>✓</Text>
          </View>
        </View>

        {/* Middle: bullet reasons */}
        <View style={styles.bulletZone}>
          {bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={[styles.check, { color: signalColor }]}>✓</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Right: confidence */}
        <View style={styles.confZone}>
          <Text style={styles.confEyebrow}>CONFIDENCE</Text>
          <Text style={[styles.confGrade, { color: signalColor }]}>{confidenceLabel}</Text>
          <View style={styles.confBars}>
            {BAR_HEIGHTS.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.confBar,
                  { height: h },
                  i < confidenceBars
                    ? { backgroundColor: signalColor }
                    : { backgroundColor: 'rgba(255,255,255,0.08)' },
                ]}
              />
            ))}
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
    padding: Spacing.xl,
    overflow: 'hidden',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  // Signal
  signalZone: { alignItems: 'center', width: 60, flexShrink: 0 },
  signalText: { fontSize: 34, fontWeight: '900', letterSpacing: -0.5, lineHeight: 36 },
  shieldWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  shieldIcon: { fontSize: 20, fontWeight: '700' },

  // Bullets
  bulletZone: { flex: 1, gap: 7 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  check: { fontSize: 12, fontWeight: '700', lineHeight: 17 },
  bulletText: { flex: 1, fontSize: 11.5, fontWeight: '500', color: Colors.text2, lineHeight: 16 },

  // Confidence
  confZone: { alignItems: 'center', width: 60, flexShrink: 0 },
  confEyebrow: {
    fontSize: 8, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase',
    color: Colors.text3, marginBottom: 3,
  },
  confGrade: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3, marginBottom: 8 },
  confBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  confBar: { width: 7, borderRadius: 2 },
});
