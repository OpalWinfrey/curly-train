import React from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from './tokens';

interface Props {
  productName: string;
  inWatchlist: boolean;
  onWatchlist: () => void;
}

export function DetailNavBar({ productName, inWatchlist, onWatchlist }: Props) {
  const router = useRouter();
  return (
    <View style={styles.nav}>
      <Pressable style={styles.navBtn} onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.navBtnText}>‹</Text>
      </Pressable>
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Text style={{ fontSize: 10, color: Colors.accent, fontWeight: '800' }}>VM</Text>
        </View>
        <Text style={styles.brandName}>VAULT<Text style={styles.brandAccent}>MARK</Text></Text>
      </View>
      <View style={styles.navActions}>
        <Pressable onPress={onWatchlist} style={styles.navBtn} hitSlop={8}>
          <Text style={[styles.navBtnIcon, inWatchlist && { color: Colors.danger }]}>{inWatchlist ? '♥' : '♡'}</Text>
        </Pressable>
        <Pressable
          style={styles.navBtn}
          hitSlop={8}
          onPress={() => Share.share({ message: `Check out ${productName} on VaultMark`, url: 'https://vaultmark-sealed.vercel.app' })}
        >
          <Text style={styles.navBtnIcon}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 22, color: Colors.text2, lineHeight: 26, marginTop: -2 },
  navBtnIcon: { fontSize: 16, color: Colors.text2 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandIcon: { width: 26, height: 26, borderRadius: 7, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5, color: '#fff' },
  brandAccent: { color: Colors.accent },
  navActions: { flexDirection: 'row', gap: 8 },
});
