import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import de_DE from './locales/de_DE.json';
import en from './locales/en.json';
import es from './locales/es.json';
import id_ID from './locales/id_ID.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';

// English is the source language throughout the app (each key is the
// English text), so i18next falls back to the key itself when a key is
// missing from the active language's bundle. English's bundle holds only
// plural forms: a count-aware key like '{{count}} input' resolves to
// '{{count}} input_one' / '_other' (and _few/_many in languages that have
// them), picked by Intl.PluralRules for the count.
// The other 5 languages were mechanically extracted from
// legacy/src/js/translations.js (see /tmp/extract_i18n.cjs in this
// session) - that file is a flat key->value catalog per language, not
// real gettext plural/context features, so this is a lossless port.
i18next.use(initReactI18next).init({
  lng: localStorage.getItem('insight-language') || 'en',
  fallbackLng: 'en',
  resources: {
    en: {translation: en},
    de_DE: {translation: de_DE},
    es: {translation: es},
    id_ID: {translation: id_ID},
    ja: {translation: ja},
    ru: {translation: ru}
  },
  interpolation: {escapeValue: false},
  returnEmptyString: false
});

export default i18next;
