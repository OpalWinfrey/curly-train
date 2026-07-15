import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import type { CollectionItem, WatchlistItem, UserPreferences } from './types';

const DEFAULT_PREFS: UserPreferences = {
  currency: 'USD',
  marketplace: 'TCGPlayer',
  sellingFeePct: 12.9,
  taxRatePct: 0,
};

interface UserState {
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
  moveWatchlistToCollection: (watchlistId: string, purchasePrice: number, quantity: number, purchaseDate: string, notes?: string) => Promise<void>;
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

  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);

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
      }
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
        notes: item.notes ?? existing.notes,
      };
      const { data } = await supabase
        .from('collection_items').update(updates).eq('id', existing.id).select().single();
      if (data) setCollection(prev => prev.map(c => c.id === existing.id ? toCollectionItem(data) : c));
    } else {
      const { data } = await supabase.from('collection_items').insert({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
        purchase_date: item.purchaseDate,
        condition: item.condition,
        notes: item.notes,
      }).select().single();
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
    const { data } = await supabase
      .from('collection_items').update(dbUpdates).eq('id', id).select().single();
    if (data) setCollection(prev => prev.map(c => c.id === id ? toCollectionItem(data) : c));
  }, [userId]);

  const removeFromCollection = useCallback(async (id: string) => {
    if (!userId) return;
    await supabase.from('collection_items').delete().eq('id', id);
    setCollection(prev => prev.filter(c => c.id !== id));
  }, [userId]);

  const addToWatchlist = useCallback(async (item: Omit<WatchlistItem, 'id' | 'userId'>) => {
    if (!userId) return;
    if (watchlist.find(w => w.productId === item.productId)) return;
    const { data } = await supabase.from('watchlist_items').insert({
      user_id: userId,
      product_id: item.productId,
      target_price: item.targetPrice,
      date_added: item.dateAdded,
      notes: item.notes,
    }).select().single();
    if (data) setWatchlist(prev => [...prev, toWatchlistItem(data)]);
  }, [userId, watchlist]);

  const updateWatchlistItem = useCallback(async (id: string, updates: Partial<WatchlistItem>) => {
    if (!userId) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.targetPrice !== undefined) dbUpdates.target_price = updates.targetPrice;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    const { data } = await supabase
      .from('watchlist_items').update(dbUpdates).eq('id', id).select().single();
    if (data) setWatchlist(prev => prev.map(w => w.id === id ? toWatchlistItem(data) : w));
  }, [userId]);

  const removeFromWatchlist = useCallback(async (id: string) => {
    if (!userId) return;
    await supabase.from('watchlist_items').delete().eq('id', id);
    setWatchlist(prev => prev.filter(w => w.id !== id));
  }, [userId]);

  const moveWatchlistToCollection = useCallback(async (
    watchlistId: string, purchasePrice: number, quantity: number, purchaseDate: string, notes?: string
  ) => {
    const wItem = watchlist.find(w => w.id === watchlistId);
    if (!wItem) return;
    await addToCollection({ productId: wItem.productId, quantity, purchasePrice, purchaseDate, notes, condition: 'NM' });
    await removeFromWatchlist(watchlistId);
  }, [watchlist, addToCollection, removeFromWatchlist]);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    if (!userId) return;
    const next = { ...preferences, ...prefs };
    setPreferences(next);
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      currency: next.currency,
      marketplace: next.marketplace,
      selling_fee_pct: next.sellingFeePct,
      tax_rate_pct: next.taxRatePct,
      updated_at: new Date().toISOString(),
    });
  }, [userId, preferences]);

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
