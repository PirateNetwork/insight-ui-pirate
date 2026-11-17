import de_DE from './de_DE.json';
import es from './es.json';
import id_ID from './id_ID.json';
import ja from './ja.json';
import ru from './ru.json';
import en from './en.json';
import i18next from '../i18n';
import {intlLocale} from '../lib/time';

const LOCALES = {de_DE, es, id_ID, ja, ru};

// Every string the UI passes to t() - found by scanning the source, so a
// new string without translations fails here instead of shipping in
// English. Names that read the same in every language are exempt.
const SOURCES = import.meta.glob(['../**/*.{js,jsx}', '!../**/*.test.{js,jsx}', '!../test/**'], {
  query: '?raw',
  import: 'default',
  eager: true
});
const UNTRANSLATED = new Set(['GitHub', 'Reddit', 'Telegram', 'X', 'Sprout', 'Sapling', 'Ironwood']);

// Keys are single-line string literals; matching within one line keeps a
// commented-out example like "t('Some\n// text')" from being picked up.
const T_CALL_SINGLE = /\bt\(\s*'((?:[^'\\\n]|\\.)*)'/g;
const T_CALL_DOUBLE = /\bt\(\s*"((?:[^"\\\n]|\\.)*)"/g;
const NAV_TITLE = /\{title: '([^'\n]+)', link/g;
const FOOTER_LINK = /\{name: '([^'\n]+)', href/g;

function matches(regex) {
  return Object.values(SOURCES).flatMap((code) => [...code.matchAll(regex)].map((m) => m[1]));
}

function sourceKeys() {
  const keys = new Set([
    ...matches(T_CALL_SINGLE).map((k) => k.replace(/\\'/g, "'")),
    ...matches(T_CALL_DOUBLE),
    ...matches(NAV_TITLE),
    ...matches(FOOTER_LINK),
    // POOL_LABELS in TxCard.jsx are translated through t(POOL_LABELS[key]).
    'Transparent'
  ]);
  return [...keys].filter((k) => !UNTRANSLATED.has(k)).sort();
}
const REQUIRED_KEYS = sourceKeys();

const placeholders = (s) => (s.match(/\{\{[\w.]+\}\}/g) || []).sort();

it('finds the UI strings to check', () => {
  // Fails if Header.jsx's MENU or Footer.jsx's link list is reformatted so
  // the patterns above stop seeing them.
  expect(matches(NAV_TITLE)).toEqual(['Blocks', 'Charts', 'Status', 'Peers', 'Stats']);
  expect(matches(FOOTER_LINK)).toEqual(['Website', 'GitHub', 'X', 'Telegram', 'Reddit']);
  expect(REQUIRED_KEYS.length).toBeGreaterThan(150);
  expect(REQUIRED_KEYS).toContain('{{name}} is live');
  expect(REQUIRED_KEYS).toContain('Charts');
  expect(REQUIRED_KEYS).toContain("Can't load peer list.");
});

// A key with a {{count}} is plural: the bundle holds one entry per plural
// form the language has (key_one, key_few, ... key_other), and i18next
// picks the form for the count.
const isPlural = (key) => key.includes('{{count}}');
const pluralForms = (lang) => new Intl.PluralRules(intlLocale(lang)).resolvedOptions().pluralCategories;
// Strips a plural suffix, so a form's placeholders compare with its key's.
const baseKey = (key) => key.replace(/_(zero|one|two|few|many|other)$/, '');

describe('en plural forms', () => {
  it.each(REQUIRED_KEYS.filter(isPlural))('has every English form of %j', (key) => {
    pluralForms('en').forEach((form) => expect(en[key + '_' + form]).toBeTruthy());
  });
});

describe.each(Object.entries(LOCALES))('%s locale', (name, strings) => {
  it.each(REQUIRED_KEYS)('translates %j', (key) => {
    if (isPlural(key)) {
      pluralForms(name).forEach((form) => expect([form, strings[key + '_' + form]]).toEqual([form, expect.any(String)]));
    } else {
      expect(strings[key]).toBeTruthy();
    }
  });

  it('contains no HTML markup (React renders translations as text)', () => {
    Object.entries(strings).forEach(([key, value]) => {
      expect([key, /<\/?[a-z][^>]*>/i.test(value)]).toEqual([key, false]);
    });
  });

  it('keeps every {{placeholder}} of the English text', () => {
    Object.entries(strings).forEach(([key, value]) => {
      expect([key, placeholders(value)]).toEqual([key, placeholders(baseKey(key))]);
    });
  });
});

describe('interpolation through i18next', () => {
  afterEach(() => i18next.changeLanguage('en'));

  it('fills in the upgrade name and block height', async () => {
    await i18next.changeLanguage('de_DE');
    expect(i18next.t('{{name}} is live', {name: 'Ironwood'})).toBe('Ironwood ist aktiv');
    expect(i18next.t('Activated at block {{height}}', {height: 4161185})).toBe('Aktiviert bei Block 4161185');
  });

  it('uses the right plural form for each count', async () => {
    const say = (key, count) => i18next.t(key, {count});

    expect(say('{{count}} input', 1)).toBe('1 input');
    expect(say('{{count}} input', 3)).toBe('3 inputs');
    expect(say('{{count}} blocks remaining', 1)).toBe('1 block remaining');
    expect(say('{{count}} blocks remaining', 2500)).toBe('2500 blocks remaining');

    await i18next.changeLanguage('ru');
    expect(say('{{count}} spend', 1)).toBe('1 расход');
    expect(say('{{count}} spend', 3)).toBe('3 расхода');
    expect(say('{{count}} spend', 5)).toBe('5 расходов');
    expect(say('{{count}} spend', 21)).toBe('21 расход');
    expect(say('{{count}} blocks remaining', 1)).toBe('остался 1 блок');
    expect(say('{{count}} blocks remaining', 2500)).toBe('осталось 2500 блоков');
    expect(say('{{count}} blocks remaining', 22)).toBe('осталось 22 блока');

    await i18next.changeLanguage('de_DE');
    expect(say('{{count}} action', 1)).toBe('1 Aktion');
    expect(say('{{count}} action', 4)).toBe('4 Aktionen');

    await i18next.changeLanguage('es');
    expect(say('{{count}} output', 1)).toBe('1 salida');
    expect(say('{{count}} output', 2)).toBe('2 salidas');
    expect(say('{{count}} output', 1000000)).toBe('1000000 salidas');

    await i18next.changeLanguage('ja');
    expect(say('{{count}} input', 1)).toBe('入力 1 件');
    expect(say('{{count}} input', 7)).toBe('入力 7 件');
  });
});
