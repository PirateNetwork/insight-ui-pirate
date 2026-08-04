import {describe, it, expect} from 'vitest';
import {roundFloat, convert} from './currency';

describe('roundFloat', () => {
  it('rounds to n decimal places', () => {
    expect(roundFloat(1.23456, 2)).toBe(1.23);
  });
  it('defaults to 0 decimal places for invalid n', () => {
    expect(roundFloat(1.7, 'x')).toBe(2);
  });
  it('propagates NaN for a non-numeric value (matches the original behavior)', () => {
    expect(roundFloat('not a number', 2)).toBeNaN();
  });
});

describe('convert', () => {
  const netSymbol = 'ARRR';

  it('returns "value error" for NaN input', () => {
    expect(convert(NaN, {symbol: netSymbol, factor: 1, netSymbol})).toBe('value error');
  });

  it('returns "0 <symbol>" for a zero value without rounding artifacts', () => {
    expect(convert(0, {symbol: netSymbol, factor: 1, netSymbol})).toBe('0 ' + netSymbol);
  });

  it('passes the native unit through unscaled', () => {
    expect(convert(1.5, {symbol: netSymbol, factor: 1, netSymbol})).toBe('1.5 ' + netSymbol);
  });

  it('converts to USD using the pre-fetched factor, rounded to 2dp', () => {
    expect(convert(2, {symbol: 'USD', factor: 0.12345, netSymbol})).toBe('0.25 USD');
  });

  it('converts to the milli-unit (factor 1000), rounded to 5dp', () => {
    expect(convert(0.000001234567, {symbol: 'm' + netSymbol, factor: 1, netSymbol})).toBe('0.00123 m' + netSymbol);
  });

  it('converts to bits (factor 1e6), rounded to 2dp', () => {
    expect(convert(0.000001234567, {symbol: 'bits', factor: 1, netSymbol})).toBe('1.23 bits');
  });

  it('avoids scientific notation for very small results', () => {
    const result = convert(0.00000000005, {symbol: netSymbol, factor: 1, netSymbol});
    expect(result).not.toMatch(/e-/);
  });
});
