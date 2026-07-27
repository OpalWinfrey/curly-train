import { describe, it, expect } from 'vitest';
import { inferProductType } from '../data/productCatalog';

describe('inferProductType', () => {
  it('detects collector booster box', () => {
    expect(inferProductType('Phyrexia: All Will Be One Collector Booster Box')).toBe('collector-booster-box');
  });
  it('detects play booster box', () => {
    expect(inferProductType('March of the Machine Play Booster Box')).toBe('play-booster-box');
  });
  it('detects plain "Booster Box" as play booster box', () => {
    expect(inferProductType('Dominaria United Booster Box')).toBe('play-booster-box');
  });
  it('detects set booster box', () => {
    expect(inferProductType('Streets of New Capenna Set Booster Box')).toBe('set-booster-box');
  });
  it('detects draft booster box', () => {
    expect(inferProductType('Innistrad: Midnight Hunt Draft Booster Box')).toBe('draft-booster-box');
  });
  it('detects bundle', () => {
    expect(inferProductType('The Lord of the Rings: Tales of Middle-earth Bundle')).toBe('bundle');
  });
  it('detects commander deck', () => {
    expect(inferProductType('Commander Legends: Battle for Baldur\'s Gate Commander Deck')).toBe('commander-deck');
  });
  it('detects secret lair', () => {
    expect(inferProductType('Secret Lair Drop: Artist Series: Magali Villeneuve')).toBe('secret-lair');
  });
  it('detects collector booster case (display)', () => {
    expect(inferProductType('Murders at Karlov Manor Collector Booster Display')).toBe('collector-booster-case');
  });
  it('detects play booster case (display)', () => {
    expect(inferProductType('Bloomburrow Play Booster Display')).toBe('play-booster-case');
  });
  it('detects play booster case (6-box)', () => {
    expect(inferProductType('Some Set Play Booster Box 6-Box Case')).toBe('play-booster-case');
  });
  it('returns null for unrecognized names', () => {
    expect(inferProductType('Random Product Name')).toBeNull();
  });
  it('returns null for empty string', () => {
    expect(inferProductType('')).toBeNull();
  });
});
