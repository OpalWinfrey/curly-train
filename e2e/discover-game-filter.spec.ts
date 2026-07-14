import { test, expect } from '@playwright/test';

// Uses only static PRODUCTS (10 items: 7 MTG + 3 Pokemon) by mocking both APIs.
// This test guards against regressions where the game field is missing or the
// MTG/Pokemon filter silently returns nothing.

test.beforeEach(async ({ page }) => {
  await page.route('https://api.scryfall.com/sets', route =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route('**/api/manapool-prices', route =>
    route.fulfill({ status: 403 })
  );
  await page.goto('/discover');
  // Wait for the product list to render at least one card
  await expect(page.getByText('Tarkir: Dragonstorm Play Booster Box')).toBeVisible();
});

test('All tab shows both MTG and Pokemon products', async ({ page }) => {
  await expect(page.getByText('Tarkir: Dragonstorm Play Booster Box')).toBeVisible();
  await expect(page.getByText('Prismatic Evolutions Elite Trainer Box')).toBeVisible();
});

test('MTG chip hides Pokemon products', async ({ page }) => {
  await page.getByText('MTG').click();
  await expect(page.getByText('Tarkir: Dragonstorm Play Booster Box')).toBeVisible();
  await expect(page.getByText('Prismatic Evolutions Elite Trainer Box')).not.toBeVisible();
});

test('Pokemon chip hides MTG products', async ({ page }) => {
  await page.getByText('Pokemon').click();
  await expect(page.getByText('Prismatic Evolutions Elite Trainer Box')).toBeVisible();
  await expect(page.getByText('Tarkir: Dragonstorm Play Booster Box')).not.toBeVisible();
});

test('All chip restores all products after filtering', async ({ page }) => {
  await page.getByText('MTG').click();
  await expect(page.getByText('Prismatic Evolutions Elite Trainer Box')).not.toBeVisible();
  await page.getByText('All').first().click();
  await expect(page.getByText('Prismatic Evolutions Elite Trainer Box')).toBeVisible();
  await expect(page.getByText('Tarkir: Dragonstorm Play Booster Box')).toBeVisible();
});
