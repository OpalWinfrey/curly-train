import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from './tokens';

type Signal = 'BUY' | 'HOLD' | 'WAIT' | 'SKIP';

interface Props {
  signal: Signal;
  rationale: string;
  confidence: number;
}

const SIGNAL_CONFIGS: Record<Signal, {
  label: string;
  sub: string;
  active: boolean;
  border: string;
  bg: string;
  textColor: string;
}> = {
  BUY:  { label: 'BUY',  sub: 'Strong signal', active: true,  border: 'rgba(139,92,246,0.38)', bg: 'rgba(139,92,246,0.14)', textColor: Colors.accent  },
  HOLD: { label: 'HOLD', sub: 'Neutral',        active: false, border: Colors.border,            bg: 'rgba(255,255,255,0.03)', textColor: Colors.text2  },
  WAIT: { label: 'WAIT', sub: 'Watch for dip',  active: false, border: 'rgba(245,158,11,0.18)',  bg: 'rgba(245,158,11,0.07)', textColor: Colors.warning },
  SKIP: { label: 'SKIP', sub: 'Not advised',    active: false, border: 'rgba(239,68,68,0.12)',   bg: 'rgba(239,68,68,0.05)', textColor: Colors.danger  },
};

function SignalButton({ cfg, isActive }: { cfg: typeof SIGNAL_CONFIGS.BUY; isActive: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, damping: 20 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 20 }).start();

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable onPressIn={onIn} onPressOut={onOut}>
        <View style={[styles.sigBtn, { borderColor: cfg.border, backgroundColor: cfg.bg }]}>
          {isActive && (
            <LinearGradient
              colors={['rgba(139,92,246,0.12)', 'transparent']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Text style={[styles.sigLabel, { color: cfg.textColor, opacity: isActive ? 1 : cfg.textColor === Colors.danger ? 0.55 : 1 }]}>
            {cfg.label}
          </Text>
          <Text style={[styles.sigSub, { color: cfg.textColor, opacity: isActive ? 0.7 : 0.4 }]}>
            {cfg.sub}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function RecommendationCard({ signal, rationale, confidence }: Props) {
  const ORDER: Signal[] = ['BUY', 'HOLD', 'WAIT', 'SKIP'];

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(139,92,246,0.05)', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {ORDER.slice(0, 2).map(s => (
            <SignalButton key={s} cfg={SIGNAL_CONFIGS[s]} isActive={s === signal} />
          ))}
        </View>
        <View style={styles.gridRow}>
          {ORDER.slice(2).map(s => (
            <SignalButton key={s} cfg={SIGNAL_CONFIGS[s]} isActive={s === signal} />
          ))}
        </View>
      </View>

      <View style={styles.rationale}>
        <Text style={styles.rationaleText}>{rationale}</Text>
      </View>

      <View style={styles.confRow}>
        <Text style={styles.confLabel}>Model Confidence</Text>
        <Text style={styles.confVal}>{confidence}%</Text>
      </View>
      <View style={styles.confTrack}>
        <LinearGradient
          colors={[Colors.accent2, Colors.accent]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.confFill, { width: `${confidence}%` }]}
        />
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
  grid: { gap: 8, marginBottom: Spacing.lg },
  gridRow: { flexDirection: 'row', gap: 8 },
  sigBtn: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  sigLabel: { fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  sigSub: { fontSize: 10, fontWeight: '500' },
  rationale: {
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: Spacing.md,
  },
  rationaleText: { fontSize: 13, lineHeight: 20, color: Colors.text2 },
  confRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  confLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: Colors.text3 },
  confVal: { fontSize: 13, fontWeight: '700', color: Colors.accent, fontVariant: ['tabular-nums'] },
  confTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 2 },
});
