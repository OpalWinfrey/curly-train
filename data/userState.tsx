import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import type { CollectionItem, WatchlistItem, Product, UserPreferences } from './types';
import { PRODUCTS, makeHistory } from './products';
import { fetchSealedPrices } from './manapool';
import { fetchScryfallSets } from './scryfall';
import { buildProductCatalog, buildCatalogFromScryfall } from './productCatalog';

const DEFAULT_PREFS: UserPreferences = {
  currency: 'USD',
  marketplace: 'TCGPlayer',
  sellingFeePct: 12.9,
  taxRatePct: 0,
};

interface UserState {
  products: Product[];
  productsLoading: boolean;
  refreshProducts: () => void;
  collection: CollectionItem[];
  watchlist: WatchlistItem[];
  recentlyViewed: string[];
  isLoading: boolean;
  preferences: UserPreferences;
  addToCollection: (item: Omit<CollectionItem, 'id' | 'userId'>) => Promise<void>;
  updateCollectionItem: (id: string, updates: Partial<CollectionItem>) => Promise<void>;
  removeFromCollection: (id: string) => Promise<void>;
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'userId'>) => Promise<void>;
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  moveWatchlistToCollection: (watchlistId: string, purchasePrice: number, quantity: number, purchaseDate: string, notes?: string, condition?: CollectionItem['condition']) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  addRecentlyViewed: (productId: string) => void;
  isInCollection: (productId: string) => boolean;
  isInWatchlist: (productId: string) => boolean;
  getCollectionItem: (productId: string) => CollectionItem | undefined;
  getWatchlistItem: (productId: string) => WatchlistItem | undefined;
}

const UserStateContext = createContext<UserState | null>(null);

function toCollectionItem(row: Record<string, unknown>): CollectionItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    productId: row.product_id as string,
    quantity: row.quantity as number,
    purchasePrice: Number(row.purchase_price),
    purchaseDate: (row.purchase_date as string) ?? '',
    condition: row.condition as CollectionItem['condition'],
    notes: row.notes as string | undefined,
  };
}

