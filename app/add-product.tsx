import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  Pressable, StatusBar, FlatList, ScrollView,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { SearchBar } from '../components/SearchBar';
import { Colors, Spacing, Radius } from '../components/tokens';
import { useUserState } from '../data/userState';
import type { Product, Condition } from '../data/types';

type Step = 'search' | 'destination' | 'collection-details' | 'watchlist-details' | 'confirm';

const CONDITIONS: Condition[] = ['NM', 'LP', 'MP', 'HP', 'DMG'];

export default function AddProductScreen() {
  const router = useRouter();
  const { products, addToCollection, addToWatchlist } = useUserState();

  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [destination, setDestination] = useState<'collection' | 'watchlist' | null>(null);

  // Collection fields
  const [quantity, setQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState<Condition>('NM');
  const [notes, setNotes] = useState('');

  // Watchlist fields
  const [targetPrice, setTargetPrice] = useState('');
  const [watchNotes, setWatchNotes] = useState('');

  const searchResults = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.setName.toLowerCase().includes(query.toLowerCase())
      )
    : products.slice(0, 6);

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setPurchasePrice(product.currentMarketPrice.toFixed(2));
    setTargetPrice(product.currentMarketPrice.toFixed(2));
    setStep('destination');
  }

  function handleSave() {
    if (!selectedProduct) return;
    if (destination === 'collection') {
      addToCollection({
        productId: selectedProduct.id,
        quantity: parseInt(quantity) || 1,
        purchasePrice: parseFloat(purchasePrice) || selectedProduct.currentMarketPrice,
        purchaseDate,
        condition,
        notes,
      });
    } else if (destination === 'watchlist') {
      addToWatchlist({
        productId: selectedProduct.id,
        targetPrice: parseFloat(targetPrice) || selectedProduct.currentMarketPrice,
        dateAdded: new Date().toISOString().split('T')[0],
        notes: watchNotes,
      });
    }
    router.back();
  }

  function goBack() {
    if (step === 'destination') setStep('search');
    else if (step === 'collection-details' || step === 'watchlist-details') setStep('destination');
    else if (step === 'confirm') setStep(destination === 'collection' ? 'collection-details' : 'watchlist-details');
    else router.back();
  }

  const stepNums: Record<Step, number> = { search: 1, destination: 2, 'collection-details': 3, 'watchlist-details': 3, confirm: 4 };
  const stepNum = stepNums[step];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Add Product</Text>
        <Text style={styles.stepIndicator}>Step {stepNum} of 4</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(stepNum / 4) * 100}%` as any }]} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* STEP 1: Search */}
        {step === 'search' && (
          <View style={{ flex: 1 }}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Find a Product</Text>
              <Text style={styles.stepSubtitle}>Search for any sealed MTG product</Text>
            </View>
            <View style={styles.searchWrap}>
              <SearchBar value={query} onChangeText={setQuery} autoFocus placeholder="Search by name, set, or format…" />
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={p => p.id}
              contentContainerStyle={styles.searchList}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={<Text style={styles.listHeader}>{query ? `Results for "${query}"` : 'All Products'}</Text>}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelectProduct(item)} style={styles.searchResult}>
                  <LinearGradient
                    colors={item.productType === 'secret-lair' ? ['#4a1a80', '#1a0535'] : item.productType === 'collector-booster-box' ? ['#3a1a6a', '#0d061a'] : ['#1a3a6a', '#060d1a']}
                    style={styles.resultThumb}
                  >
                    <Text style={styles.resultCode}>{item.setCode}</Text>
                  </LinearGradient>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.resultMeta}>{item.setName}</Text>
                  </View>
                  <Text style={styles.resultPrice}>${item.currentMarketPrice.toFixed(2)}</Text>
                  <Text style={styles.resultArrow}>›</Text>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: Colors.border2 }} />}
            />
          </View>
        )}

        {/* STEP 2: Destination */}
        {step === 'destination' && selectedProduct && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Where to Add?</Text>
              <Text style={styles.stepSubtitle} numberOfLines={2}>{selectedProduct.name}</Text>
            </View>
            <Pressable onPress={() => { setDestination('collection'); setStep('collection-details'); }} style={styles.destCard}>
              <View style={styles.destIcon}><Text style={styles.destIconText}>◈</Text></View>
              <View style={styles.destInfo}>
                <Text style={styles.destTitle}>Add to Collection</Text>
                <Text style={styles.destDesc}>Record a product you own. Track purchase price, quantity, and current value.</Text>
              </View>
              <Text style={styles.destArrow}>›</Text>
            </Pressable>
            <Pressable onPress={() => { setDestination('watchlist'); setStep('watchlist-details'); }} style={styles.destCard}>
              <View style={styles.destIcon}><Text style={styles.destIconText}>◎</Text></View>
              <View style={styles.destInfo}>
                <Text style={styles.destTitle}>Add to Watchlist</Text>
                <Text style={styles.destDesc}>Monitor price and set a target to get notified when it hits your goal.</Text>
              </View>
              <Text style={styles.destArrow}>›</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* STEP 3a: Collection Details */}
        {step === 'collection-details' && selectedProduct && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Ownership Details</Text>
              <Text style={styles.stepSubtitle} numberOfLines={1}>{selectedProduct.name}</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>QUANTITY</Text>
                <View style={styles.qtyRow}>
                  <Pressable onPress={() => setQuantity(q => String(Math.max(1, parseInt(q) - 1)))} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <TextInput style={styles.qtyInput} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" selectTextOnFocus />
                  <Pressable onPress={() => setQuantity(q => String(parseInt(q) + 1))} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>PURCHASE PRICE</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.currSign}>$</Text>
                  <TextInput style={styles.textInput} value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" selectTextOnFocus />
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PURCHASE DATE</Text>
              <View style={styles.inputWrap}>
                <TextInput style={styles.textInput} value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.text3} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CONDITION</Text>
              <View style={styles.condRow}>
                {CONDITIONS.map(c => (
                  <Pressable key={c} onPress={() => setCondition(c)} style={[styles.condChip, condition === c && styles.condActive]}>
                    <Text style={[styles.condText, condition === c && styles.condTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOTES (optional)</Text>
              <View style={[styles.inputWrap, { height: 72, alignItems: 'flex-start', paddingVertical: 10 }]}>
                <TextInput style={[styles.textInput, { height: 52, textAlignVertical: 'top' }]} value={notes} onChangeText={setNotes} placeholder="Any notes…" placeholderTextColor={Colors.text3} multiline />
              </View>
            </View>

            <Pressable onPress={() => setStep('confirm')} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>Review & Save →</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* STEP 3b: Watchlist Details */}
        {step === 'watchlist-details' && selectedProduct && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Watchlist Details</Text>
              <Text style={styles.stepSubtitle} numberOfLines={1}>{selectedProduct.name}</Text>
            </View>

            <View style={styles.currentPriceBox}>
              <Text style={styles.currentPriceLabel}>Current Market Price</Text>
              <Text style={styles.currentPriceVal}>${selectedProduct.currentMarketPrice.toFixed(2)}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TARGET PRICE</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.currSign}>$</Text>
                <TextInput style={styles.textInput} value={targetPrice} onChangeText={setTargetPrice} keyboardType="decimal-pad" autoFocus selectTextOnFocus />
              </View>
              {parseFloat(targetPrice) > 0 && (
                <Text style={[styles.targetHint, parseFloat(targetPrice) <= selectedProduct.currentMarketPrice ? styles.hintGood : styles.hintBad]}>
                  {parseFloat(targetPrice) <= selectedProduct.currentMarketPrice
                    ? `${(((selectedProduct.currentMarketPrice - parseFloat(targetPrice)) / selectedProduct.currentMarketPrice) * 100).toFixed(1)}% below current price`
                    : `${(((parseFloat(targetPrice) - selectedProduct.currentMarketPrice) / selectedProduct.currentMarketPrice) * 100).toFixed(1)}% above current price`}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOTES (optional)</Text>
              <View style={[styles.inputWrap, { height: 72, alignItems: 'flex-start', paddingVertical: 10 }]}>
                <TextInput style={[styles.textInput, { height: 52, textAlignVertical: 'top' }]} value={watchNotes} onChangeText={setWatchNotes} placeholder="Why you're watching this…" placeholderTextColor={Colors.text3} multiline />
              </View>
            </View>

            <Pressable onPress={() => setStep('confirm')} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>Review & Save →</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* STEP 4: Confirm */}
        {step === 'confirm' && selectedProduct && (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Confirm</Text>
              <Text style={styles.stepSubtitle}>Review before saving</Text>
            </View>

            <View style={styles.confirmCard}>
              <Text style={styles.confirmProductName}>{selectedProduct.name}</Text>
              <View style={styles.divider} />
              {destination === 'collection' ? (
                <>
                  <ConfirmRow label="Adding to" value="Collection" />
                  <ConfirmRow label="Quantity" value={quantity} />
                  <ConfirmRow label="Purchase Price" value={`$${purchasePrice} each`} />
                  <ConfirmRow label="Purchase Date" value={purchaseDate} />
                  <ConfirmRow label="Condition" value={condition} />
                  {notes ? <ConfirmRow label="Notes" value={notes} /> : null}
                  <View style={styles.divider} />
                  <ConfirmRow label="Total Invested" value={`$${(parseFloat(purchasePrice || '0') * parseInt(quantity || '1')).toFixed(2)}`} highlight />
                </>
              ) : (
                <>
                  <ConfirmRow label="Adding to" value="Watchlist" />
                  <ConfirmRow label="Target Price" value={`$${targetPrice}`} />
                  <ConfirmRow label="Current Price" value={`$${selectedProduct.currentMarketPrice.toFixed(2)}`} />
                  {watchNotes ? <ConfirmRow label="Notes" value={watchNotes} /> : null}
                </>
              )}
            </View>

            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>
                {destination === 'collection' ? '✓ Add to Collection' : '✓ Add to Watchlist'}
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ConfirmRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={confirmRowStyles.row}>
      <Text style={confirmRowStyles.label}>{label}</Text>
      <Text style={[confirmRowStyles.value, highlight && confirmRowStyles.valueHighlight]}>{value}</Text>
    </View>
  );
}
const confirmRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 13, color: Colors.text3, fontWeight: '500' },
  value: { fontSize: 13, color: Colors.text1, fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: Spacing.md },
  valueHighlight: { color: Colors.success, fontSize: 15 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 22, color: Colors.text2, lineHeight: 26, marginTop: -2 },
  title: { fontSize: 16, fontWeight: '800', color: Colors.text1 },
  stepIndicator: { fontSize: 12, color: Colors.text3, fontWeight: '600' },
  progressTrack: { height: 2, backgroundColor: Colors.surface2, marginHorizontal: Spacing.lg, borderRadius: 1 },
  progressFill: { height: 2, backgroundColor: Colors.accent, borderRadius: 1 },
  stepHeader: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  stepTitle: { fontSize: 24, fontWeight: '800', color: Colors.text1, letterSpacing: -0.8 },
  stepSubtitle: { fontSize: 13, color: Colors.text3, marginTop: 4 },
  searchWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  searchList: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  listHeader: { fontSize: 11, fontWeight: '700', color: Colors.text3, letterSpacing: 0.5, marginBottom: Spacing.sm },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
  },
  resultThumb: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resultCode: { fontSize: 10, fontWeight: '900', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 13, fontWeight: '700', color: Colors.text1 },
  resultMeta: { fontSize: 11, color: Colors.text3, marginTop: 2 },
  resultPrice: { fontSize: 14, fontWeight: '800', color: Colors.accent, fontVariant: ['tabular-nums'] },
  resultArrow: { fontSize: 18, color: Colors.text3 },
  stepContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  destCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  destIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(139,92,246,0.15)', borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  destIconText: { fontSize: 22, color: Colors.accent },
  destInfo: { flex: 1 },
  destTitle: { fontSize: 16, fontWeight: '800', color: Colors.text1, marginBottom: 4 },
  destDesc: { fontSize: 12, color: Colors.text3, lineHeight: 17 },
  destArrow: { fontSize: 20, color: Colors.text3 },
  formRow: { flexDirection: 'row', gap: Spacing.md },
  field: {},
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 48 },
  currSign: { fontSize: 16, color: Colors.text3, marginRight: 4 },
  textInput: { flex: 1, color: Colors.text1, fontSize: 15, fontWeight: '600', paddingVertical: 0 },
  qtyRow: { flexDirection: 'row' },
  qtyBtn: { width: 40, height: 48, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  qtyBtnText: { fontSize: 20, color: Colors.accent, lineHeight: 24 },
  qtyInput: { flex: 1, height: 48, backgroundColor: Colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, textAlign: 'center', color: Colors.text1, fontSize: 16, fontWeight: '700' },
  condRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  condChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  condActive: { backgroundColor: 'rgba(139,92,246,0.18)', borderColor: Colors.accent },
  condText: { fontSize: 12, fontWeight: '700', color: Colors.text3 },
  condTextActive: { color: Colors.accent },
  currentPriceBox: { backgroundColor: Colors.surface2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentPriceLabel: { fontSize: 13, color: Colors.text3, fontWeight: '600' },
  currentPriceVal: { fontSize: 18, fontWeight: '800', color: Colors.text1, fontVariant: ['tabular-nums'] },
  targetHint: { fontSize: 11, fontWeight: '600', marginTop: 5 },
  hintGood: { color: Colors.success },
  hintBad: { color: Colors.warning },
  nextBtn: { backgroundColor: Colors.accent, borderRadius: Radius.lg, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  nextBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  confirmCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, gap: 2 },
  confirmProductName: { fontSize: 16, fontWeight: '800', color: Colors.text1, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border2, marginVertical: 8 },
  saveBtn: { backgroundColor: Colors.success, borderRadius: Radius.lg, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
