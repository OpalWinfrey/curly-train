import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import type { Product } from '../data/types';

interface Props {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (targetPrice: number, notes: string) => void;
}

export function AddToWatchlistModal({ visible, product, onClose, onSave }: Props) {
  const [targetPrice, setTargetPrice] = useState('');
  const [notes, setNotes] = useState('');

  if (!product) return null;

  function handleSave() {
    const price = parseFloat(targetPrice) || product!.currentMarketPrice;
    onSave(price, notes);
    setTargetPrice('');
    setNotes('');
  }

  const diffFromCurrent = product.currentMarketPrice - (parseFloat(targetPrice) || 0);
  const hasValidTarget = parseFloat(targetPrice) > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add to Watchlist</Text>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

          <View style={styles.currentPriceRow}>
            <Text style={styles.currentLabel}>Current Market Price</Text>
            <Text style={styles.currentPrice}>${product.currentMarketPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>TARGET PRICE</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.currencySign}>$</Text>
                <TextInput
                  style={styles.input}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  placeholder={product.currentMarketPrice.toFixed(2)}
                  placeholderTextColor={Colors.text3}
                  keyboardType="decimal-pad"
                  autoFocus
                  selectTextOnFocus
                />
              </View>
              {hasValidTarget && (
                <Text style={[styles.hint, diffFromCurrent >= 0 ? styles.hintGood : styles.hintBad]}>
                  {diffFromCurrent >= 0
                    ? `${((diffFromCurrent / product.currentMarketPrice) * 100).toFixed(1)}% below current price`
                    : `${((-diffFromCurrent / product.currentMarketPrice) * 100).toFixed(1)}% above current price`}
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NOTES (optional)</Text>
              <View style={[styles.inputWrap, styles.notesWrap]}>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Why you're watching this…"
                  placeholderTextColor={Colors.text3}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Add to Watchlist</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text1, textAlign: 'center', letterSpacing: -0.5, marginBottom: 4 },
  productName: { fontSize: 12, color: Colors.text3, textAlign: 'center', paddingHorizontal: Spacing.xl },
  currentPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentLabel: { fontSize: 12, color: Colors.text3, fontWeight: '600' },
  currentPrice: { fontSize: 16, fontWeight: '800', color: Colors.text1, fontVariant: ['tabular-nums'] },
  form: { padding: Spacing.xl, gap: Spacing.lg },
  field: {},
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  notesWrap: { height: 80, alignItems: 'flex-start', paddingVertical: Spacing.sm },
  currencySign: { fontSize: 16, color: Colors.text3, marginRight: 4 },
  input: { flex: 1, color: Colors.text1, fontSize: 16, fontWeight: '700', paddingVertical: 0 },
  notesInput: { fontSize: 14, fontWeight: '400', height: 64, textAlignVertical: 'top' },
  hint: { fontSize: 11, fontWeight: '600', marginTop: 5 },
  hintGood: { color: Colors.success },
  hintBad: { color: Colors.warning },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border2,
  },
  cancelBtn: {
    flex: 1, height: 48, borderRadius: Radius.lg,
    backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: Colors.text2 },
  saveBtn: { flex: 2, height: 48, borderRadius: Radius.lg, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