function toWatchlistItem(row: Record<string, unknown>): WatchlistItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    productId: row.product_id as string,
    targetPrice: Number(row.target_price),
    dateAdded: (row.date_added as string) ?? '',
    notes: row.notes as string | undefined,
  };
}

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const [scryfallSets, manapoolListings] = await Promise.allSettled([
        fetchScryfallSets(),
        fetchSealedPrices(),
      ]);

      if (scryfallSets.status === 'rejected') throw scryfallSets.reason;
      const sets = scryfallSets.value;
      const scryfallCatalog = buildCatalogFromScryfall(sets);

      const priceById = new Map<string, number>();
      const priceByTypeKey = new Map<string, number>();
      let pricedExpanded: Product[] = [];
      let expandedKeys = new Set<string>();

      try {
        if (manapoolListings.status === 'rejected') throw manapoolListings.reason;
        const priced = buildProductCatalog(manapoolListings.value, sets);
        for (const p of priced) {
          priceById.set(p.id, p.currentMarketPrice);
          priceByTypeKey.set(`${p.setCode.toLowerCase()}-${p.productType}`, p.currentMarketPrice);
        }
        // Find setCode+productType pairs with multiple Manapool entries (individual commander decks)
        const pricedKeyCount = new Map<string, number>();
        for (const p of priced) {
          const key = `${p.setCode.toLowerCase()}-${p.productType}`;
          pricedKeyCount.set(key, (pricedKeyCount.get(key) ?? 0) + 1);
        }
        expandedKeys = new Set([...pricedKeyCount.entries()].filter(([, n]) => n > 1).map(([k]) => k));
        pricedExpanded = priced.filter(p => expandedKeys.has(`${p.setCode.toLowerCase()}-${p.productType}`));
      } catch (err) {
        console.warn('[VaultMark] Manapool price fetch failed, products will show Price N/A:', err);
      }

      const staticKeys = new Set(PRODUCTS.map(p => `${p.setCode}-${p.productType}`));
      const extra = scryfallCatalog
        .filter(p => !staticKeys.has(`${p.setCode}-${p.productType}`) && !expandedKeys.has(`${p.setCode.toLowerCase()}-${p.productType}`))
        .map(p => {
          const price = priceById.get(p.id) ?? priceByTypeKey.get(`${p.setCode.toLowerCase()}-${p.productType}`);
          return price != null && price > 0
            ? { ...p, currentMarketPrice: price, priceHistory: makeHistory(price, 'flat') }
            : p;
        });

      const finalProducts = [...PRODUCTS, ...extra, ...pricedExpanded];
      setProducts(finalProducts);

      // Record daily price snapshot for every product with a known price
      const today = new Date().toISOString().split('T')[0];
      const snaps = finalProducts
        .filter(p => p.currentMarketPrice > 0)
        .map(p => ({ product_id: p.id, price: p.currentMarketPrice, recorded_at: today }));
      // Batch insert in chunks of 50 to stay within request limits
      for (let i = 0; i < snaps.length; i += 50) {
        supabase
          .from('price_snapshots')
          .upsert(snaps.slice(i, i + 50), { onConflict: 'product_id,recorded_at' })
          .then();
      }
    } catch (err) {
      console.warn('[VaultMark] Scryfall fetch failed, using static catalog:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }
    setIsLoading(true);

    Promise.all([
      supabase.from('collection_items').select('*').eq('user_id', userId),
      supabase.from('watchlist_items').select('*').eq('user_id', userId),
      supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
    ]).then(([col, watch, prefs]) => {
      if (col.data) setCollection(col.data.map(toCollectionItem));
      if (watch.data) setWatchlist(watch.data.map(toWatchlistItem));
      if (prefs.data) {
        setPreferences({
          currency: prefs.data.currency,
          marketplace: prefs.data.marketplace,
          sellingFeePct: Number(prefs.data.selling_fee_pct),
          taxRatePct: Number(prefs.data.tax_rate_pct),
        });
        setRecentlyViewed((prefs.data.recently_viewed as string[] | null) ?? []);
      }
      setIsLoading(false);
    }).catch(err => {
      console.warn('[VaultMark] Failed to load user data:', err);
      setIsLoading(false);
    });
  }, [userId]);

  const addToCollection = useCallback(async (item: Omit<CollectionItem, 'id' | 'userId'>) => {
    if (!userId) return;
    const existing = collection.find(c => c.productId === item.productId);
    if (existing) {
      const updates = {
        quantity: existing.quantity + item.quantity,
        purchase_price: item.purchasePrice,
        purchase_date: item.purchaseDate,
        condition: item.condition,
        notes: item.notes ?? existing.notes,
      };
      const { data, error } = await supabase
        .from('collection_items').update(updates).eq('id', existing.id).select().single();
      if (error) throw new Error(error.message);
      if (data) setCollection(prev => prev.map(c => c.id === existing.id ? toCollectionItem(data) : c));
    } else {
      const { data, error } = await supabase.from('collection_items').insert({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        purchase_date: item.purchaseDate,
        condition: item.condition,
        notes: item.notes,
      }).select().single();
      if (error) throw new Error(error.message);
      if (data) setCollection(prev => [...prev, toCollectionItem(data)]);
    }
  }, [userId, collection]);

  const updateCollectionItem = useCallback(async (id: string, updates: Partial<CollectionItem>) => {
    if (!userId) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    const { data, error } = await supabase
      .from('collection_items').update(dbUpdates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) setCollection(prev => prev.map(c => c.id === id ? toCollectionItem(data) : c));
  }, [userId]);

  const removeFromCollection = useCallback(async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('collection_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setCollection(prev => prev.filter(c => c.id !== id));
  }, [userId]);

  const addToWatchlist = useCallback(async (item: Omit<WatchlistItem, 'id' | 'userId'>) => {
    if (!userId) return;
    if (watchlist.find(w => w.productId === item.productId)) return;
    const { data, error } = await supabase.from('watchlist_items').insert({
      user_id: userId,
      product_id: item.productId,
      target_price: item.targetPrice,
      date_added: item.dateAdded,
      notes: item.notes,
    }).select().single();
    if (error) throw new Error(error.message);
    if (data) setWatchlist(prev => [...prev, toWatchlistItem(data)]);
  }, [userId, watchlist]);

  const updateWatchlistItem = useCallback(async (id: string, updates: Partial<WatchlistItem>) => {
    if (!userId) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.targetPrice !== undefined) dbUpdates.target_price = updates.targetPrice;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    const { data, error } = await supabase
      .from('watchlist_items').update(dbUpdates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    if (data) setWatchlist(prev => prev.map(w => w.id === id ? toWatchlistItem(data) : w));
  }, [userId]);

  const removeFromWatchlist = useCallback(async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('watchlist_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }, [userId]);

  const moveWatchlistToCollection = useCallback(async (
    watchlistId: string, purchasePrice: number, quantity: number, purchaseDate: string, notes?: string, condition: CollectionItem['condition'] = 'NM'
  ) => {
    const wItem = watchlist.find(w => w.id === watchlistId);
    if (!wItem) return;
    await addToCollection({ productId: wItem.productId, quantity, purchasePrice, purchaseDate, notes, condition });
    await removeFromWatchlist(watchlistId);
  }, [watchlist, addToCollection, removeFromWatchlist]);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    if (!userId) return;
    const next = { ...preferences, ...prefs };
    setPreferences(next);
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      currency: next.currency,
      marketplace: next.marketplace,
      selling_fee_pct: next.sellingFeePct,
      tax_rate_pct: next.taxRatePct,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }, [userId, preferences]);

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prev => {
      const next = [productId, ...prev.filter(id => id !== productId)].slice(0, 20);
      if (userId) {
        supabase.from('user_preferences')
          .upsert({ user_id: userId, recently_viewed: next, updated_at: new Date().toISOString() })
          .then();
      }
      return next;
    });
  }, [userId]);

  const isInCollection = useCallback((productId: string) => collection.some(c => c.productId === productId), [collection]);
  const isInWatchlist = useCallback((productId: string) => watchlist.some(w => w.productId === productId), [watchlist]);
  const getCollectionItem = useCallback((productId: string) => collection.find(c => c.productId === productId), [collection]);
  const getWatchlistItem = useCallback((productId: string) => watchlist.find(w => w.productId === productId), [watchlist]);

  return (
    <UserStateContext.Provider value={{
      products, productsLoading, refreshProducts: loadProducts,
      collection, watchlist, recentlyViewed, isLoading, preferences,
      addToCollection, updateCollectionItem, removeFromCollection,
      addToWatchlist, updateWatchlistItem, removeFromWatchlist,
      moveWatchlistToCollection, updatePreferences, addRecentlyViewed,
      isInCollection, isInWatchlist, getCollectionItem, getWatchlistItem,
    }}>
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserState(): UserState {
  const ctx = useContext(UserStateContext);
  if (!ctx) throw new Error('useUserState must be used within UserStateProvider');
  return ctx;
}
