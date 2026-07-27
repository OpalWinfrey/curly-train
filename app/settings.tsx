import React, { useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, Share, Alert, Modal, TextInput,
} from 'react-native';

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

const CSV_HEADER = 'productId,name,quantity,purchasePrice,purchaseDate,condition,notes';

export default function SettingsScreen() {
  const { preferences, updatePreferences, collection, products, addToCollection } = useUserState();
  const { currency, marketplace, sellingFeePct, taxRatePct } = preferences;
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

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

  function handleImport() {
    setImportError('');
    const lines = importText.trim().split('\n').filter(l => l.trim());
    // skip header row if present
    const dataLines = lines[0]?.startsWith('productId') ? lines.slice(1) : lines;
    if (dataLines.length === 0) {
      setImportError('No rows found. Paste CSV rows below the header.');
      return;
    }
    let imported = 0;
    const errors: string[] = [];
    for (let i = 0; i < dataLines.length; i++) {
      const parts = dataLines[i].split(',');
      if (parts.length < 5) { errors.push(`Row ${i + 1}: not enough columns`); continue; }
      const [productId, , qtyStr, priceStr, purchaseDate, condition, ...notesParts] = parts;
      const quantity = parseInt(qtyStr, 10);
      const purchasePrice = parseFloat(priceStr);
      if (!productId.trim()) { errors.push(`Row ${i + 1}: missing productId`); continue; }
      if (isNaN(quantity) || quantity < 1) { errors.push(`Row ${i + 1}: invalid quantity`); continue; }
      if (isNaN(purchasePrice) || purchasePrice < 0) { errors.push(`Row ${i + 1}: invalid price`); continue; }
      addToCollection({
        productId: productId.trim(),
        quantity,
        purchasePrice,
        purchaseDate: purchaseDate?.trim() ?? new Date().toISOString().split('T')[0],
        condition: (condition?.trim() as 'NM' | 'LP' | 'MP' | 'HP' | 'DMG') ?? 'NM',
        notes: notesParts.join(',').trim() || undefined,
      });
      imported++;
    }
    if (errors.length > 0) {
      setImportError(errors.join('\n'));
    }
    if (imported > 0) {
      setShowImportModal(false);
      setImportText('');
      Alert.alert('Import complete', `${imported} item${imported !== 1 ? 's' : ''} added to your collection.`);
    }
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
          <SettingRow label="Currency" value={currency} onPress={cycleCurrency} />
          <View style={styles.divider} />
          <SettingRow label="Preferred Marketplace" value={marketplace} onPress={cycleMarketplace} />
          <View style={styles.divider} />
          <SettingRow label="App Theme" value="Dark" note="Light mode coming soon" />
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
            label="Price Source"
            value="Manapool (Live)"
            note="Prices updated every 5 minutes"
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
            onPress={() => { setImportText(''); setImportError(''); setShowImportModal(true); }}
            note="Paste CSV to add items to your collection"
          />
        </SettingSection>

        <SettingSection title="About">
          <SettingRow label="Version" value="1.0.0 (Alpha)" />
          <View style={styles.divider} />
          <SettingRow label="Price Source" value="Manapool" />
          <View style={styles.divider} />
          <SettingRow label="Send Feedback" onPress={() => {}} />
        </SettingSection>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Market prices are sourced from Manapool and updated every 5 minutes. Currency conversion rates are approximate. Always verify prices before making purchasing decisions.
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* CSV Import Modal */}
      <Modal visible={showImportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Import Collection</Text>
            <Text style={styles.modalSub}>
              Paste CSV rows below. Expected format:{'\n'}
              <Text style={styles.modalMono}>productId, name, qty, price, date, condition, notes</Text>
            </Text>
            <TextInput
              style={styles.csvInput}
              multiline
              numberOfLines={8}
              placeholder={`${CSV_HEADER}\nblg-bloomburrow-play-booster-box,Bloomburrow Play Booster Box,2,149.99,2024-08-02,NM,`}
              placeholderTextColor={Colors.text3}
              value={importText}
              onChangeText={t => { setImportText(t); setImportError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {importError !== '' && <Text style={styles.importError}>{importError}</Text>}
            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.modalBtnSecondary]} onPress={() => setShowImportModal(false)}>
                <Text style={styles.modalBtnSecText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleImport}>
                <Text style={styles.modalBtnPriText}>Import</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  disclaimer: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg },
  disclaimerText: { fontSize: 11, color: Colors.text3, lineHeight: 17 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, gap: Spacing.md, borderTopWidth: 1, borderColor: Colors.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.text1, letterSpacing: -0.3 },
  modalSub: { fontSize: 12, color: Colors.text3, lineHeight: 18 },
  modalMono: { fontSize: 11, color: Colors.accent, fontVariant: ['tabular-nums'] },
  csvInput: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text1,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    minHeight: 140,
    textAlignVertical: 'top',
  },
  importError: { fontSize: 11, color: Colors.danger, lineHeight: 16 },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
  modalBtn: { flex: 1, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  modalBtnPrimary: { backgroundColor: Colors.accent },
  modalBtnSecondary: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  modalBtnPriText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  modalBtnSecText: { fontSize: 14, fontWeight: '600', color: Colors.text2 },
});
