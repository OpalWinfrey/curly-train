import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Typography } from './tokens';

interface Props {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ eyebrow, title, action, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.text3,
    marginBottom: 2,
  },
  title: {
    ...Typography.heading,
    color: Colors.text1,
  },
  action: {
    ...Typography.subheading,
    color: Colors.accent,
  },
});
