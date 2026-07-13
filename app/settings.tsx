import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable, StatusBar } from 'react-native';

import { Colors, Spacing, Radius } from '../components/tokens';

function SettingRow({ label, value, onPress, note }: { label: string; value?: string; onPress?: () => void; note?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !onPress && styles.rowStatic]}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {note && <Text style={styles.rowNote}>{note}</Text>}
      </View>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Text style={styles.rowArrow}>›</Text>}
    </Pressable>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const [currency, setCurrency] = useState('USD');
  const [marketplace, setMarketplace] = useState('TCGPlayer');
  const [sellingFee, setSellingFee] = useState('12.9%');
  const [taxEstimate, setTaxEstimate] = useState('0%');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>VM</Text>
        </View>
        <View>
          <Text style={styles.username}>Collector</Text>
          <Text style={styles.version}>VaultMark · Mock Data Mode</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <SettingSection title="Preferences">
          <SettingRow
            label="Currency"
            value={currency}
            onPress={() => setCurrency(c => c === 'USD' ? 'EUR' : c === 'EUR' ? 'GBP' : 'USD')}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Preferred Marketplace"
            value={marketplace}
            onPress={() => setMarketplace(m => m === 'TCGPlayer' ? 'CardMarket' : m === 'CardMarket' ? 'eBay' : 'TCGPlayer')}
          />
          <View style={styles.divider} />
          <SettingRow
            label="App Theme"
            value="Dark"
            note="Light mode coming soon"
          />
        </SettingSection>

        <SettingSection title="Financial Settings">
          <SettingRow
            label="Selling Fee Assumption"
            value={sellingFee}
            onPress={() => setSellingFee(f => f === '12.9%' ? '10%' : f === '10%' ? '15%' : '12.9%')}
            note="Used in profit/loss calculations"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Default Tax Estimate"
            value={taxEstimate}
            onPress={() => setTaxEstimate(t => t === '0%' ? '15%' : t === '15%' ? '25%' : '0%')}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingRow label="Price Alerts" value="Coming Soon" />
          <View style={styles.divider} />
          <SettingRow label="New Release Alerts" value="Coming Soon" />
          <View style={styles.divider} />
          <SettingRow label="Watchlist Notifications" value="Coming Soon" />
        </SettingSection>

        <SettingSection title="Data">
          <SettingRow
            label="Data Source"
            value="Mock Data"
            note="Live TCGPlayer data coming in a future update"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Export Collection"
            onPress={() => {}}
            note="Export as CSV (coming soon)"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Import Collection"
            onPress={() => {}}
            note="Import from CSV (coming soon)"
          />
        </SettingSection>

        <SettingSection title="About">
          <SettingRow label="Version" value="1.0.0 (Alpha)" />
          <View style={styles.divider} />
          <SettingRow label="Data last updated" value="Mock data" />
          <View style={styles.divider} />
          <SettingRow
            label="Send Feedback"
            onPress={() => {}}
          />
        </SettingSection>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            VaultMark uses mock data for demonstration purposes. Market prices shown are illustrative and not real-time data. Always verify prices on TCGPlayer or CardMarket before making purchasing decisions.
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(139,92,246,0.2)', borderWidth: 2, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: Colors.accent },
  username: { fontSize: 20, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5 },
  version: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, paddingHorizontal: 4 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm, minHeight: 52 },
  rowStatic: { opacity: 0.8 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.text1 },
  rowNote: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.text3 },
  rowArrow: { fontSize: 18, color: Colors.text3, lineHeight: 20 },
  divider: { height: 1, backgroundColor: Colors.border2, marginLeft: Spacing.lg },
  disclaimer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  disclaimerText: { fontSize: 11, color: Colors.text3, lineHeight: 17 },
});
