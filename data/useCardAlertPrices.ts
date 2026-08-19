import { useEffect, useState } from 'react';
import { fetchSinglePrices, type SinglePriceInfo } from './manapool';
import type { CardAlert } from './types';

export interface CardAlertWithPrice {
  alert: CardAlert;
  currentPriceCents: number | null;
  availableQuantity: number;
  triggered: boolean;
}

const CHUNK_SIZE = 100; // Manapool's max scryfall_ids per /products/singles call

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Checks the current Manapool price for each card alert. Runs when the alert list changes (i.e. on open of the Alerts tab). */
export function useCardAlertPrices(alerts: CardAlert[]): { loading: boolean; results: CardAlertWithPrice[] } {
  const [priceMap, setPriceMap] = useState<Map<string, SinglePriceInfo>>(new Map());
  const [loading, setLoading] = useState(alerts.length > 0);

  const idsKey = [...new Set(alerts.map(a => a.scryfallId))].sort().join(',');

  useEffect(() => {
    if (!idsKey) { setPriceMap(new Map()); setLoading(false); return; }
    let active = true;
    setLoading(true);

    const ids = idsKey.split(',');
    Promise.all(chunk(ids, CHUNK_SIZE).map(batch => fetchSinglePrices(batch)))
      .then(maps => {
        if (!active) return;
        const merged = new Map<string, SinglePriceInfo>();
        for (const m of maps) for (const [id, info] of m) merged.set(id, info);
        setPriceMap(merged);
      })
      .catch(() => { if (active) setPriceMap(new Map()); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [idsKey]);

  const results: CardAlertWithPrice[] = alerts.map(alert => {
    const info = priceMap.get(alert.scryfallId);
    const currentPriceCents = info ? (alert.finish === 'foil' ? info.foilLowCents : info.nonfoilLowCents) : null;
    return {
      alert,
      currentPriceCents,
      availableQuantity: info?.availableQuantity ?? 0,
      triggered: currentPriceCents != null && currentPriceCents <= alert.targetPriceCents,
    };
  });

  return { loading, results };
}
