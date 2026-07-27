import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, Pressable, StatusBar, Share, Alert } from 'react-native';

import { Colors, Spacing, Radius } from '../components/tokens';
import { useUserState } from '../data/userState';

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

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const MARKETPLACES = ['TCGPlayer', 'CardMarket', 'eBay'];
const SELLING_FEES = [10, 12.9, 15];
const TAX_RATES = [0, 15, 25];

export default function SettingsScreen() {
  const { preferences, updatePreferences, collection, products } = useUserState();
  const { currency, marketplace, sellingFeePct, taxRatePct } = preferences;

  async function exportCSV() {
    if (collection.length === 0) {
      Alert.alert('Nothing to export', 'Add some products to your collection first.');
      return;
    }
    const header = 'Product ID,Name,Quantity,Purchase Price,Purchase Date,Condition,Notes';
    const rows = collection.map(item => {
      const product = products.find(p => p.id === item.productId);
      const name = (product?.name ?? '').replace(/"/g, '""');
      const notes = (item.notes ?? '').replace(/"/g, '""');
      return `${item.productId},"${name}",${item.quantity},${item.purchasePrice},${item.purchaseDate},${item.condition ?? ''},"${notes}"`;
    });
    const csv = [header, ...rows].join('\n');
    await Share.share({ title: 'VaultMark Collection', message: csv });
  }

  function cycleCurrency() {
    const next = CURRENCIES[(CURRENCIES.indexOf(currency) + 1) % CURRENCIES.length];
    updatePreferences({ currency: next });
  }
  function cycleMarketplace() {
    const next = MARKETPLACES[(MARKETPLACES.indexOf(marketplace) + 1) % MARKETPLACES.length];
    updatePreferences({ marketplace: next });
  }
  function cycleSellingFee() {
    const idx = SELLING_FEES.indexOf(sellingFeePct);
    const next = SELLING_FEES[(idx === -1 ? 1 : idx + 1) % SELLING_FEES.length];
    updatePreferences({ sellingFeePct: next });
  }
  function cycleTaxRate() {
    const idx = TAX_RATES.indexOf(taxRatePct);
    const next = TAX_RATES[(idx === -1 ? 0 : idx + 1) % TAX_RATES.length];
    updatePreferences({ taxRatePct: next });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>VM</Text>
        </View>
        <View>
          <Text style={styles.username}>Collector</Text>
          <Text style={styles.version}>VaultMark · Live Prices</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <SettingSection title="Preferences">
          <SettingRow
            label="Currency"
            value={currency}
            onPress={cycleCurrency}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Preferred Marketplace"
            value={marketplace}
            onPress={cycleMarketplace}
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
            value={`${sellingFeePct}%`}
            onPress={cycleSellingFee}
            note="Applied to net P&L calculations"
          />
          <View style={styles.divider} />
          <SettingRow
            label="Default Tax Estimate"
            value={`${taxRatePct}%`}
            onPress={cycleTaxRate}
            note="Applied to capital gains"
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
            onPress={exportCSV}
            note={`Export ${collection.length} item${collection.length !== 1 ? 's' : ''} as CSV`}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Import Collection"
            onPress={() => Alert.alert('Coming Soon', 'CSV import will be available in a future update.')}
            note="Import from CSV (coming soon)"
          />
        </SettingSection>

        <SettingSection title="About">
          <SettingRow label="Version" value="1.0.0 (Alpha)" />
          <View style={styles.divider} />
          <SettingRow label="Price Source" value="Manapool" />
          <View style={styles.divider} />
          <SettingRow
            label="Send Feedback"
            onPress={() => {}}
          />
        </SettingSection>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Market prices are sourced from Manapool and updated every 5 minutes. Currency conversion rates are approximate. Always verify prices before making purchasing decisions.
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
