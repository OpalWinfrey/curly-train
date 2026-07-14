import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from './tokens';
import { scryfallCardArt } from '../data/scryfall';

export interface CardHit {
  name: string;
  rarity: 'M' | 'R' | 'U' | 'C';
  price: string;
  pullRate: string;
  pullPct: string;
  evContribution: string;
  artColors: [string, string];
  artInitial: string;
  setName?: string;
}

interface Props {
  hit: CardHit;
  isLast?: boolean;
}

const RARITY_STYLES: Record<string, { bg: [string, string]; text: string }> = {
  M: { bg: ['#D97706', '#F59E0B'], text: '#000' },
  R: { bg: ['#92400E', '#D97706'], text: '#FDE68A' },
  U: { bg: ['#1D4ED8', '#3B82F6'], text: '#BFDBFE' },
  C: { bg: ['#374151', '#6B7280'], text: '#D1D5DB' },
};

export function CardRow({ hit, isLast }: Props) {
  const rar = RARITY_STYLES[hit.rarity] ?? RARITY_STYLES.C;
  const [imgError, setImgError] = useState(false);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      {/* Thumbnail — card art if available, gradient fallback */}
      {!imgError ? (
        <Image
          source={{ uri: scryfallCardArt(hit.name) }}
          style={styles.thumb}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <LinearGradient colors={hit.artColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
          <Text style={styles.thumbInitial}>{hit.artInitial}</Text>
        </LinearGradient>
      )}

      {/* Name + set */}
      <View style={styles.nameCol}>
        <Text style={styles.cardName} numberOfLines={1}>{hit.name}</Text>
        {hit.setName ? <Text style={styles.setName}>{hit.setName}</Text> : null}
      </View>

      {/* Rarity badge */}
      <LinearGradient colors={rar.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rarityBadge}>
        <Text style={[styles.rarityText, { color: rar.text }]}>{hit.rarity}</Text>
      </LinearGradient>

      {/* Price */}
      <Text style={styles.price}>{hit.price}</Text>

      {/* Pull rate */}
      <View style={styles.pullCol}>
        <Text style={styles.pullRate}>1 in {hit.pullRate}</Text>
        <Text style={styles.pullPct}>({hit.pullPct})</Text>
      </View>

      {/* EV */}
      <Text style={styles.ev}>{hit.evContribution}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    gap: 8,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border2 },
  thumb: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: Colors.surface2, overflow: 'hidden' },
  thumbInitial: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  nameCol: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 12.5, fontWeight: '600', color: Colors.text1, letterSpacing: -0.2, lineHeight: 16 },
  setName: { fontSize: 10, color: Colors.text3, fontWeight: '500', marginTop: 1 },
  rarityBadge: { width: 18, height: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rarityText: { fontSize: 9, fontWeight: '900', fontStyle: 'italic' },
  price: { fontSize: 12.5, fontWeight: '700', color: Colors.text1, fontVariant: ['tabular-nums'], width: 48, textAlign: 'right' },
  pullCol: { width: 58, alignItems: 'flex-end' },
  pullRate: { fontSize: 11, fontWeight: '600', color: Colors.text2, fontVariant: ['tabular-nums'] },
  pullPct: { fontSize: 10, color: Colors.text3, fontVariant: ['tabular-nums'] },
  ev: { fontSize: 13, fontWeight: '700', color: Colors.success, fontVariant: ['tabular-nums'], width: 40, textAlign: 'right', letterSpacing: -0.3 },
});
