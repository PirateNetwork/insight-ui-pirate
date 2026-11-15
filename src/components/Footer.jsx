import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const AVAILABLE_LANGUAGES = [
  {name: 'English', isoCode: 'en'},
  {name: 'Deutsch', isoCode: 'de_DE'},
  {name: 'Русский', isoCode: 'ru'},
  {name: 'Español', isoCode: 'es'},
  {name: 'Bahasa Indonesia', isoCode: 'id_ID'},
  {name: '日本語', isoCode: 'ja'}
];

// Official Pirate Chain channels, as linked from piratechain.com.
const PIRATE_CHAIN_LINKS = [
  {name: 'Website', href: 'https://piratechain.com'},
  {name: 'GitHub', href: 'https://github.com/PirateNetwork'},
  {name: 'X', href: 'https://x.com/PirateChain'},
  {name: 'Telegram', href: 'https://t.me/piratechain'},
  {name: 'Reddit', href: 'https://www.reddit.com/r/piratechain'}
];

export default function Footer() {
  const {t, i18n} = useTranslation();

  function setLanguage(isoCode) {
    i18n.changeLanguage(isoCode);
    localStorage.setItem('insight-language', isoCode);
  }

  return (
    <footer id="footer">
      <div className="container">
        <div className="footer-row">
          <Link to="/" className="footer-brand">
            <img src="/img/logo-mark.svg" alt="" aria-hidden="true" />
            Pirate Chain Explorer
          </Link>
          <nav className="footer-links" aria-label="Pirate Chain">
            {PIRATE_CHAIN_LINKS.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                {t(l.name)}
              </a>
            ))}
          </nav>
        </div>
        <div className="footer-row footer-row-secondary">
          <div className="footer-languages">
            {AVAILABLE_LANGUAGES.map((l) => (
              <button
                type="button"
                key={l.isoCode}
                onClick={() => setLanguage(l.isoCode)}
                className={i18n.language === l.isoCode ? 'selected' : ''}
                aria-pressed={i18n.language === l.isoCode}
              >
                {l.name}
              </button>
            ))}
          </div>
          <div className="footer-tools">
            <Link to="/messages/verify">{t('Verify message')}</Link>
            <Link to="/tx/send">{t('Broadcast transaction')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
