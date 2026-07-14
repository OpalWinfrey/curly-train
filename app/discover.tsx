import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { SearchBar } from '../components/SearchBar';
import { FilterChipRow } from '../components/FilterChip';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { Colors, Spacing } from '../components/tokens';
import { useUserState } from '../data/userState';
import type { ProductType } from '../data/types';

const TYPE_FILTERS = ['All', 'Play Booster Box', 'Collector Booster Box', 'Secret Lair', 'Bundle', 'Commander Deck'];
const TYPE_MAP: Record<string, ProductType | undefined> = {
  'Play Booster Box': 'play-booster-box',
  'Collector Booster Box': 'collector-booster-box',
  'Secret Lair': 'secret-lair',
  'Bundle': 'bundle',
  'Commander Deck': 'commander-deck',
};

const SORT_OPTIONS = ['Price: High', 'Price: Low', 'Name A–Z', 'Release Date'];

export default function DiscoverScreen() {
  const router = useRouter();
  const { products, isInWatchlist, addToWatchlist, removeFromWatchlist, getWatchlistItem } = useUserState();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sort, setSort] = useState('Price: High');

  const filtered = useMemo(() => {
    let results = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.setName.toLowerCase().includes(q) ||
        p.setCode.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'All') {
      const mappedType = TYPE_MAP[typeFilter];
      if (mappedType) results = results.filter(p => p.productType === mappedType);
    }

    results.sort((a, b) => {
      if (sort === 'Price: High') return b.currentMarketPrice - a.currentMarketPrice;
      if (sort === 'Price: Low') return a.currentMarketPrice - b.currentMarketPrice;
      if (sort === 'Name A–Z') return a.name.localeCompare(b.name);
      if (sort === 'Release Date') return b.releaseDate.localeCompare(a.releaseDate);
      return 0;
    });

    return results;
  }, [query, typeFilter, sort]);

  function toggleWatchlist(productId: string) {
    const wItem = getWatchlistItem(productId);
    if (wItem) {
      removeFromWatchlist(wItem.id);
    } else {
      const product = products.find(p => p.id === productId);
      if (product) {
        addToWatchlist({ productId, targetPrice: product.currentMarketPrice, dateAdded: new Date().toISOString().split('T')[0] });
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>{products.length} products</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search products, sets, formats…" autoFocus={false} />
      </View>

      <FilterChipRow options={TYPE_FILTERS} value={typeFilter} onChange={setTypeFilter} />

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {SORT_OPTIONS.map(s => (
          <SortPill key={s} label={s} active={sort === s} onPress={() => setSort(s)} />
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="⌕"
          title="No Products Found"
          subtitle={`No results for "${query}". Try a different search term or filter.`}
          ctaLabel="Clear Search"
          onCta={() => { setQuery(''); setTypeFilter('All'); }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            query || typeFilter !== 'All' ? (
              <Text style={styles.resultCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onWatchlist={() => toggleWatchlist(item.id)}
              isWatchlisted={isInWatchlist(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function SortPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[sortStyles.pill, active && sortStyles.active]}>
      <Text style={[sortStyles.text, active && sortStyles.activeText]}>{label}</Text>
    </Pressable>
  );
}

const sortStyles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  active: { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: Colors.accent },
  text: { fontSize: 11, fontWeight: '600', color: Colors.text3 },
  activeText: { color: Colors.accent },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text1, letterSpacing: -1 },
  subtitle: { fontSize: 12, color: Colors.text3, marginTop: 2 },
  searchWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: 6, flexWrap: 'wrap' },
  sortLabel: { fontSize: 11, fontWeight: '600', color: Colors.text3 },
  list: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xxxl },
  resultCount: { fontSize: 12, color: Colors.text3, marginBottom: Spacing.sm },
});
