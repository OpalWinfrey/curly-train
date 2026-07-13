import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Radius } from './tokens';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon = '◇', title, subtitle, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <Pressable onPress={onCta} style={styles.btn}>
          <Text style={styles.btnText}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl, gap: Spacing.md },
  icon: { fontSize: 48, color: Colors.text3, marginBottom: Spacing.sm },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text1, textAlign: 'center', letterSpacing: -0.4 },
  sub: { fontSize: 13, color: Colors.text3, textAlign: 'center', lineHeight: 20 },
  btn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 11,
    borderRadius: Radius.lg,
  },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
