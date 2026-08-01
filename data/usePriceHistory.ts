import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PricePoint } from './types';

const cache = new Map<string, { data: PricePoint[]; ts: number }>();
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function usePriceHistory(productId: string): { loading: boolean; priceHistory: PricePoint[] } {
  const entry = cache.get(productId);
  const isFresh = entry && Date.now() - entry.ts < TTL_MS;
  const [loading, setLoading] = useState(!isFresh);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>(isFresh ? entry.data : []);

  useEffect(() => {
    const e = cache.get(productId);
    if (e && Date.now() - e.ts < TTL_MS) return;

    let active = true;
    setLoading(true);

    supabase
      .from('price_snapshots')
      .select('price, recorded_at')
      .eq('product_id', productId)
      .order('recorded_at', { ascending: true })
      .then(({ data }) => {
        if (!active) return;
        const points: PricePoint[] = (data ?? []).map(r => ({
          price: Number(r.price),
          date: r.recorded_at as string,
        }));
        cache.set(productId, { data: points, ts: Date.now() });
        setPriceHistory(points);
        setLoading(false);
      });

    return () => { active = false; };
  }, [productId]);

  return { loading, priceHistory };
}
