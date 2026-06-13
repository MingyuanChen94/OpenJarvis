import { describe, expect, it } from 'vitest';
import { formatEnergy, formatNumber, formatUsd } from '@/lib/format';

describe('formatUsd', () => {
  it('formats small amounts with cents', () => {
    expect(formatUsd(12.5)).toBe('$12.50');
  });
  it('compacts thousands', () => {
    expect(formatUsd(2500)).toBe('$2.5k');
  });
  it('handles nullish', () => {
    expect(formatUsd(undefined)).toBe('$0.00');
  });
});

describe('formatNumber', () => {
  it('passes through small numbers', () => {
    expect(formatNumber(950)).toBe('950');
  });
  it('compacts thousands and millions', () => {
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(2_000_000)).toBe('2.0M');
  });
});

describe('formatEnergy', () => {
  it('uses joules below an hour-watt', () => {
    expect(formatEnergy(500)).toBe('500 J');
  });
  it('switches to watt-hours', () => {
    expect(formatEnergy(3600)).toBe('1.00 Wh');
  });
});
