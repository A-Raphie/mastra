import { describe, expect, it } from 'vitest';
import { formatAxisCount, formatAxisDuration, formatCount, formatDuration } from './chart-format';

describe('formatCount', () => {
  it.each([
    [812, '812'],
    [1_250, '1.25K'],
    [34_500, '34.5K'],
    [1_200_000, '1.2M'],
    [13_036_900_000, '13.0B'],
  ])('formats %d as %s', (value, text) => {
    expect(formatCount(value)).toBe(text);
  });
});

describe('formatAxisCount', () => {
  it.each([
    [600, '600'],
    [4_500, '4.5K'],
    [1_200_000, '1.2M'],
    [13_000_000_000, '13B'],
  ])('formats %d as %s', (value, text) => {
    expect(formatAxisCount(value)).toBe(text);
  });
});

describe('formatDuration', () => {
  it.each([
    [84, '84ms'],
    [1_250, '1.25s'],
    [12_400, '12.4s'],
    [270_000, '4.5m'],
    [12_817_100, '3.6h'],
  ])('formats %dms as %s', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});

describe('formatAxisDuration', () => {
  it.each([
    [250, '250ms'],
    [1_500, '1.5s'],
    [270_000, '4.5m'],
    [10_800_000, '3h'],
  ])('formats %dms as %s', (ms, text) => {
    expect(formatAxisDuration(ms)).toBe(text);
  });
});
