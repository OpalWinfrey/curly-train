import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserState } from '../../data/userState';
import { PlayBoosterDetail } from '../../components/detail/PlayBoosterDetail';
import { CollectorBoosterDetail } from '../../components/detail/CollectorBoosterDetail';
import { SecretLairDetail } from '../../components/detail/SecretLairDetail';
import { Colors, Spacing, Radius } from '../../components/tokens';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { products, addRecentlyViewed } = useUserState();

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product) addRecentlyViewed(product.id);
  }, [product?.id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundIcon}>◇</Text>
          <Text style={styles.notFoundTitle}>Product Not Found</Text>
          <Text style={styles.notFoundSub}>We couldn't find a product with that ID.</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (product.productType === 'play-booster-box' || product.productType === 'draft-booster-box' || product.productType === 'set-booster-box') {
    return <PlayBoosterDetail product={product} />;
  }

  if (product.productType === 'collector-booster-box') {
    return <CollectorBoosterDetail product={product} />;
  }

  if (product.productType === 'secret-lair') {
    return <SecretLairDetail product={product} />;
  }

  // Generic fallback for commander decks, bundles, etc.
  return <PlayBoosterDetail product={product} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxxl, gap: Spacing.md },
  notFoundIcon: { fontSize: 48, color: Colors.text3 },
  notFoundTitle: { fontSize: 20, fontWeight: '700', color: Colors.text1 },
  notFoundSub: { fontSize: 13, color: Colors.text3, textAlign: 'center' },
  backBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.xl, paddingVertical: 12, borderRadius: Radius.lg, marginTop: Spacing.sm },
  backBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
