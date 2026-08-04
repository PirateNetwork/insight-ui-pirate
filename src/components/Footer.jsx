import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getVersion} from '../api/status';

const AVAILABLE_LANGUAGES = [
  {name: 'English', isoCode: 'en'},
  {name: 'Deutsch', isoCode: 'de_DE'},
  {name: 'Русский', isoCode: 'ru'},
  {name: 'Spanish', isoCode: 'es'},
  {name: 'Bahasa Indonesia', isoCode: 'id_ID'},
  {name: 'Japanese', isoCode: 'ja'}
];

export default function Footer() {
  const {t, i18n} = useTranslation();
  const [version, setVersion] = useState('');

  useEffect(() => {
    getVersion().then((res) => setVersion(res.version));
  }, []);

  function setLanguage(isoCode) {
    i18n.changeLanguage(isoCode);
    localStorage.setItem('insight-language', isoCode);
  }

  return (
    <div id="footer" role="navigation">
      <div className="container">
        <div className="links m20t pull-left">
          <span className="languages">
            [
            {AVAILABLE_LANGUAGES.map((l, i) => (
              <a
                key={l.isoCode}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLanguage(l.isoCode);
                }}
                className={i18n.language === l.isoCode ? 'selected' : ''}
              >
                {i > 0 && <span> &middot; </span>}
                {l.name}
              </a>
            ))}
            ]
          </span>
          &nbsp; [<Link to="/messages/verify">{t('verify message')}</Link>
          <span> &middot; </span>
          <Link to="/tx/send">{t('broadcast transaction')}</Link>]
        </div>
        <a className="insight m10v pull-right" target="_blank" rel="noreferrer" href="http://insight.is">
          insight <small>API v{version}</small>
        </a>
      </div>
    </div>
  );
}
