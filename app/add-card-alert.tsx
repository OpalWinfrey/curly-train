import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, FlatList, ScrollView,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

import { SearchBar } from '../components/SearchBar';
import { Colors, Spacing, Radius } from '../components/tokens';
import { useUserState } from '../data/userState';
import { searchCards, type ScryfallCardSummary } from '../data/scryfall';
import { currencySymbol } from '../data/formatPrice';
import type { CardAlert } from '../data/types';

type Step = 'search' | 'details';

export default function AddCardAlertScreen() {
  const router = useRouter();
  const { addCardAlert, preferences } = useUserState();

  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCardSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ScryfallCardSummary | null>(null);

  const [targetPrice, setTargetPrice] = useState('');
  const [finish, setFinish] = useState<CardAlert['finish']>('nonfoil');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) { setResults([]); setSearching(false); return; }
    setSearching(true);
    const handle = setTimeout(() => {
      searchCards(trimmed)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  function handleSelectCard(card: ScryfallCardSummary) {
    setSelectedCard(card);
    setStep('details');
  }

  function handleSave() {
    if (!selectedCard) return;
    const price = parseFloat(targetPrice);
    if (!targetPrice || isNaN(price) || price <= 0) {
      setError('Enter a valid target price');
      return;
    }
    setSaving(true);
    addCardAlert({
      scryfallId: selectedCard.scryfallId,
      cardName: selectedCard.name,
      setCode: selectedCard.setCode,
      collectorNumber: selectedCard.collectorNumber,
      finish,
      targetPriceCents: Math.round(price * 100),
      dateAdded: new Date().toISOString().split('T')[0],
    })
      .then(() => router.back())
      .catch(err => setError(err instanceof Error ? err.message : 'Could not save alert. Please try again.'))
      .finally(() => setSaving(false));
  }

  function goBack() {
    if (step === 'details') setStep('search');
    else router.back();
  }

  const symbol = currencySymbol(preferences.currency);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Add Card Alert</Text>
        <Text style={styles.stepIndicator}>Step {step === 'search' ? 1 : 2} of 2</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: step === 'search' ? '50%' : '100%' }]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 'search' && (
          <View style={{ flex: 1 }}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Find a Card</Text>
              <Text style={styles.stepSubtitle}>Search any Magic single by name</Text>
            </View>
            <View style={styles.searchWrap}>
              <SearchBar value={query} onChangeText={setQuery} autoFocus placeholder="Search card name…" />
            </View>
            {searching ? (
              <View style={styles.centerWrap}>
                <ActivityIndicator color={Colors.accent} />
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={c => `${c.scryfallId}`}
                contentContainerStyle={styles.searchList}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={query ? <Text style={styles.listHeader}>{`Results for "${query}"`}</Text> : null}
                ListEmptyComponent={query.trim() ? <Text style={styles.emptyText}>No cards found</Text> : null}
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleSelectCard(item)} style={styles.searchResult}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.resultMeta}>{item.setName} · #{item.collectorNumber}</Text>
                    </View>
                    <Text style={styles.resultArrow}>›</Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border2 }} />}
              />
            )}
          </View>
        )}

        {step === 'details' && selectedCard && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Set Your Target</Text>
              <Text style={styles.stepSubtitle} numberOfLines={2}>{selectedCard.name} ({selectedCard.setCode})</Text>
            </View>

            <Text style={styles.fieldLabel}>Finish</Text>
            <View style={styles.finishRow}>
              {(['nonfoil', 'foil'] as const).map(f => (
                <Pressable
                  key={f}
                  onPress={() => setFinish(f)}
                  style={[styles.finishChip, finish === f && styles.finishChipActive]}
                >
                  <Text style={[styles.finishChipText, finish === f && styles.finishChipTextActive]}>
                    {f === 'nonfoil' ? 'Non-foil' : 'Foil'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Alert me when listed at or below</Text>
            <View style={styles.priceInputWrap}>
              <Text style={styles.priceSymbol}>{symbol}</Text>
              <TextInput
                style={styles.priceInput}
                value={targetPrice}
                onChangeText={t => { setTargetPrice(t); setError(''); }}
                placeholder="1.00"
                placeholderTextColor={Colors.text3}
                keyboardType="decimal-pad"
              />
            </View>
            {error !== '' && <Text style={styles.errorText}>{error}</Text>}

            <Pressable onPress={handleSave} disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Alert'}</Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: Colors.text1, fontWeight: '600' },
  title: { fontSize: 15, fontWeight: '700', color: Colors.text1 },
  stepIndicator: { fontSize: 11, color: Colors.text3, fontWeight: '600' },
  progressTrack: { height: 2, backgroundColor: Colors.border2 },
  progressFill: { height: 2, backgroundColor: Colors.accent },
  stepHeader: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  stepTitle: { fontSize: 22, fontWeight: '800', color: Colors.text1, letterSpacing: -0.5 },
  stepSubtitle: { fontSize: 13, color: Colors.text3, marginTop: 4 },
  searchWrap: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  searchList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  listHeader: { fontSize: 11, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  emptyText: { fontSize: 13, color: Colors.text3, textAlign: 'center', marginTop: Spacing.xl },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchResult: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  resultInfo: { flex: 1, minWidth: 0 },
  resultName: { fontSize: 14, fontWeight: '700', color: Colors.text1 },
  resultMeta: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  resultArrow: { fontSize: 18, color: Colors.text3 },
  stepContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: Colors.text2, marginTop: Spacing.lg, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.4 },
  finishRow: { flexDirection: 'row', gap: Spacing.sm },
  finishChip: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  finishChipActive: { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: Colors.accent },
  finishChipText: { fontSize: 13, fontWeight: '700', color: Colors.text3 },
  finishChipTextActive: { color: Colors.accent },
  priceInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 48 },
  priceSymbol: { fontSize: 18, fontWeight: '700', color: Colors.text3, marginRight: 4 },
  priceInput: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text1 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: Spacing.sm },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.xl },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
