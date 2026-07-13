import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Colors, Radius, Spacing } from './tokens';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search products, sets…', onFocus, autoFocus, editable = true }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>⌕</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.text3}
        onFocus={onFocus}
        autoFocus={autoFocus}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} style={styles.clear}>
          <Text style={styles.clearText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  icon: { fontSize: 18, color: Colors.text3, lineHeight: 22 },
  input: {
    flex: 1,
    color: Colors.text1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clear: {
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { fontSize: 10, color: Colors.text3, lineHeight: 12 },
});
