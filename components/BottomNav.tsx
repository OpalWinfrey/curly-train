import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from './tokens';

const TABS = [
  {
    id: 'home',
    label: 'Home',
    paths: ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  },
  {
    id: 'products',
    label: 'Products',
    paths: ['M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z', 'M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12'],
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    paths: ['M18 20V10M12 20V4M6 20v-6'],
  },
  {
    id: 'profile',
    label: 'Profile',
    paths: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  },
];

interface Props {
  activeTab?: string;
}

export function BottomNav({ activeTab = 'products' }: Props) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        const color = isActive ? Colors.accent : Colors.text3;
        return (
          <Pressable key={tab.id} style={styles.tab}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke={color} strokeWidth={isActive ? 2.2 : 1.7}
              strokeLinecap="round" strokeLinejoin="round">
              {tab.paths.map((p, i) => <Path key={i} d={p} />)}
            </Svg>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            {isActive && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  dot: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
});
