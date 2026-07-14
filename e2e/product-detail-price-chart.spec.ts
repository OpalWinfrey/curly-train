import { test, expect } from '@playwright/test';

// Guards the fix for: Scryfall-derived products had priceHistory:makeHistory(100,'flat')
// while currentMarketPrice was 0, causing a fake $100 chart to appear on the detail screen.
// After the fix, priceHistory is [] for unpriced products and the section is hidden.

const SCRYFALL_STUB = {
  data: [
    { code: 'tst', name: 'Test Set', set_type: 'expansion', released_at: '2024-01-01' },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('https://api.scryfall.com/sets', route =>
    route.fulfill({ json: SCRYFALL_STUB })
  );
  await page.route('**/api/manapool-prices', route =>
    route.fulfill({ status: 403 })
  );
});

test('Scryfall-only product detail hides Price History section', async ({ page }) => {
  await page.goto('/discover');
  // Wait for the Scryfall-derived product to appear after loadProducts resolves
  await expect(page.getByText('Test Set Play Booster Box')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Test Set Play Booster Box').click();

  // "Price History" tab and "30-Day Trend" eyebrow must not be visible
  await expect(page.getByText('30-Day Trend')).not.toBeVisible();
  await expect(page.getByText('Price History')).not.toBeVisible();
});

test('Static product with real price history shows Price History section', async ({ page }) => {
  await page.goto('/discover');
  await expect(page.getByText('Tarkir: Dragonstorm Play Booster Box')).toBeVisible();
  await page.getByText('Tarkir: Dragonstorm Play Booster Box').click();

  // Static products have makeHistory(price, ...) which is non-empty
  await expect(page.getByText('Price History')).toBeVisible();
});
