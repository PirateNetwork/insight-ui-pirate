import {describe, it, expect} from 'vitest';
import {roundFloat, convertParts, currencyOptions, normalizeStoredSymbol} from './currency';

// The amount as the page shows it: number, space, unit.
function convert(value, state) {
  const {amount, unit} = convertParts(value, state);
  return unit ? amount + ' ' + unit : amount;
}

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

describe('convertParts, as displayed', () => {
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

  it('falls back to the native unit while the USD rate is unknown or zero', () => {
    expect(convert(2, {symbol: 'USD', factor: 0, netSymbol})).toBe('2 ' + netSymbol);
    expect(convert(2, {symbol: 'USD', factor: undefined, netSymbol})).toBe('2 ' + netSymbol);
    expect(convert(0, {symbol: 'USD', factor: 0, netSymbol})).toBe('0 ' + netSymbol);
  });

  it('converts to USD using the pre-fetched factor, rounded to 2dp', () => {
    expect(convert(2, {symbol: 'USD', factor: 0.12345, netSymbol})).toBe('0.25 USD');
  });

  it('converts to the milli-unit (factor 1000), rounded to 5dp', () => {
    expect(convert(0.000001234567, {symbol: 'm' + netSymbol, factor: 1, netSymbol})).toBe('0.00123 m' + netSymbol);
  });

  it('avoids scientific notation for very small results', () => {
    const result = convert(0.00000000005, {symbol: netSymbol, factor: 1, netSymbol});
    expect(result).not.toMatch(/e-/);
  });
});

describe('currencyOptions', () => {
  it('offers USD, the native unit and its milli-unit', () => {
    expect(currencyOptions('ARRR')).toEqual(['USD', 'ARRR', 'mARRR']);
  });
});

describe('normalizeStoredSymbol', () => {
  it('defaults to the native unit when nothing is saved', () => {
    expect(normalizeStoredSymbol(null, 'ARRR')).toBe('ARRR');
  });

  it('keeps a saved choice that is still offered', () => {
    expect(normalizeStoredSymbol('USD', 'ARRR')).toBe('USD');
    expect(normalizeStoredSymbol('ARRR', 'ARRR')).toBe('ARRR');
    expect(normalizeStoredSymbol('mARRR', 'ARRR')).toBe('mARRR');
  });

  it('maps the retired PIRATE labels onto ARRR', () => {
    expect(normalizeStoredSymbol('PIRATE', 'ARRR')).toBe('ARRR');
    expect(normalizeStoredSymbol('mPIRATE', 'ARRR')).toBe('mARRR');
  });

  it('falls back to the native unit for retired or unknown units', () => {
    expect(normalizeStoredSymbol('bits', 'ARRR')).toBe('ARRR');
    expect(normalizeStoredSymbol('KMD', 'ARRR')).toBe('ARRR');
    expect(normalizeStoredSymbol('', 'ARRR')).toBe('ARRR');
  });
});

describe('convertParts', () => {
  const netSymbol = 'ARRR';

  it('separates the amount from the unit', () => {
    expect(convertParts(0.25, {symbol: netSymbol, factor: 1, netSymbol})).toEqual({amount: '0.25', unit: 'ARRR'});
    expect(convertParts(2, {symbol: 'USD', factor: 0.12345, netSymbol})).toEqual({amount: '0.25', unit: 'USD'});
  });

  it('gives zero its unit too', () => {
    expect(convertParts(0, {symbol: netSymbol, factor: 1, netSymbol})).toEqual({amount: '0', unit: 'ARRR'});
  });

  it('has no unit for an unconvertible value', () => {
    expect(convertParts('nope', {symbol: netSymbol, factor: 1, netSymbol})).toEqual({amount: 'value error', unit: ''});
  });
});
