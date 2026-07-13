import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from './tokens';
import type { IncludedCard } from '../data/types';

const RARITY_STYLES: Record<string, { bg: [string, string]; text: string }> = {
  M: { bg: ['#D97706', '#F59E0B'], text: '#000' },
  R: { bg: ['#92400E', '#D97706'], text: '#FDE68A' },
  U: { bg: ['#1D4ED8', '#3B82F6'], text: '#BFDBFE' },
  C: { bg: ['#374151', '#6B7280'], text: '#D1D5DB' },
};

interface Props {
  card: IncludedCard;
  isLast?: boolean;
}

export function IncludedCardRow({ card, isLast }: Props) {
  const rar = RARITY_STYLES[card.rarity] ?? RARITY_STYLES.C;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <LinearGradient colors={card.artColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
        <Text style={styles.initial}>{card.artInitial}</Text>
      </LinearGradient>

      <View style={styles.nameCol}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
          {card.isBonus && (
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusText}>BONUS</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta}>
          {card.isFoil ? '✦ Foil · ' : ''}{card.rarity === 'M' ? 'Mythic Rare' : card.rarity === 'R' ? 'Rare' : card.rarity === 'U' ? 'Uncommon' : 'Common'}
        </Text>
      </View>

      <LinearGradient colors={rar.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rarityBadge}>
        <Text style={[styles.rarityText, { color: rar.text }]}>{card.rarity}</Text>
      </LinearGradient>

      <Text style={styles.price}>${card.price.toFixed(2)}</Text>
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
  thumb: { width: 32, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  initial: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  nameCol: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 12.5, fontWeight: '600', color: Colors.text1, letterSpacing: -0.2, lineHeight: 16, flex: 1 },
  bonusBadge: {
    backgroundColor: Colors.warnBg,
    borderWidth: 1,
    borderColor: Colors.warning,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bonusText: { fontSize: 8, fontWeight: '800', color: Colors.warning, letterSpacing: 0.5 },
  meta: { fontSize: 10, color: Colors.text3, marginTop: 1 },
  rarityBadge: { width: 18, height: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rarityText: { fontSize: 9, fontWeight: '900', fontStyle: 'italic' },
  price: { fontSize: 13, fontWeight: '700', color: Colors.success, fontVariant: ['tabular-nums'], width: 52, textAlign: 'right', letterSpacing: -0.3 },
});
