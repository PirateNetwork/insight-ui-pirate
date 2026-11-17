import {humanSince, humanSinceDay, intlLocale} from './time';

describe('intlLocale', () => {
  it("turns the app's language codes into Intl locale tags", () => {
    expect(intlLocale('de_DE')).toBe('de-DE');
    expect(intlLocale('id_ID')).toBe('id-ID');
    expect(intlLocale('ru')).toBe('ru');
    expect(intlLocale('en')).toBe('en');
  });

  it('falls back to English for a language code Intl rejects', () => {
    expect(intlLocale('de_DE_x')).toBe('en');
    expect(intlLocale('not a locale!')).toBe('en');
    expect(() => humanSince(Date.now() / 1000 - 60, intlLocale('de_DE_x'))).not.toThrow();
  });

  it('defaults to English when no language is set', () => {
    expect(intlLocale(undefined)).toBe('en');
    expect(intlLocale('')).toBe('en');
  });
});

describe('humanSinceDay', () => {
  const now = Date.now() / 1000;

  it('describes past days as past, not future', () => {
    expect(humanSinceDay(now - 86400)).toBe('yesterday');
    expect(humanSinceDay(now - 3 * 86400)).toBe('3 days ago');
  });
});

describe('relative times follow the chosen language', () => {
  const now = Date.now() / 1000;

  it('formats in English by default', () => {
    expect(humanSince(now - 120)).toBe('2 minutes ago');
  });

  it('formats in the given locale', () => {
    expect(humanSince(now - 120, 'de-DE')).toBe('vor 2 Minuten');
    expect(humanSince(now - 120, 'es')).toBe('hace 2 minutos');
    // The Blocks page only uses this for past days ("Today" is its own label).
    expect(humanSinceDay(now - 86400, 'de-DE')).toBe('gestern');
  });
});
