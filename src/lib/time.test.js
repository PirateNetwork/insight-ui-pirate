import {describe, it, expect} from 'vitest';
import {formatDuration} from './time';

describe('formatDuration', () => {
  it('shows only seconds under a minute', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(5)).toBe('05s');
  });

  it('shows minutes and seconds under an hour', () => {
    expect(formatDuration(125)).toBe('02m 05s');
  });

  it('shows hours, minutes, and seconds under a day', () => {
    expect(formatDuration(3725)).toBe('01h 02m 05s');
  });

  it('shows days once past 24 hours', () => {
    expect(formatDuration(90061)).toBe('1d 01h 01m 01s');
  });

  it('clamps negative or zero input to 00s', () => {
    expect(formatDuration(0)).toBe('00s');
    expect(formatDuration(-50)).toBe('00s');
  });
});
