import React from 'react';
import { Pressable, Text, StyleSheet, ScrollView, View } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

interface ChipRowProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterChipRow({ options, value, onChange }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map(opt => (
        <FilterChip key={opt} label={opt} active={value === opt} onPress={() => onChange(opt)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderColor: Colors.accent,
  },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text2 },
  labelActive: { color: Colors.accent },
});
