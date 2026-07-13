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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map(opt => (
        <FilterChip key={opt} label={opt} active={value === opt} onPress={() => onChange(opt)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: 2 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderColor: Colors.accent,
  },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text3 },
  labelActive: { color: Colors.accent },
});
