import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { Colors, Radius, Spacing } from './tokens';
import type { Product } from '../data/types';
import { scryfallSetIcon } from '../data/scryfall';

const TYPE_LABELS: Record<string, string> = {
  'play-booster-box':      'Play Booster Box',
  'collector-booster-box': 'Collector Booster Box',
  'draft-booster-box':     'Draft Booster Box',
  'set-booster-box':       'Set Booster Box',
  'bundle':                'Bundle',
  'commander-deck':        'Commander Deck',
  'secret-lair':           'Secret Lair',
};

const TYPE_COLORS: Record<string, [string, string]> = {
  'play-booster-box':      ['#1a3a6a', '#060d1a'],
  'collector-booster-box': ['#3a1a6a', '#0d061a'],
  'draft-booster-box':     ['#1a4a3a', '#060e0d'],
  'set-booster-box':       ['#3a2a1a', '#0e0a06'],
  'bundle':                ['#1a3a2a', '#060d0a'],
  'commander-deck':        ['#3a1a2a', '#0d060a'],
  'secret-lair':           ['#4a2a0a', '#150a02'],
};

interface Props {
  product: Product;
  onPress: () => void;
  onWatchlist?: () => void;
  isWatchlisted?: boolean;
  isOwned?: boolean;
  compact?: boolean;
}

function SetIcon({ setCode, size }: { setCode: string; size: number }) {
  const [error, setError] = useState(false);
  if (error) return null;
  return (
    <SvgUri
      width={size}
      height={size}
      uri={scryfallSetIcon(setCode)}
      onError={() => setError(true)}
    />
  );
}

export function ProductCard({ product, onPress, onWatchlist, isWatchlisted, isOwned, compact }: Props) {
  const gradColors = TYPE_COLORS[product.productType] ?? ['#1a1a3a', '#060610'];
  const priceChange = product.priceChangePct;
  const changePositive = priceChange >= 0;
  const iconSize = compact ? 32 : 40;

  return (
    <Pressable onPress={onPress} style={[styles.card, compact && styles.compact]}>
      {/* Art thumbnail with set icon */}
      <LinearGradient colors={gradColors} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} style={[styles.thumb, compact && styles.thumbCompact]}>
        <SetIcon setCode={product.setCode} size={iconSize} />
        {isOwned && <View style={styles.ownedDot} />}
      </LinearGradient>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.typeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{TYPE_LABELS[product.productType] ?? product.productType}</Text>
          </View>
          {isOwned && <Text style={styles.ownedTag}>OWNED</Text>}
        </View>
        <Text style={styles.name} numberOfLines={compact ? 1 : 2}>{product.name}</Text>
        {!compact && <Text style={styles.setName}>{product.setName}</Text>}

        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.currentMarketPrice.toFixed(2)}</Text>
          <View style={[styles.changePill, changePositive ? styles.pillUp : styles.pillDown]}>
            <Text style={[styles.changeText, changePositive ? styles.textUp : styles.textDown]}>
              {changePositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Watchlist button */}
      {onWatchlist && (
        <Pressable onPress={onWatchlist} hitSlop={8} style={styles.watchBtn}>
          <Text style={[styles.watchIcon, isWatchlisted && styles.watchIconActive]}>
            {isWatchlisted ? '♥' : '♡'}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  compact: { borderRadius: Radius.md },
  thumb: {
    width: 72,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  thumbCompact: { width: 56, height: 64 },
  ownedDot: {
    position: 'absolute',
    top: 6, right: 6,
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  info: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 3 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  typeBadge: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  typeText: { fontSize: 9, fontWeight: '700', color: Colors.accent, letterSpacing: 0.5, textTransform: 'uppercase' },
  ownedTag: { fontSize: 9, fontWeight: '800', color: Colors.success, letterSpacing: 0.5 },
  name: { fontSize: 13, fontWeight: '700', color: Colors.text1, letterSpacing: -0.3, lineHeight: 17 },
  setName: { fontSize: 11, color: Colors.text3, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  changePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  pillUp: { backgroundColor: Colors.successBg },
  pillDown: { backgroundColor: Colors.dangerBg },
  changeText: { fontSize: 10, fontWeight: '600', fontVariant: ['tabular-nums'] },
  textUp: { color: Colors.success },
  textDown: { color: Colors.danger },
  watchBtn: { padding: Spacing.md, paddingLeft: 0 },
  watchIcon: { fontSize: 20, color: Colors.text3 },
  watchIconActive: { color: Colors.danger },
});
