import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Colors, Radius, Spacing } from './tokens';
import type { Product, Condition } from '../data/types';

interface Props {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (quantity: number, purchasePrice: number, purchaseDate: string, condition: Condition, notes: string) => void;
}

const CONDITIONS: Condition[] = ['NM', 'LP', 'MP', 'HP', 'DMG'];

export function AddToCollectionModal({ visible, product, onClose, onSave }: Props) {
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState<Condition>('NM');
  const [notes, setNotes] = useState('');

  if (!product) return null;

  function handleSave() {
    const qty = parseInt(quantity) || 1;
    const purchasePrice = parseFloat(price) || product!.currentMarketPrice;
    onSave(qty, purchasePrice, date, condition, notes);
    setQuantity('1');
    setPrice('');
    setNotes('');
    setCondition('NM');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Add to Collection</Text>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>QUANTITY</Text>
                <View style={styles.qtyRow}>
                  <Pressable onPress={() => setQuantity((q: string) => String(Math.max(1, parseInt(q) - 1)))} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </Pressable>
                  <TextInput
                    style={styles.qtyInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <Pressable onPress={() => setQuantity((q: string) => String(parseInt(q) + 1))} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PURCHASE PRICE</Text>
                <View style={styles.inputWrap}>
                  <Text style={styles.currencySign}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder={product.currentMarketPrice.toFixed(2)}
                    placeholderTextColor={Colors.text3}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>PURCHASE DATE</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.text3}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>CONDITION</Text>
              <View style={styles.condRow}>
                {CONDITIONS.map(c => (
                  <Pressable key={c} onPress={() => setCondition(c)} style={[styles.condChip, condition === c && styles.condActive]}>
                    <Text style={[styles.condText, condition === c && styles.condTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>NOTES (optional)</Text>
              <View style={[styles.inputWrap, styles.notesWrap]}>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any notes about this purchase…"
                  placeholderTextColor={Colors.text3}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={{ height: Spacing.lg }} />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveText}>Add to Collection</Text>
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
    maxHeight: '90%',
  },
  handle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text1, textAlign: 'center', letterSpacing: -0.5, marginBottom: 4 },
  productName: { fontSize: 12, color: Colors.text3, textAlign: 'center', marginBottom: Spacing.xl, paddingHorizontal: Spacing.xl },
  form: { paddingHorizontal: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.md },
  field: { flex: 1, marginBottom: Spacing.lg },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.text3, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  notesWrap: { height: 80, alignItems: 'flex-start', paddingVertical: Spacing.sm },
  currencySign: { fontSize: 15, color: Colors.text3, marginRight: 4 },
  input: { flex: 1, color: Colors.text1, fontSize: 14, fontWeight: '600', paddingVertical: 0 },
  notesInput: { height: 64, textAlignVertical: 'top' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: {
    width: 36, height: 44,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 20, color: Colors.accent, lineHeight: 24 },
  qtyInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.surface2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    color: Colors.text1,
    fontSize: 16,
    fontWeight: '700',
  },
  condRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  condChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  condActive: { backgroundColor: 'rgba(139,92,246,0.18)', borderColor: Colors.accent },
  condText: { fontSize: 12, fontWeight: '700', color: Colors.text3 },
  condTextActive: { color: Colors.accent },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border2,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: Colors.text2 },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
