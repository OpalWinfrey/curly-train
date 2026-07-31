import { useEffect, useState } from 'react';
import { ChartColors } from '../components/tokens';
import type { LiveEVData } from './types';

// Map the colorKey strings the API returns to actual color values from tokens
const COLOR_MAP: Record<string, string> = {
  mythics: ChartColors.mythics,
  rares: ChartColors.rares,
  foils: ChartColors.foils,
  showcase: ChartColors.showcase,
  specialGuests: ChartColors.specialGuests,
  serialized: ChartColors.serialized,
  bulk: ChartColors.bulk,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { data: LiveEVData; ts: number }>();
const inflight = new Map<string, Promise<LiveEVData | null>>();

function getCached(key: string): LiveEVData | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}

function apiType(productType: string): string {
  if (productType === 'play-booster-case') return 'play-booster-box';
  if (productType === 'collector-booster-case') return 'collector-booster-box';
  return productType;
}

function fetchEV(setCode: string, normalizedType: string, key: string): Promise<LiveEVData | null> {
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = fetch(`/api/set-ev?setCode=${encodeURIComponent(setCode.toUpperCase())}&productType=${encodeURIComponent(normalizedType)}`)
    .then(r => (r.ok ? r.json() : null))
    .then((data: LiveEVData | null) => {
      if (!data) return null;
      const enriched: LiveEVData = {
        ...data,
        evSegments: data.evSegments.map(s => ({
          ...s,
          color: COLOR_MAP[s.colorKey] ?? ChartColors.bulk,
        })),
      };
      cache.set(key, { data: enriched, ts: Date.now() });
      return enriched;
    })
    .catch(() => null)
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

export function useSetEV(setCode: string, productType = 'play-booster-box'): { loading: boolean; evData: LiveEVData | null } {
  const normalizedType = apiType(productType);
  const key = `${setCode.toUpperCase()}:${normalizedType}`;
  const cached = getCached(key);
  const [loading, setLoading] = useState(cached === null);
  const [evData, setEvData] = useState<LiveEVData | null>(cached);

  useEffect(() => {
    if (getCached(key) !== null) return;
    let active = true;
    setLoading(true);

    fetchEV(setCode, normalizedType, key)
      .then(result => { if (active) setEvData(result); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [key]);

  return { loading, evData };
}
