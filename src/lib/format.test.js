import {describe, it, expect} from 'vitest';
import {formatSolutionRate} from './format';

describe('formatSolutionRate', () => {
  it('leaves small values in sols/s with no decimals', () => {
    expect(formatSolutionRate(512)).toBe('512 sols/s');
  });
  it('scales up to Ksols/s', () => {
    expect(formatSolutionRate(1500)).toBe('1.50 Ksols/s');
  });
  it('scales up to Msols/s', () => {
    expect(formatSolutionRate(8000000)).toBe('8.00 Msols/s');
  });
  it('scales up to Gsols/s', () => {
    expect(formatSolutionRate(2500000000)).toBe('2.50 Gsols/s');
  });
  it('returns an empty string for missing/invalid input', () => {
    expect(formatSolutionRate(null)).toBe('');
    expect(formatSolutionRate(undefined)).toBe('');
    expect(formatSolutionRate(NaN)).toBe('');
  });
});
