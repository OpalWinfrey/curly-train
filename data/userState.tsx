import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CollectionItem, WatchlistItem, Product } from './types';
import { PRODUCTS } from './products';
import { fetchSealedPrices } from './manapool';
import { fetchScryfallSets } from './scryfall';
import { buildProductCatalog, buildCatalogFromScryfall } from './productCatalog';

interface UserState {
  products: Product[];
  productsLoading: boolean;
  refreshProducts: () => void;
  collection: CollectionItem[];
  watchlist: WatchlistItem[];
  recentlyViewed: string[];
  addToCollection: (item: Omit<CollectionItem, 'id'>) => void;
  updateCollectionItem: (id: string, updates: Partial<CollectionItem>) => void;
  removeFromCollection: (id: string) => void;
  addToWatchlist: (item: Omit<WatchlistItem, 'id'>) => void;
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => void;
  removeFromWatchlist: (id: string) => void;
  moveWatchlistToCollection: (watchlistId: string, purchasePrice: number, quantity: number, purchaseDate: string, notes?: string) => void;
  addRecentlyViewed: (productId: string) => void;
  isInCollection: (productId: string) => boolean;
  isInWatchlist: (productId: string) => boolean;
  getCollectionItem: (productId: string) => CollectionItem | undefined;
  getWatchlistItem: (productId: string) => WatchlistItem | undefined;
}

const UserStateContext = createContext<UserState | null>(null);

let idCounter = 1;
function genId() { return `item-${idCounter++}`; }

export function UserStateProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      // Scryfall is always public — build the full catalog from it first
      const scryfallSets = await fetchScryfallSets();
      const scryfallCatalog = buildCatalogFromScryfall(scryfallSets);

      // Try Manapool price enrichment (may 403 — that's OK)
      const priceMap = new Map<string, number>();
      try {
        const listings = await fetchSealedPrices();
        const priced = buildProductCatalog(listings, scryfallSets);
        for (const p of priced) priceMap.set(p.id, p.currentMarketPrice);
      } catch (err) {
        console.warn('[VaultMark] Manapool price fetch failed, products will show Price N/A:', err);
      }

      // Static PRODUCTS carry rich metadata (EV, recommendations). Prefer them
      // for any set+type they cover; fill the rest from the Scryfall catalog.
      const staticKeys = new Set(PRODUCTS.map(p => `${p.setCode}-${p.productType}`));
      const extra = scryfallCatalog
        .filter(p => !staticKeys.has(`${p.setCode}-${p.productType}`))
        .map(p => {
          const price = priceMap.get(p.id);
          return price != null && price > 0 ? { ...p, currentMarketPrice: price } : p;
        });

      setProducts([...PRODUCTS, ...extra]);
    } catch (err) {
      console.warn('[VaultMark] Scryfall fetch failed, using static catalog:', err);
      // keep static PRODUCTS fallback
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const addToCollection = useCallback((item: Omit<CollectionItem, 'id'>) => {
    setCollection(prev => {
      const existing = prev.find(c => c.productId === item.productId);
      if (existing) {
        return prev.map(c => c.productId === item.productId
          ? { ...c, quantity: c.quantity + item.quantity, purchasePrice: item.purchasePrice, notes: item.notes ?? c.notes }
          : c);
      }
      return [...prev, { ...item, id: genId() }];
    });
  }, []);

  const updateCollectionItem = useCallback((id: string, updates: Partial<CollectionItem>) => {
    setCollection(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeFromCollection = useCallback((id: string) => {
    setCollection(prev => prev.filter(c => c.id !== id));
  }, []);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'id'>) => {
    setWatchlist(prev => {
      if (prev.find(w => w.productId === item.productId)) return prev;
      return [...prev, { ...item, id: genId() }];
    });
  }, []);

  const updateWatchlistItem = useCallback((id: string, updates: Partial<WatchlistItem>) => {
    setWatchlist(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }, []);

  const moveWatchlistToCollection = useCallback((watchlistId: string, purchasePrice: number, quantity: number, purchaseDate: string, notes?: string) => {
    const wItem = watchlist.find(w => w.id === watchlistId);
    if (!wItem) return;
    addToCollection({ productId: wItem.productId, quantity, purchasePrice, purchaseDate, notes, condition: 'NM' });
    setWatchlist(prev => prev.filter(w => w.id !== watchlistId));
  }, [watchlist, addToCollection]);

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 5);
    });
  }, []);

  const isInCollection = useCallback((productId: string) => collection.some(c => c.productId === productId), [collection]);
  const isInWatchlist = useCallback((productId: string) => watchlist.some(w => w.productId === productId), [watchlist]);
  const getCollectionItem = useCallback((productId: string) => collection.find(c => c.productId === productId), [collection]);
  const getWatchlistItem = useCallback((productId: string) => watchlist.find(w => w.productId === productId), [watchlist]);

  return (
    <UserStateContext.Provider value={{
      products, productsLoading, refreshProducts: loadProducts,
      collection, watchlist, recentlyViewed,
      addToCollection, updateCollectionItem, removeFromCollection,
      addToWatchlist, updateWatchlistItem, removeFromWatchlist,
      moveWatchlistToCollection, addRecentlyViewed,
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
